import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import multer from 'multer';
import path from 'path';
import { promisify } from 'util';
import fs from 'fs';
import { UserRole } from '@prisma/client';

// Configure storage for multer
const storage = multer.diskStorage({
  destination: './public/uploads/avatars',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Error: File upload only supports the following filetypes - ' + filetypes));
  },
});

// We need to create the upload directory if it doesn't exist
const uploadDir = './public/uploads/avatars';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const uploadMiddleware = promisify(upload.single('avatar'));

// We need to extend the NextRequest to work with multer
interface RequestWithFile extends NextRequest {
  file?: Express.Multer.File;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

// POST /api/users/me/avatar - Upload avatar
export async function POST(req: RequestWithFile) {
  try {
    const session = await getCurrentUser();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // @ts-ignore
    await uploadMiddleware(req, null);

    if (!req.file) {
      return NextResponse.json({ message: 'No file uploaded.' }, { status: 400 });
    }

    const imageUrl = `/uploads/avatars/${req.file.filename}`;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
      select: {
        id: true, name: true, email: true, image: true, role: true, createdAt: true, updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });

  } catch (error: any) {
    console.error('Avatar Upload Error:', error);
    if (error.code === 'LIMIT_FILE_SIZE') {
        return NextResponse.json({ message: 'File is too large. Maximum size is 1MB.'}, { status: 400 });
    }
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
