import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import formidable, { File as FormidableFile, Fields, Files } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import { Readable } from 'stream';

// Configuration
const BASE_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'avatars');
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB (increased from 1MB)
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(BASE_UPLOAD_DIR);
  } catch {
    await fs.mkdir(BASE_UPLOAD_DIR, { recursive: true });
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
async function parseAvatarUpload(
  req: NextRequest
): Promise<{ fields: Fields; files: Files }> {
  await ensureUploadDir();

  const form = formidable({
    uploadDir: BASE_UPLOAD_DIR,
    keepExtensions: true,
    maxFileSize: MAX_FILE_SIZE,
    maxFiles: 1,
    multiples: false,
    filename: (name, ext, part) => {
      // Generate unique filename: avatar-userid-timestamp.ext
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const extension = ext || path.extname(part.originalFilename || '') || '.jpg';
      return `avatar-${uniqueSuffix}${extension}`;
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
 * POST /api/users/me/avatar
 * 
 * Upload user avatar/profile picture
 * 
 * @access Authenticated users only
 * @body multipart/form-data with avatar file
 * @returns { id, name, email, image, role }
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authentication
    const session = await getCurrentUser();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please login to upload avatar.' },
        { status: 401 }
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

    // 3. Parse form data
    const { files } = await parseAvatarUpload(req);

    // 4. Extract uploaded file
    const uploadedFile = files.avatar || files.file;
    const file = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;

    if (!file || typeof file !== 'object') {
      return NextResponse.json(
        { error: 'No File', message: 'No avatar file uploaded.' },
        { status: 400 }
      );
    }

    const formFile = file as FormidableFile;

    // 5. Validate file extension
    const ext = path.extname(formFile.originalFilename || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      // Delete invalid file
      try {
        await fs.unlink(formFile.filepath);
      } catch {}

      return NextResponse.json(
        {
          error: 'Invalid File Type',
          message: `File type ${ext} not allowed. Only JPG, PNG, GIF, and WebP are supported.`,
        },
        { status: 415 }
      );
    }

    // 6. Validate file size
    if (formFile.size > MAX_FILE_SIZE) {
      // Delete oversized file
      try {
        await fs.unlink(formFile.filepath);
      } catch {}

      return NextResponse.json(
        {
          error: 'File Too Large',
          message: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.`,
        },
        { status: 413 }
      );
    }

    // 7. Delete old avatar if exists
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    if (currentUser?.image && currentUser.image.startsWith('/uploads/avatars/')) {
      const oldAvatarPath = path.join(process.cwd(), 'public', currentUser.image);
      try {
        await fs.unlink(oldAvatarPath);
      } catch {
        // Ignore if old file doesn't exist
      }
    }

    // 8. Generate public URL path
    const filename = path.basename(formFile.filepath);
    const imageUrl = `/uploads/avatars/${filename}`;

    // 9. Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    });

    return NextResponse.json(
      {
        ...updatedUser,
        success: true,
        message: 'Avatar uploaded successfully.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[AVATAR_UPLOAD_ERROR]', error);

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
          message: 'Only JPEG, PNG, GIF, and WebP images are allowed.',
        },
        { status: 415 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: 'Upload Failed',
        message: 'An error occurred during avatar upload. Please try again.',
      },
      { status: 500 }
    );
  }
}
