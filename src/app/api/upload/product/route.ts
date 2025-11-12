import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireRole } from '@/lib/rbac';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';

const UPLOAD_DIR = './public/uploads/products';
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
const MAX_FILES = 6;
const ALLOWED_TYPES = /jpeg|jpg|png|webp/;

// Ensure the base upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store directly in /public/uploads/products/ (flat structure)
    const destination = UPLOAD_DIR;
    
    // Ensure directory exists
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }
    
    cb(null, destination);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const extension = path.extname(sanitizedOriginalName);
    const basename = path.basename(sanitizedOriginalName, extension);
    cb(null, `${basename}-${uniqueSuffix}${extension}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
  fileFilter: (req, file, cb) => {
    const mimetype = ALLOWED_TYPES.test(file.mimetype);
    const extname = ALLOWED_TYPES.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('Invalid file type. Only jpeg, jpg, png, and webp images are allowed.'));
  },
});

// Helper to convert Web ReadableStream to Node.js Readable
async function webStreamToNodeStream(webStream: ReadableStream<Uint8Array>): Promise<Readable> {
  const reader = webStream.getReader();
  const nodeStream = new Readable({
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
  return nodeStream;
}

// Helper to parse multipart form data using multer
async function parseFormData(req: Request): Promise<{ files: Express.Multer.File[] }> {
  return new Promise(async (resolve, reject) => {
    try {
      const contentType = req.headers.get('content-type');
      if (!contentType || !contentType.includes('multipart/form-data')) {
        return reject(new Error('Content-Type must be multipart/form-data'));
      }

      const formData = await req.formData();
      const files: Express.Multer.File[] = [];
      
      // Get all files from formData
      const fileEntries = Array.from(formData.entries()).filter(([key, value]) => 
        value instanceof File
      );

      if (fileEntries.length === 0) {
        return reject(new Error('No files provided'));
      }

      if (fileEntries.length > MAX_FILES) {
        return reject(new Error(`Maximum ${MAX_FILES} files allowed`));
      }

      // Process each file
      for (const [fieldname, file] of fileEntries) {
        if (!(file instanceof File)) continue;

        // Validate file type
        const ext = path.extname(file.name).toLowerCase();
        const mimetype = file.type;
        
        if (!ALLOWED_TYPES.test(mimetype) || !ALLOWED_TYPES.test(ext)) {
          return reject(new Error(`Invalid file type for ${file.name}. Only jpeg, jpg, png, and webp are allowed.`));
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          return reject(new Error(`File ${file.name} is too large. Maximum size is 3MB.`));
        }

        // Store directly in /public/uploads/products/ (flat structure)
        const destination = UPLOAD_DIR;
        
        if (!fs.existsSync(destination)) {
          fs.mkdirSync(destination, { recursive: true });
        }

        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const extension = path.extname(sanitizedOriginalName);
        const basename = path.basename(sanitizedOriginalName, extension);
        const filename = `${basename}-${uniqueSuffix}${extension}`;
        const filepath = path.join(destination, filename);

        // Save file
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(filepath, buffer);

        // Create multer-compatible file object
        files.push({
          fieldname,
          originalname: file.name,
          encoding: '7bit',
          mimetype: file.type,
          size: file.size,
          destination,
          filename,
          path: filepath,
          buffer,
        } as Express.Multer.File);
      }

      resolve({ files });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * POST /api/upload/product
 * 
 * Upload multiple product images (up to 6)
 * 
 * @access ADMIN only
 * @body multipart/form-data with files
 * @returns { urls: string[] } - Array of uploaded image URLs
 */
export async function POST(req: Request) {
  try {
    // 1. Authenticate and authorize
    const session = await getCurrentUser();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized. Please login.' }, 
        { status: 401 }
      );
    }

    // Require ADMIN role
    try {
      requireRole(session, ['ADMIN']);
    } catch (error) {
      return NextResponse.json(
        { message: 'Forbidden. Admin access required.' }, 
        { status: 403 }
      );
    }

    // 2. Parse multipart form data
    const { files } = await parseFormData(req);

    if (!files || files.length === 0) {
      return NextResponse.json(
        { message: 'No files uploaded.' }, 
        { status: 400 }
      );
    }

    // 3. Return only filenames (not full paths)
    const filenames = files.map(file => file.filename);

    return NextResponse.json(
      { 
        filenames,
        count: filenames.length,
        message: `Successfully uploaded ${filenames.length} image(s)`,
      }, 
      { status: 200 }
    );

  } catch (error: any) {
    console.error('[PRODUCT_UPLOAD_ERROR]', error);

    // Handle specific errors
    if (error.message.includes('Content-Type must be multipart/form-data')) {
      return NextResponse.json(
        { message: 'Invalid content type. Must be multipart/form-data.' }, 
        { status: 400 }
      );
    }

    if (error.message.includes('No files provided')) {
      return NextResponse.json(
        { message: 'No files provided in request.' }, 
        { status: 400 }
      );
    }

    if (error.message.includes('Maximum')) {
      return NextResponse.json(
        { message: error.message }, 
        { status: 400 }
      );
    }

    if (error.message.includes('too large')) {
      return NextResponse.json(
        { message: error.message }, 
        { status: 413 }
      );
    }

    if (error.message.includes('Invalid file type')) {
      return NextResponse.json(
        { message: error.message }, 
        { status: 415 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to upload images. Please try again.' }, 
      { status: 500 }
    );
  }
}
