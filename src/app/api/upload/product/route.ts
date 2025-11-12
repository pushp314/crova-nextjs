import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireRole } from '@/lib/rbac';
import { promises as fs } from 'fs';
import path from 'path';

// Configuration
const BASE_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'products');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 6;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// Ensure upload directory exists
async function ensureUploadDir(dirPath: string) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// Parse multipart form data using native FormData API
async function parseProductImages(
  req: NextRequest
): Promise<File[]> {
  await ensureUploadDir(BASE_UPLOAD_DIR);

  try {
    const formData = await req.formData();
    const files: File[] = [];

    // Get all files from the formData
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files.push(value);
      }
    }

    return files;
  } catch (error) {
    throw new Error('Failed to parse form data');
  }
}

// Save uploaded file to disk
async function saveFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  
  // Generate unique filename
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const sanitizedName = file.name
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_');
  
  const extension = path.extname(sanitizedName);
  const basename = path.basename(sanitizedName, extension);
  const filename = `${basename}-${uniqueSuffix}${extension}`;
  
  const filepath = path.join(BASE_UPLOAD_DIR, filename);
  await fs.writeFile(filepath, buffer);
  
  return filename;
}

/**
 * POST /api/upload/product
 * 
 * Upload multiple product images (up to 6)
 * Returns filenames only (not full paths) for database storage
 * 
 * @access ADMIN only
 * @body multipart/form-data with files
 * @returns { filenames: string[], count: number } - Array of uploaded image filenames
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate and authorize
    const session = await getCurrentUser();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please login to upload images.' }, 
        { status: 401 }
      );
    }

    // Require ADMIN role
    try {
      requireRole(session, ['ADMIN']);
    } catch (error) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required.' }, 
        { status: 403 }
      );
    }

    // 2. Verify content type
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Invalid Content-Type', message: 'Must be multipart/form-data' },
        { status: 400 }
      );
    }

    // 3. Parse multipart form data
    const files = await parseProductImages(req);

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No Files', message: 'No files were uploaded.' }, 
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: 'Too Many Files', message: `Maximum ${MAX_FILES} files allowed.` },
        { status: 400 }
      );
    }

    // 4. Validate and save files
    const validatedFilenames: string[] = [];

    for (const file of files) {
      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        // Clean up already saved files
        for (const filename of validatedFilenames) {
          try {
            await fs.unlink(path.join(BASE_UPLOAD_DIR, filename));
          } catch {}
        }

        return NextResponse.json(
          {
            error: 'Invalid File Type',
            message: `File type not allowed. Only JPEG, PNG, and WebP are supported.`,
          },
          { status: 415 }
        );
      }

      // Validate file extension
      const ext = path.extname(file.name).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        // Clean up already saved files
        for (const filename of validatedFilenames) {
          try {
            await fs.unlink(path.join(BASE_UPLOAD_DIR, filename));
          } catch {}
        }

        return NextResponse.json(
          {
            error: 'Invalid File Type',
            message: `File extension ${ext} not allowed. Only JPG, PNG, and WebP are supported.`,
          },
          { status: 415 }
        );
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        // Clean up already saved files
        for (const filename of validatedFilenames) {
          try {
            await fs.unlink(path.join(BASE_UPLOAD_DIR, filename));
          } catch {}
        }

        return NextResponse.json(
          {
            error: 'File Too Large',
            message: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.`,
          },
          { status: 413 }
        );
      }

      // Save file to disk
      const filename = await saveFile(file);
      validatedFilenames.push(filename);
    }

    // 6. Return filenames only (frontend will construct full paths)
    return NextResponse.json(
      { 
        filenames: validatedFilenames,
        count: validatedFilenames.length,
        success: true,
        message: `Successfully uploaded ${validatedFilenames.length} image(s).`,
      }, 
      { status: 200 }
    );

  } catch (error: any) {
    console.error('[PRODUCT_UPLOAD_ERROR]', error);

    // Handle specific errors
    if (error.message?.includes('File size exceeds')) {
      return NextResponse.json(
        { 
          error: 'File Too Large',
          message: error.message
        }, 
        { status: 413 }
      );
    }

    if (error.message?.includes('Too Many Files')) {
      return NextResponse.json(
        { 
          error: 'Too Many Files',
          message: error.message
        }, 
        { status: 400 }
      );
    }

    if (error.message?.includes('File type') || error.message?.includes('extension')) {
      return NextResponse.json(
        { 
          error: 'Unsupported File Type',
          message: error.message
        }, 
        { status: 415 }
      );
    }

    // Generic error
    return NextResponse.json(
      { 
        error: 'Upload Failed',
        message: error.message || 'An error occurred during upload. Please try again.' 
      }, 
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload/product
 * 
 * Get product upload configuration info
 */
export async function GET() {
  return NextResponse.json({
    maxFileSize: MAX_FILE_SIZE,
    maxFileSizeMB: MAX_FILE_SIZE / (1024 * 1024),
    maxFiles: MAX_FILES,
    allowedTypes: ALLOWED_TYPES,
    allowedExtensions: ALLOWED_EXTENSIONS,
    uploadPath: '/uploads/products/',
  });
}
