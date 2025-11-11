
import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import multer from 'multer';
import path from 'path';
import { promisify } from 'util';
import fs from 'fs';
import { UserRole } from '@prisma/client';
import { isAdmin, isDelivery } from '@/lib/rbac';

const UPLOAD_DIR = './public/uploads';

// Ensure the base upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Bucket determines the sub-directory
    const bucket = (req as any).bucket || 'default';
    const year = new Date().getFullYear().toString();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const destination = path.join(UPLOAD_DIR, bucket, year, month);
    
    // Ensure directory exists
    fs.mkdirSync(destination, { recursive: true });
    
    cb(null, destination);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Error: Invalid file type. Only jpeg, jpg, png, and webp are allowed.'));
  },
});

// Promisify the multer upload middleware to use with async/await
const uploadMiddleware = promisify(upload.single('file'));

// We need to extend the NextRequest to work with multer
interface RequestWithFile extends NextRequest {
  file?: Express.Multer.File;
}

// POST /api/upload?bucket=<bucket_name>
export async function POST(req: RequestWithFile) {
  try {
    const session = await getCurrentUser();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bucket = searchParams.get('bucket');

    if (!bucket) {
        return NextResponse.json({ message: 'Bucket query parameter is required.' }, { status: 400 });
    }

    // RBAC for different buckets
    if (bucket === 'banners' && !isAdmin(session)) {
      return NextResponse.json({ message: 'Forbidden: Only admins can upload banners.' }, { status: 403 });
    }
    if (bucket === 'proofs' && !isDelivery(session) && !isAdmin(session)) {
      return NextResponse.json({ message: 'Forbidden: Only admins or delivery users can upload proofs.' }, { status: 403 });
    }

    // Attach bucket to the request for multer's destination function
    (req as any).bucket = bucket;

    // @ts-ignore - We are using a custom promisified middleware
    await uploadMiddleware(req, null);

    if (!req.file) {
      return NextResponse.json({ message: 'No file uploaded.' }, { status: 400 });
    }

    // Construct the public URL by removing 'public' from the path
    const publicUrl = req.file.path.replace(/^public/, '');

    return NextResponse.json({ url: publicUrl }, { status: 200 });

  } catch (error: any) {
    console.error('File Upload Error:', error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return NextResponse.json({ message: 'File is too large. Maximum size is 3MB.'}, { status: 413 });
    }
     if (error.message.includes('Invalid file type')) {
      return NextResponse.json({ message: error.message }, { status: 415 });
    }
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
