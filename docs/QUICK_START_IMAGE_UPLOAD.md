# Quick Start: Product Image Upload

## 🚀 Quick Setup (5 minutes)

### Step 1: Verify Installation

The system is already integrated! Check these files exist:

```bash
src/app/api/upload/product/route.ts           ✅
src/lib/validation/product.ts                  ✅
src/components/admin/ImageUploadZone.tsx       ✅
src/components/admin/product-form-dialog.tsx   ✅
```

### Step 2: Test the Upload

1. **Login as Admin**
   ```
   Navigate to: http://localhost:9002/login
   Use your admin account
   ```

2. **Go to Products Page**
   ```
   Navigate to: http://localhost:9002/admin/products
   ```

3. **Click "Add Product"**
   - The dialog will open with the new image upload section

4. **Upload Images**
   - Drag & drop images OR click to browse
   - Select 1-6 images (JPEG, PNG, or WebP)
   - Each image max 3MB
   - Watch them upload automatically!

5. **Fill Product Details**
   ```
   Name: "Test Product"
   Description: "This is a test product"
   Price: 29.99
   Stock: 100
   Category: Select any
   Sizes: Add "M", "L"
   Colors: Add "Blue", "Red"
   Featured: Toggle if needed
   ```

6. **Save Product**
   - Click "Create Product"
   - Images are saved to `/public/uploads/products/YYYY/MM/`
   - Product is created with image URLs

### Step 3: Verify It Works

1. **Check File System**
   ```bash
   ls -la public/uploads/products/2025/11/
   # You should see your uploaded images
   ```

2. **Check Product**
   - Product should appear in the products list
   - Images should display in the table and detail page

3. **Check Image URLs**
   ```
   Example format: /uploads/products/2025/11/image-1731398400000-123456789.jpg
   ```

---

## 📸 Example: Quick Product Creation

### Using the Admin UI

1. Navigate to `/admin/products`
2. Click "Add Product"
3. Upload 2-3 product images
4. Fill in product details
5. Click "Create Product"

**That's it!** Your product is now live with images.

---

## 🧪 Quick Test with cURL

```bash
# 1. Get your session token from browser cookies
# Look for: next-auth.session-token

# 2. Upload an image
curl -X POST http://localhost:9002/api/upload/product \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN_HERE" \
  -F "file0=@/path/to/your/image.jpg"

# Expected response:
{
  "urls": ["/uploads/products/2025/11/image-xxx.jpg"],
  "count": 1,
  "message": "Successfully uploaded 1 image(s)"
}

# 3. Create product with the uploaded image URL
curl -X POST http://localhost:9002/api/products \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "A test product created via API",
    "price": 49.99,
    "stock": 50,
    "categoryId": "YOUR_CATEGORY_ID",
    "images": ["/uploads/products/2025/11/image-xxx.jpg"],
    "sizes": ["S", "M", "L"],
    "colors": ["Black", "White"],
    "featured": false
  }'
```

---

## 🎯 Key Features

### What You Get Out of the Box

✅ **Drag & Drop Upload**
- Simply drag images into the upload zone
- Supports multiple files at once

✅ **Visual Preview**
- See thumbnails immediately after upload
- First image is marked as "Primary"
- Remove any image with one click

✅ **Validation**
- Only JPEG, PNG, WebP allowed
- Max 3MB per file
- Max 6 images per product
- Instant error feedback

✅ **Security**
- Admin-only access
- RBAC protection
- Input validation
- Secure file storage

✅ **User Experience**
- Progress indicators
- Toast notifications
- Responsive design
- Error handling

---

## 🔥 Pro Tips

### 1. Optimize Images Before Upload
```bash
# Compress images to reduce file size
# Use online tools like TinyPNG or ImageOptim
```

### 2. Image Order Matters
- First image = Primary product image
- Appears in product cards and listings
- Shows on search results

### 3. Use WebP Format
- Better compression than JPEG
- Smaller file sizes
- Faster loading

### 4. Test Different Scenarios
- Upload 1 image
- Upload 6 images (max)
- Try uploading 7 images (should fail)
- Try uploading large file (>3MB, should fail)
- Try uploading PDF (should fail)

---

## 🐛 Common Issues

### "Forbidden" Error
**Problem**: User is not an admin
**Solution**: 
```sql
-- Update user role in database
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

### Images Not Showing
**Problem**: Wrong URL format
**Solution**: URLs should start with `/uploads/` not `public/uploads/`

### Upload Fails Silently
**Problem**: Check browser console for errors
**Solution**: Open DevTools > Console tab > Look for red errors

---

## 📊 What Gets Created

### File Structure
```
public/
└── uploads/
    └── products/
        └── 2025/              # Year
            └── 11/            # Month
                ├── product1-1731398400000-123.jpg
                ├── product1-1731398400001-456.jpg
                └── product2-1731398500000-789.png
```

### Database Entry
```json
{
  "id": "clxxx...",
  "name": "Test Product",
  "images": [
    "/uploads/products/2025/11/product1-1731398400000-123.jpg",
    "/uploads/products/2025/11/product1-1731398400001-456.jpg"
  ],
  "price": 29.99,
  ...
}
```

---

## ✅ Success Checklist

After setup, you should be able to:

- [ ] Login as admin user
- [ ] Navigate to `/admin/products`
- [ ] Click "Add Product"
- [ ] See the new ImageUploadZone component
- [ ] Drag & drop an image successfully
- [ ] See image preview with thumbnail
- [ ] Remove an uploaded image
- [ ] Upload multiple images
- [ ] Create a product with images
- [ ] View product with images on frontend

---

## 🎓 Learn More

- [Full Documentation](./PRODUCT_IMAGE_UPLOAD.md)
- [API Reference](./PRODUCT_IMAGE_UPLOAD.md#api-documentation)
- [Testing Guide](./PRODUCT_IMAGE_UPLOAD.md#testing-guide)
- [Troubleshooting](./PRODUCT_IMAGE_UPLOAD.md#troubleshooting)

---

## 💡 Next Steps

1. ✅ Test the upload in development
2. ✅ Upload some real product images
3. ✅ Verify images display correctly
4. ✅ Test on mobile/tablet devices
5. 🚀 Deploy to production!

---

**Happy uploading! 📸**
