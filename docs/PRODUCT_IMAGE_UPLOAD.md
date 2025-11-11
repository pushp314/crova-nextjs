# Product Image Upload System - Complete Implementation Guide

## 📋 Overview

This document provides a comprehensive guide to the multipart image upload system for products in the NOVA Fashion Store. The system supports uploading up to 6 images per product with drag-and-drop functionality, validation, and admin-only access.

---

## 🏗️ Architecture

### Components

1. **API Route**: `/src/app/api/upload/product/route.ts`
2. **Validation**: `/src/lib/validation/product.ts`
3. **UI Component**: `/src/components/admin/ImageUploadZone.tsx`
4. **Form Integration**: `/src/components/admin/product-form-dialog.tsx`
5. **Product Routes**: `/src/app/api/products/route.ts` & `/src/app/api/products/[id]/route.ts`

### Technology Stack

- **File Upload**: Multer (multipart/form-data)
- **Storage**: Local filesystem (`/public/uploads/products/`)
- **Validation**: Zod schemas
- **Authorization**: NextAuth with RBAC
- **UI**: Drag & Drop with React

---

## 🚀 Features

### ✅ Upload API Features

- ✅ Multiple file upload (up to 6 images)
- ✅ File validation (JPEG, PNG, WebP only)
- ✅ Size limit (3MB per file)
- ✅ Organized storage (`/public/uploads/products/YYYY/MM/`)
- ✅ Admin-only access via RBAC
- ✅ Automatic folder creation
- ✅ Unique filename generation
- ✅ Comprehensive error handling

### ✅ UI Features

- ✅ Drag & Drop support
- ✅ Image preview with thumbnails
- ✅ Remove individual images
- ✅ Upload progress indicator
- ✅ Client-side validation
- ✅ Primary image indicator
- ✅ Responsive grid layout
- ✅ Error toast notifications

---

## 📁 File Structure

```
src/
├── app/
│   └── api/
│       ├── upload/
│       │   └── product/
│       │       └── route.ts          # Multipart upload endpoint
│       └── products/
│           ├── route.ts              # Create/List products
│           └── [id]/
│               └── route.ts          # Update/Delete products
├── components/
│   └── admin/
│       ├── ImageUploadZone.tsx       # Drag & Drop upload component
│       └── product-form-dialog.tsx   # Product form with image upload
└── lib/
    └── validation/
        └── product.ts                # Zod validation schemas

public/
└── uploads/
    └── products/
        └── YYYY/
            └── MM/
                └── [uploaded-images]
```

---

## 📝 API Documentation

### POST /api/upload/product

Upload multiple product images.

**Authentication**: Required (Admin only)

**Content-Type**: `multipart/form-data`

**Request Body**:
```typescript
FormData with files:
- file0: File (image)
- file1: File (image)
- ... (up to 6 files)
```

**File Requirements**:
- Types: JPEG, JPG, PNG, WebP
- Max size: 3MB per file
- Max count: 6 files

**Success Response** (200):
```json
{
  "urls": [
    "/uploads/products/2025/11/product-1731398400000-123456789.jpg",
    "/uploads/products/2025/11/product-1731398400001-987654321.png"
  ],
  "count": 2,
  "message": "Successfully uploaded 2 image(s)"
}
```

**Error Responses**:

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Unauthorized | User not authenticated |
| 403 | Forbidden | Not an admin user |
| 400 | Bad Request | Invalid request (no files, wrong format) |
| 413 | Payload Too Large | File exceeds 3MB |
| 415 | Unsupported Media | Invalid file type |
| 500 | Server Error | Internal server error |

---

## 🔒 Security & RBAC

### Authorization Flow

```typescript
// 1. Check authentication
const session = await getCurrentUser();
if (!session?.user?.id) {
  return 401 Unauthorized
}

// 2. Check ADMIN role
requireRole(session, ['ADMIN']);
// Throws FORBIDDEN error if not admin
```

### Protected Routes

- ✅ `POST /api/upload/product` - Admin only
- ✅ `POST /api/products` - Admin only
- ✅ `PUT /api/products/[id]` - Admin only
- ✅ `DELETE /api/products/[id]` - Admin only

---

## 💻 Usage Examples

### Example 1: Using the ImageUploadZone Component

```tsx
import { ImageUploadZone } from '@/components/admin/ImageUploadZone';
import { useState } from 'react';

export function MyProductForm() {
  const [images, setImages] = useState<string[]>([]);

  return (
    <ImageUploadZone
      images={images}
      onChange={setImages}
      maxImages={6}
      maxSizeMB={3}
    />
  );
}
```

### Example 2: Manual Upload with Fetch API

```typescript
async function uploadProductImages(files: File[]) {
  const formData = new FormData();
  
  files.forEach((file, index) => {
    formData.append(`file${index}`, file);
  });

  const response = await fetch('/api/upload/product', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const data = await response.json();
  return data.urls; // Array of uploaded image URLs
}
```

### Example 3: Creating a Product with Images

```typescript
async function createProduct() {
  // 1. Upload images first
  const files = [/* File objects */];
  const { urls } = await fetch('/api/upload/product', {
    method: 'POST',
    body: formData,
  }).then(res => res.json());

  // 2. Create product with image URLs
  const product = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Stylish T-Shirt',
      description: 'A comfortable cotton t-shirt',
      price: 29.99,
      stock: 100,
      categoryId: 'cat_123',
      images: urls, // Use uploaded URLs
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Red', 'Blue', 'Black'],
      featured: false,
    }),
  }).then(res => res.json());

  return product;
}
```

### Example 4: Testing with cURL

```bash
# Upload images
curl -X POST http://localhost:9002/api/upload/product \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -F "file0=@/path/to/image1.jpg" \
  -F "file1=@/path/to/image2.png"

# Response:
# {
#   "urls": ["/uploads/products/2025/11/image1-123.jpg", ...],
#   "count": 2,
#   "message": "Successfully uploaded 2 image(s)"
# }

# Create product
curl -X POST http://localhost:9002/api/products \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "A test product description",
    "price": 99.99,
    "stock": 50,
    "categoryId": "cat_id_here",
    "images": ["/uploads/products/2025/11/image1-123.jpg"],
    "sizes": ["M", "L"],
    "colors": ["Blue"],
    "featured": false
  }'
```

---

## 🧪 Testing Guide

### 1. Test Upload Endpoint

#### Valid Upload
```typescript
const formData = new FormData();
formData.append('file0', new File(['content'], 'test.jpg', { type: 'image/jpeg' }));

const response = await fetch('/api/upload/product', {
  method: 'POST',
  body: formData,
});

expect(response.status).toBe(200);
const data = await response.json();
expect(data.urls).toHaveLength(1);
```

#### Invalid File Type
```typescript
const formData = new FormData();
formData.append('file0', new File(['content'], 'test.pdf', { type: 'application/pdf' }));

const response = await fetch('/api/upload/product', {
  method: 'POST',
  body: formData,
});

expect(response.status).toBe(415);
```

#### File Too Large
```typescript
// Create 4MB file (exceeds 3MB limit)
const largeFile = new File([new ArrayBuffer(4 * 1024 * 1024)], 'large.jpg', {
  type: 'image/jpeg'
});

const formData = new FormData();
formData.append('file0', largeFile);

const response = await fetch('/api/upload/product', {
  method: 'POST',
  body: formData,
});

expect(response.status).toBe(413);
```

### 2. Test RBAC Protection

```typescript
// Test unauthorized access
const response = await fetch('/api/upload/product', {
  method: 'POST',
  body: formData,
  // No authentication headers
});

expect(response.status).toBe(401);

// Test non-admin user
// (Assuming you have a USER role session)
const response = await fetch('/api/upload/product', {
  method: 'POST',
  body: formData,
  headers: { 'Cookie': 'non-admin-session' }
});

expect(response.status).toBe(403);
```

### 3. Test UI Component

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageUploadZone } from '@/components/admin/ImageUploadZone';

test('renders upload zone', () => {
  render(<ImageUploadZone images={[]} onChange={() => {}} />);
  expect(screen.getByText(/drag & drop/i)).toBeInTheDocument();
});

test('displays uploaded images', () => {
  const images = ['/uploads/products/2025/11/test.jpg'];
  render(<ImageUploadZone images={images} onChange={() => {}} />);
  expect(screen.getByAlt(/product image 1/i)).toBeInTheDocument();
});
```

---

## 🐛 Troubleshooting

### Issue: "Content-Type must be multipart/form-data"

**Solution**: Ensure you're using FormData and NOT setting Content-Type header manually:

```typescript
// ✅ Correct
const formData = new FormData();
fetch('/api/upload/product', {
  method: 'POST',
  body: formData, // Browser sets Content-Type automatically
});

// ❌ Wrong
fetch('/api/upload/product', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }, // Wrong!
  body: JSON.stringify({ files }),
});
```

### Issue: "Maximum 6 images allowed"

**Solution**: Check the number of files before uploading:

```typescript
if (files.length > 6) {
  toast.error('Maximum 6 images allowed');
  return;
}
```

### Issue: Images not displaying after upload

**Solution**: Verify the URL format. URLs should start with `/uploads/`:

```typescript
// ✅ Correct format
"/uploads/products/2025/11/image.jpg"

// ❌ Wrong format
"public/uploads/products/2025/11/image.jpg"
```

### Issue: 403 Forbidden

**Solution**: Verify user has ADMIN role:

```typescript
// Check in database
await prisma.user.findUnique({
  where: { email: 'admin@example.com' },
  select: { role: true }
});
// Should return { role: 'ADMIN' }
```

---

## 📊 Validation Rules

### File Validation

| Rule | Value | Error |
|------|-------|-------|
| Max files | 6 | "Maximum 6 images allowed" |
| Max size | 3MB | "File too large. Maximum size is 3MB" |
| Allowed types | JPEG, JPG, PNG, WebP | "Invalid file type" |

### Product Schema Validation

```typescript
{
  images: z.array(z.string().url())
    .min(1, 'At least one product image is required')
    .max(6, 'Maximum 6 images allowed per product'),
}
```

---

## 🎨 UI/UX Features

### Drag & Drop States

1. **Default State**: Dashed border, upload icon
2. **Dragging State**: Primary colored border, highlighted background
3. **Uploading State**: Loader spinner, "Uploading..." text
4. **Uploaded State**: Image grid with thumbnails

### Visual Indicators

- **Primary Badge**: First image shows "Primary" badge
- **Image Index**: Each image shows its position (1, 2, 3...)
- **Remove Button**: Appears on hover
- **Progress**: Loading spinner during upload

---

## 🔄 Migration Guide

If you have existing products with old image format, no migration needed! The system is backward compatible.

### Existing Format (Still Works)
```typescript
{
  images: [{ value: "https://example.com/image.jpg" }]
}
```

### New Format (Recommended)
```typescript
{
  images: ["https://example.com/image.jpg"]
}
```

---

## 📈 Performance Optimization

### Tips

1. **Compress images before upload** (use tools like TinyPNG)
2. **Use WebP format** for better compression
3. **Lazy load images** in product grids
4. **Use Next.js Image component** for automatic optimization

### Next.js Image Example

```tsx
import Image from 'next/image';

<Image
  src={product.images[0]}
  alt={product.name}
  width={400}
  height={400}
  className="object-cover"
  priority={index < 4} // Prioritize first 4 images
/>
```

---

## ✅ Checklist

Before deploying to production:

- [ ] Tested upload with valid images
- [ ] Tested upload with invalid files (PDF, SVG, etc.)
- [ ] Tested file size limits
- [ ] Tested RBAC protection (admin-only)
- [ ] Verified uploaded files are in correct directory
- [ ] Tested product creation with uploaded images
- [ ] Tested product update with new images
- [ ] Verified images display correctly on frontend
- [ ] Added proper error handling
- [ ] Configured production storage (if using cloud storage)

---

## 🚀 Production Deployment

### Environment Variables

```env
# Optional: Configure custom upload directory
UPLOAD_DIR=/var/www/uploads

# Optional: Configure max file size (in bytes)
MAX_FILE_SIZE=3145728

# Optional: Configure max files
MAX_FILES=6
```

### Deployment Considerations

1. **Storage**: Consider using cloud storage (AWS S3, Cloudinary) for production
2. **CDN**: Serve images through CDN for better performance
3. **Backup**: Implement regular backups of uploaded files
4. **Cleanup**: Add cron job to remove orphaned images

---

## 📚 Additional Resources

- [Next.js File Upload](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#request-body)
- [Multer Documentation](https://github.com/expressjs/multer)
- [Zod Validation](https://zod.dev/)
- [NextAuth RBAC](https://next-auth.js.org/tutorials/role-based-access-control)

---

## 💡 Future Enhancements

Potential improvements for future versions:

- [ ] Drag to reorder images
- [ ] Crop/resize images before upload
- [ ] Cloud storage integration (S3, Cloudinary)
- [ ] Image optimization pipeline
- [ ] Bulk upload from ZIP
- [ ] Image metadata extraction
- [ ] Alt text for accessibility
- [ ] Image variants (thumbnail, medium, large)

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review error logs in browser console
3. Check server logs for detailed errors
4. Verify RBAC configuration

---

**Last Updated**: November 12, 2025
**Version**: 1.0.0
