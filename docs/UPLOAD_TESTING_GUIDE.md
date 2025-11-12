# Upload System Testing Guide

This guide provides comprehensive testing procedures for the formidable-based upload system.

## Prerequisites

Before testing, ensure:
- ✅ Application is running (`npm run dev` or `npm start`)
- ✅ Database is accessible
- ✅ You have test images ready (JPG, PNG, WebP)
- ✅ You have admin credentials for testing

## Quick Test Commands

### 1. Get Upload Configuration

```bash
# General upload config
curl http://localhost:9002/api/upload

# Product upload config
curl http://localhost:9002/api/upload/product
```

**Expected Response:**
```json
{
  "maxFileSize": 5242880,
  "maxFileSizeMB": 5,
  "allowedTypes": ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  "allowedExtensions": [".jpg", ".jpeg", ".png", ".webp"],
  "supportedBuckets": ["products", "banners", "proofs", "avatars", "default"]
}
```

---

## Test Scenarios

### Test 1: Authentication Check

**Purpose:** Verify authentication is required

```bash
# Test without token (should fail)
curl -X POST \
  -F "file=@test-image.jpg" \
  http://localhost:9002/api/upload?bucket=products

# Expected: 401 Unauthorized
```

**Expected Response:**
```json
{
  "error": "Unauthorized",
  "message": "Please login to upload files."
}
```

---

### Test 2: RBAC Verification

**Purpose:** Verify role-based access control

#### 2a. Admin Access to Banners (Should Succeed)

```bash
# Get admin JWT token first
ADMIN_TOKEN="your-admin-jwt-token"

curl -X POST \
  -H "Cookie: next-auth.session-token=$ADMIN_TOKEN" \
  -F "file=@banner.jpg" \
  http://localhost:9002/api/upload?bucket=banners

# Expected: 200 Success
```

#### 2b. Non-Admin Access to Banners (Should Fail)

```bash
USER_TOKEN="your-user-jwt-token"

curl -X POST \
  -H "Cookie: next-auth.session-token=$USER_TOKEN" \
  -F "file=@banner.jpg" \
  http://localhost:9002/api/upload?bucket=banners

# Expected: 403 Forbidden
```

**Expected Response:**
```json
{
  "error": "Forbidden",
  "message": "Only admins can upload banners."
}
```

---

### Test 3: Single File Upload

**Purpose:** Test basic file upload functionality

```bash
ADMIN_TOKEN="your-admin-jwt-token"

curl -X POST \
  -H "Cookie: next-auth.session-token=$ADMIN_TOKEN" \
  -F "file=@product-image.jpg" \
  http://localhost:9002/api/upload?bucket=products
```

**Expected Response:**
```json
{
  "url": "/uploads/products/2025/01/product-image-1705234567890-123456789.jpg",
  "success": true,
  "message": "File uploaded successfully."
}
```

**Verify:**
- File exists at: `public/uploads/products/2025/01/product-image-*.jpg`
- File is accessible: `http://localhost:9002/uploads/products/2025/01/product-image-*.jpg`

---

### Test 4: Multiple File Upload

**Purpose:** Test multiple files in single request

```bash
ADMIN_TOKEN="your-admin-jwt-token"

curl -X POST \
  -H "Cookie: next-auth.session-token=$ADMIN_TOKEN" \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg" \
  -F "files=@image3.jpg" \
  http://localhost:9002/api/upload/product
```

**Expected Response:**
```json
{
  "filenames": [
    "image1-1705234567890-123456789.jpg",
    "image2-1705234567890-987654321.jpg",
    "image3-1705234567890-456789123.jpg"
  ],
  "count": 3,
  "success": true,
  "message": "Successfully uploaded 3 image(s)."
}
```

**Verify:**
- All 3 files exist in `public/uploads/products/`
- Each filename is unique
- All files are accessible via browser

---

### Test 5: File Type Validation

**Purpose:** Verify only allowed file types are accepted

#### 5a. Invalid File Type (TXT)

```bash
echo "This is a text file" > test.txt

curl -X POST \
  -H "Cookie: next-auth.session-token=$ADMIN_TOKEN" \
  -F "file=@test.txt" \
  http://localhost:9002/api/upload?bucket=products

# Expected: 415 Unsupported Media Type
```

**Expected Response:**
```json
{
  "error": "Unsupported File Type",
  "message": "Only JPEG, PNG, and WebP images are allowed."
}
```

#### 5b. Invalid Extension (PDF)

```bash
curl -X POST \
  -H "Cookie: next-auth.session-token=$ADMIN_TOKEN" \
  -F "file=@document.pdf" \
  http://localhost:9002/api/upload?bucket=products

# Expected: 415 Unsupported Media Type
```

#### 5c. Valid File Types (Should Succeed)

```bash
# JPEG
curl -X POST -H "Cookie: next-auth.session-token=$ADMIN_TOKEN" \
  -F "file=@image.jpg" http://localhost:9002/api/upload?bucket=products

# PNG
curl -X POST -H "Cookie: next-auth.session-token=$ADMIN_TOKEN" \
  -F "file=@image.png" http://localhost:9002/api/upload?bucket=products

# WebP
curl -X POST -H "Cookie: next-auth.session-token=$ADMIN_TOKEN" \
  -F "file=@image.webp" http://localhost:9002/api/upload?bucket=products

# All should return 200 Success
```

---

### Test 6: File Size Limits

**Purpose:** Verify file size restrictions

#### 6a. File Exceeds 5MB (Should Fail)

```bash
# Create 10MB test file
dd if=/dev/zero of=large-file.jpg bs=1M count=10

curl -X POST \
  -H "Cookie: next-auth.session-token=$ADMIN_TOKEN" \
  -F "file=@large-file.jpg" \
  http://localhost:9002/api/upload?bucket=products

# Expected: 413 Payload Too Large
```

**Expected Response:**
```json
{
  "error": "File Too Large",
  "message": "File size exceeds 5MB limit."
}
```

#### 6b. File Within 5MB Limit (Should Succeed)

```bash
# Create 3MB test file
dd if=/dev/zero of=valid-size.jpg bs=1M count=3

curl -X POST \
  -H "Cookie: next-auth.session-token=$ADMIN_TOKEN" \
  -F "file=@valid-size.jpg" \
  http://localhost:9002/api/upload?bucket=products

# Expected: 200 Success
```

---

### Test 7: Maximum Files Limit (Product Upload)

**Purpose:** Verify max 6 files per product upload

#### 7a. Upload 7 Files (Should Fail)

```bash
curl -X POST \
  -H "Cookie: next-auth.session-token=$ADMIN_TOKEN" \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg" \
  -F "files=@image3.jpg" \
  -F "files=@image4.jpg" \
  -F "files=@image5.jpg" \
  -F "files=@image6.jpg" \
  -F "files=@image7.jpg" \
  http://localhost:9002/api/upload/product

# Expected: 400 Bad Request
```

**Expected Response:**
```json
{
  "error": "Too Many Files",
  "message": "Maximum 6 files allowed."
}
```

#### 7b. Upload 6 Files (Should Succeed)

```bash
curl -X POST \
  -H "Cookie: next-auth.session-token=$ADMIN_TOKEN" \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg" \
  -F "files=@image3.jpg" \
  -F "files=@image4.jpg" \
  -F "files=@image5.jpg" \
  -F "files=@image6.jpg" \
  http://localhost:9002/api/upload/product

# Expected: 200 Success with 6 filenames
```

---

### Test 8: Bucket Organization

**Purpose:** Verify files are stored in correct directories

#### 8a. Products Bucket (Flat Structure)

```bash
curl -X POST \
  -H "Cookie: next-auth.session-token=$ADMIN_TOKEN" \
  -F "file=@product.jpg" \
  http://localhost:9002/api/upload?bucket=products

# Verify file location: public/uploads/products/2025/01/product-*.jpg
```

#### 8b. Banners Bucket (Date-Organized)

```bash
curl -X POST \
  -H "Cookie: next-auth.session-token=$ADMIN_TOKEN" \
  -F "file=@banner.jpg" \
  http://localhost:9002/api/upload?bucket=banners

# Verify file location: public/uploads/banners/2025/01/banner-*.jpg
```

#### 8c. Proofs Bucket (Delivery)

```bash
DELIVERY_TOKEN="your-delivery-jwt-token"

curl -X POST \
  -H "Cookie: next-auth.session-token=$DELIVERY_TOKEN" \
  -F "file=@proof.jpg" \
  http://localhost:9002/api/upload?bucket=proofs

# Verify file location: public/uploads/proofs/2025/01/proof-*.jpg
```

---

### Test 9: Filename Collision Protection

**Purpose:** Verify unique filenames prevent overwrites

```bash
# Upload same file twice
curl -X POST \
  -H "Cookie: next-auth.session-token=$ADMIN_TOKEN" \
  -F "file=@same-image.jpg" \
  http://localhost:9002/api/upload?bucket=products

# Wait 1 second
sleep 1

curl -X POST \
  -H "Cookie: next-auth.session-token=$ADMIN_TOKEN" \
  -F "file=@same-image.jpg" \
  http://localhost:9002/api/upload?bucket=products

# Verify: Two different files exist with unique timestamps
# Example:
#   same-image-1705234567890-123456789.jpg
#   same-image-1705234568901-987654321.jpg
```

---

### Test 10: Error Response Format

**Purpose:** Verify consistent error structure

All errors should follow this format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message."
}
```

Test various error scenarios:

```bash
# 401 Unauthorized
curl -X POST -F "file=@test.jpg" http://localhost:9002/api/upload?bucket=products

# 403 Forbidden
curl -X POST -H "Cookie: next-auth.session-token=$USER_TOKEN" \
  -F "file=@test.jpg" http://localhost:9002/api/upload?bucket=banners

# 400 No Files
curl -X POST -H "Cookie: next-auth.session-token=$ADMIN_TOKEN" \
  http://localhost:9002/api/upload?bucket=products

# 413 File Too Large
curl -X POST -H "Cookie: next-auth.session-token=$ADMIN_TOKEN" \
  -F "file=@large.jpg" http://localhost:9002/api/upload?bucket=products

# 415 Unsupported Type
curl -X POST -H "Cookie: next-auth.session-token=$ADMIN_TOKEN" \
  -F "file=@test.txt" http://localhost:9002/api/upload?bucket=products
```

---

## Frontend Testing

### Test 11: Admin Product Upload Form

1. **Login as Admin**
   - Navigate to `/login`
   - Use admin credentials

2. **Go to Product Management**
   - Navigate to `/admin/products`
   - Click "Add New Product"

3. **Test Image Upload**
   - Drag and drop 3 images
   - Verify preview thumbnails appear
   - Remove one image
   - Add another image
   - Submit form

4. **Verify Upload**
   - Check network tab for `/api/upload/product` request
   - Verify response contains filenames
   - Check `/api/products` POST includes image filenames
   - View created product to confirm images display

### Test 12: Avatar Upload

1. **Login as Any User**
   - Navigate to `/profile`

2. **Upload Avatar**
   - Click avatar upload area
   - Select image file
   - Verify preview appears
   - Save profile

3. **Verify**
   - Refresh page
   - Confirm avatar displays
   - Check `/api/users/me/avatar` request
   - Verify file in `public/uploads/avatars/`

---

## Automated Test Script

Create a test script for automated testing:

```bash
#!/bin/bash
# test-upload-system.sh

BASE_URL="http://localhost:9002"
ADMIN_TOKEN="your-admin-jwt-token"

echo "🧪 Starting Upload System Tests..."

# Test 1: Get Configuration
echo "\n📋 Test 1: Get Upload Configuration"
curl -s $BASE_URL/api/upload | jq .

# Test 2: Upload Single Image
echo "\n📤 Test 2: Upload Single Image"
curl -s -X POST \
  -H "Cookie: next-auth.session-token=$ADMIN_TOKEN" \
  -F "file=@test-image.jpg" \
  "$BASE_URL/api/upload?bucket=products" | jq .

# Test 3: Upload Multiple Images
echo "\n📤 Test 3: Upload Multiple Images"
curl -s -X POST \
  -H "Cookie: next-auth.session-token=$ADMIN_TOKEN" \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg" \
  "$BASE_URL/api/upload/product" | jq .

# Test 4: Test File Size Limit
echo "\n🚫 Test 4: File Size Limit"
dd if=/dev/zero of=large.jpg bs=1M count=10 2>/dev/null
curl -s -X POST \
  -H "Cookie: next-auth.session-token=$ADMIN_TOKEN" \
  -F "file=@large.jpg" \
  "$BASE_URL/api/upload?bucket=products" | jq .
rm large.jpg

# Test 5: Test Invalid File Type
echo "\n🚫 Test 5: Invalid File Type"
echo "test" > test.txt
curl -s -X POST \
  -H "Cookie: next-auth.session-token=$ADMIN_TOKEN" \
  -F "file=@test.txt" \
  "$BASE_URL/api/upload?bucket=products" | jq .
rm test.txt

# Test 6: Test Unauthorized Access
echo "\n🔒 Test 6: Unauthorized Access"
curl -s -X POST \
  -F "file=@test-image.jpg" \
  "$BASE_URL/api/upload?bucket=products" | jq .

echo "\n✅ All tests completed!"
```

**Run:**
```bash
chmod +x test-upload-system.sh
./test-upload-system.sh
```

---

## Performance Testing

### Test 13: Concurrent Uploads

Use Apache Bench (ab) or similar:

```bash
# Install Apache Bench
sudo apt-get install apache2-utils  # Ubuntu/Debian
brew install httpd                   # macOS

# Test concurrent uploads
ab -n 100 -c 10 \
  -p test-image.jpg \
  -T "multipart/form-data; boundary=----WebKitFormBoundary" \
  -H "Cookie: next-auth.session-token=$ADMIN_TOKEN" \
  http://localhost:9002/api/upload?bucket=products

# Monitor:
# - Requests per second
# - Time per request
# - Failed requests
# - Memory usage (pm2 monit)
```

### Test 14: Memory Leak Check

```bash
# Start server and monitor memory
pm2 start npm --name "test-server" -- start
pm2 monit

# Upload 100 files
for i in {1..100}; do
  curl -X POST \
    -H "Cookie: next-auth.session-token=$ADMIN_TOKEN" \
    -F "file=@test-image.jpg" \
    http://localhost:9002/api/upload?bucket=products
  sleep 0.1
done

# Check memory usage after uploads
# Memory should return to baseline (no leak)
```

---

## Troubleshooting

### Issue: 401 Unauthorized

**Cause:** No valid session token  
**Solution:**
1. Login via browser
2. Open DevTools → Application → Cookies
3. Copy `next-auth.session-token` value
4. Use in curl: `-H "Cookie: next-auth.session-token=TOKEN"`

### Issue: Files Not Accessible

**Cause:** Incorrect permissions  
**Solution:**
```bash
chmod -R 755 public/uploads
chown -R $USER:$USER public/uploads
```

### Issue: 413 Payload Too Large

**Cause:** File exceeds 5MB  
**Solution:**
1. Compress image
2. Or increase `MAX_FILE_SIZE` in route files
3. Also update Nginx `client_max_body_size` if using

### Issue: TypeScript Errors

**Solution:**
```bash
npx prisma generate
npm run typecheck
```

---

## Checklist

### Pre-Deployment Testing

- [ ] All 14 test scenarios pass
- [ ] Frontend upload form works
- [ ] Avatar upload works
- [ ] Files accessible via browser
- [ ] Error handling works correctly
- [ ] RBAC enforced properly
- [ ] File size limits enforced
- [ ] File type validation works
- [ ] Unique filenames generated
- [ ] No TypeScript errors
- [ ] Production build succeeds
- [ ] Performance acceptable (< 1s for 3MB)
- [ ] No memory leaks detected

### Post-Deployment Testing

- [ ] Test on production/staging URL
- [ ] Verify SSL/HTTPS works
- [ ] Test with Nginx (if using)
- [ ] Check file permissions
- [ ] Monitor error logs
- [ ] Test CDN (if configured)
- [ ] Verify backups working
- [ ] Test rate limiting (if configured)

---

## Success Criteria

✅ **All uploads succeed** with valid authentication  
✅ **All unauthorized attempts fail** with 401/403  
✅ **File size limits enforced** (413 for oversized)  
✅ **File type validation works** (415 for invalid types)  
✅ **Unique filenames prevent collisions**  
✅ **Files accessible via browser**  
✅ **No memory leaks** during stress testing  
✅ **Response times < 1 second** for typical uploads  
✅ **Error messages clear and helpful**  
✅ **Frontend integration seamless**  

---

## Support

For issues during testing:

1. **Check logs:**
   ```bash
   pm2 logs nova-ecommerce
   tail -f /var/log/nginx/error.log  # If using Nginx
   ```

2. **Check file system:**
   ```bash
   ls -lah public/uploads/products/
   du -sh public/uploads
   ```

3. **Check permissions:**
   ```bash
   stat public/uploads
   ```

4. **Verify environment:**
   ```bash
   node --version  # Should be 18.x+
   npm --version
   ```

---

**Last Updated:** January 2025  
**Upload System Version:** Formidable 3.5.2  
**Tested On:** Next.js 15.3.3, Node.js 18.x+
