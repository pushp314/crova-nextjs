import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { isAdmin, isDelivery } from '@/lib/rbac';
import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';

// Configuration
const BASE_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
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

// Save uploaded file to disk
async function saveFile(file: File, uploadDir: string): Promise<string> {
  await ensureUploadDir(uploadDir);

  const buffer = Buffer.from(await file.arrayBuffer());

  // Generate unique filename
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const sanitizedName = file.name
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_') || 'upload';

  const extension = path.extname(sanitizedName);
  const basename = path.basename(sanitizedName, extension);
  const filename = `${basename}-${uniqueSuffix}${extension}`;

  const filepath = path.join(uploadDir, filename);
  await fs.writeFile(filepath, buffer);

  return filename;
}

/**
 * POST /api/upload?bucket=<bucket_name>
 * 
 * Upload files to local VPS storage with bucket organization
 * Supports: products, banners, proofs, avatars
 * 
 * @access ADMIN (for most buckets), DELIVERY (for proofs)
 * @body multipart/form-data with file(s)
 * @returns { url: string } or { urls: string[] }
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authentication
    const session = await getCurrentUser();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please login to upload files.' },
        { status: 401 }
      );
    }

    // 2. Get bucket parameter
    const { searchParams } = new URL(req.url);
    const bucket = searchParams.get('bucket') || 'default';

    // 3. Authorization based on bucket
    if (bucket === 'banners' && !isAdmin(session)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only admins can upload banners.' },
        { status: 403 }
      );
    }
    if (bucket === 'proofs' && !isDelivery(session) && !isAdmin(session)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only admins or delivery users can upload proofs.' },
        { status: 403 }
      );
    }
    if ((bucket === 'products' || bucket === 'default') && !isAdmin(session)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required.' },
        { status: 403 }
      );
    }

    // 4. Verify content type
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Invalid Content-Type', message: 'Must be multipart/form-data' },
        { status: 400 }
      );
    }

    // 5. Setup upload directory with date organization
    const year = new Date().getFullYear().toString();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const uploadDir = path.join(BASE_UPLOAD_DIR, bucket, year, month);

    // 6. Parse form data
    const formData = await req.formData();
    const files: File[] = [];

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No Files', message: 'No files were uploaded.' },
        { status: 400 }
      );
    }

    // 7. Validate and save files using Sharp
    const validatedUrls: string[] = [];

    for (const file of files) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());

        // Initialize sharp instance
        const image = sharp(buffer);
        const metadata = await image.metadata();

        // Validate that it is a real image
        if (!metadata.format || !['jpeg', 'jpg', 'png', 'webp'].includes(metadata.format)) {
          throw new Error('Invalid image format detected by processing engine.');
        }

        // Optional: limit dimensions to prevent massive pixel bombs
        if ((metadata.width && metadata.width > 4096) || (metadata.height && metadata.height > 4096)) {
          // Resize if too large, maintaining aspect ratio
          image.resize(4096, 4096, { fit: 'inside' });
        }

        // Re-encode image to strip metadata and ensure safety
        // We start with the original format, or convert to webp if preferred. 
        // Let's stick to the detected format or default to jpeg/png as appropriate, 
        // but for simplicity and safety, we can standardize on the output extension or respect input.
        // Here we just re-process to buffer to sanitize it.

        const processedBuffer = await image.toBuffer();

        // Generate safe filename with correct extension from metadata
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const originalName = file.name.replace(/\.[^/.]+$/, ""); // strip extension
        const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 50) || 'image';

        // Ensure extension matches the actual format
        const ext = metadata.format === 'jpeg' ? '.jpg' : `.${metadata.format}`;
        const filename = `${sanitizedName}-${uniqueSuffix}${ext}`;
        const filepath = path.join(uploadDir, filename);

        await fs.writeFile(filepath, processedBuffer);

        const publicUrl = `/uploads/${bucket}/${year}/${month}/${filename}`;
        validatedUrls.push(publicUrl);

      } catch (err) {
        // Clean up any successfully uploaded files from this batch if one fails? 
        // Or just report error for this one? 
        // The original code failed the whole batch. Let's stick to that safety.
        console.error('Image processing error:', err);

        // Cleanup
        for (const url of validatedUrls) {
          const fp = path.join(process.cwd(), 'public', url);
          await fs.unlink(fp).catch(() => { });
        }

        return NextResponse.json(
          {
            error: 'Invalid Image',
            message: 'File is not a valid image or is corrupted.',
          },
          { status: 415 }
        );
      }
    }

    // 9. Return response
    if (validatedUrls.length === 1) {
      // Single file upload - return url
      return NextResponse.json(
        {
          url: validatedUrls[0],
          success: true,
          message: 'File uploaded successfully.',
        },
        { status: 200 }
      );
    } else {
      // Multiple files - return urls array
      return NextResponse.json(
        {
          urls: validatedUrls,
          count: validatedUrls.length,
          success: true,
          message: `Successfully uploaded ${validatedUrls.length} file(s).`,
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error('[UPLOAD_ERROR]', error);

    // Handle specific formidable errors
    if (error.message?.includes('maxFileSize') || error.code === 'LIMIT_FILE_SIZE') {
      return NextResponse.json(
        {
          error: 'File Too Large',
          message: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.`,
        },
        { status: 413 }
      );
    }

    if (error.message?.includes('unsupported') || error.message?.includes('filter')) {
      return NextResponse.json(
        {
          error: 'Unsupported File Type',
          message: 'Only JPEG, PNG, and WebP images are allowed.',
        },
        { status: 415 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: 'Upload Failed',
        message: 'An error occurred during upload. Please try again.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload
 * 
 * Get upload configuration info
 */
export async function GET() {
  return NextResponse.json({
    maxFileSize: MAX_FILE_SIZE,
    maxFileSizeMB: MAX_FILE_SIZE / (1024 * 1024),
    allowedTypes: ALLOWED_TYPES,
    allowedExtensions: ALLOWED_EXTENSIONS,
    supportedBuckets: ['products', 'banners', 'proofs', 'avatars', 'default'],
  });
}
