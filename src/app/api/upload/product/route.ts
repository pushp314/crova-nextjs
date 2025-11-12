import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireRole } from '@/lib/rbac';
import formidable, { File as FormidableFile, Fields, Files } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import { Readable } from 'stream';

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

// Convert Web Request body to Node.js Readable stream
function webStreamToNodeStream(webStream: ReadableStream<Uint8Array>): Readable {
  const reader = webStream.getReader();
  return new Readable({
    async read() {
      try {
        const { done, value } = await reader.read();
        if (done) {
          this.push(null);
        } else {
          this.push(Buffer.from(value));
        }
      } catch (error) {
        this.destroy(error as Error);
      }
    },
  });
}

// Parse multipart form data with formidable
async function parseProductImages(
  req: NextRequest
): Promise<{ fields: Fields; files: Files }> {
  await ensureUploadDir(BASE_UPLOAD_DIR);

  const form = formidable({
    uploadDir: BASE_UPLOAD_DIR,
    keepExtensions: true,
    maxFileSize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES,
    multiples: true,
    filename: (name, ext, part) => {
      // Generate unique filename: productname-timestamp-random.ext
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const sanitizedName = part.originalFilename
        ?.replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_{2,}/g, '_') || 'product';
      
      const extension = path.extname(sanitizedName) || ext;
      const basename = path.basename(sanitizedName, path.extname(sanitizedName));
      
      return `${basename}-${uniqueSuffix}${extension}`;
    },
    filter: (part) => {
      // Validate MIME type during upload
      const mimeType = part.mimetype || '';
      return ALLOWED_TYPES.includes(mimeType);
    },
  });

  // Convert Web ReadableStream to Node.js stream
  const nodeStream = webStreamToNodeStream(req.body as ReadableStream<Uint8Array>);

  return new Promise((resolve, reject) => {
    form.parse(nodeStream as any, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
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
    const { files } = await parseProductImages(req);

    // 4. Extract uploaded files
    const uploadedFiles = files.file || files.files || files.images || [];
    const fileArray = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles];

    if (fileArray.length === 0) {
      return NextResponse.json(
        { error: 'No Files', message: 'No files were uploaded.' }, 
        { status: 400 }
      );
    }

    if (fileArray.length > MAX_FILES) {
      // Delete all uploaded files
      for (const file of fileArray) {
        if (file && typeof file === 'object') {
          const formFile = file as FormidableFile;
          try {
            await fs.unlink(formFile.filepath);
          } catch {}
        }
      }

      return NextResponse.json(
        { error: 'Too Many Files', message: `Maximum ${MAX_FILES} files allowed.` },
        { status: 400 }
      );
    }

    // 5. Validate and process files
    const validatedFilenames: string[] = [];

    for (const file of fileArray) {
      if (!file || typeof file !== 'object') continue;

      const formFile = file as FormidableFile;

      // Validate file extension
      const ext = path.extname(formFile.originalFilename || '').toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        // Delete invalid file
        try {
          await fs.unlink(formFile.filepath);
        } catch {}

        // Delete already processed files
        for (const filename of validatedFilenames) {
          try {
            await fs.unlink(path.join(BASE_UPLOAD_DIR, filename));
          } catch {}
        }

        return NextResponse.json(
          {
            error: 'Invalid File Type',
            message: `File type ${ext} not allowed. Only JPG, PNG, and WebP are supported.`,
          },
          { status: 415 }
        );
      }

      // Validate file size
      if (formFile.size > MAX_FILE_SIZE) {
        // Delete oversized file
        try {
          await fs.unlink(formFile.filepath);
        } catch {}

        // Delete already processed files
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

      // Extract just the filename (not full path)
      const filename = path.basename(formFile.filepath);
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

    // Handle specific formidable errors
    if (error.message?.includes('maxFileSize') || error.code === 'LIMIT_FILE_SIZE') {
      return NextResponse.json(
        { 
          error: 'File Too Large',
          message: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.` 
        }, 
        { status: 413 }
      );
    }

    if (error.message?.includes('maxFiles')) {
      return NextResponse.json(
        { 
          error: 'Too Many Files',
          message: `Maximum ${MAX_FILES} files allowed.` 
        }, 
        { status: 400 }
      );
    }

    if (error.message?.includes('unsupported') || error.message?.includes('filter')) {
      return NextResponse.json(
        { 
          error: 'Unsupported File Type',
          message: 'Only JPEG, PNG, and WebP images are allowed.' 
        }, 
        { status: 415 }
      );
    }

    // Generic error
    return NextResponse.json(
      { 
        error: 'Upload Failed',
        message: 'An error occurred during upload. Please try again.' 
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
