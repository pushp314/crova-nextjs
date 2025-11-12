#!/bin/bash

echo "🧪 Testing Product Image Upload System"
echo "======================================"
echo ""

# Check if uploads directory exists
echo "1. Checking upload directory..."
if [ -d "public/uploads/products" ]; then
    echo "✅ Directory exists: public/uploads/products"
else
    echo "❌ Directory not found, creating..."
    mkdir -p public/uploads/products
    echo "✅ Created: public/uploads/products"
fi
echo ""

# List existing files
echo "2. Current uploaded files:"
file_count=$(find public/uploads/products -type f | wc -l)
if [ $file_count -eq 0 ]; then
    echo "   📁 No files uploaded yet"
else
    echo "   📁 Found $file_count file(s):"
    ls -lh public/uploads/products/*.{jpg,jpeg,png,webp} 2>/dev/null | awk '{print "   - " $9 " (" $5 ")"}'
fi
echo ""

# Check server status
echo "3. Checking Next.js dev server..."
if lsof -Pi :9002 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Dev server is running on port 9002"
    echo "   🌐 http://localhost:9002/admin/products"
else
    echo "⚠️  Dev server not running"
    echo "   Run: npm run dev"
fi
echo ""

# Test instructions
echo "📋 Manual Test Steps:"
echo "======================================"
echo "1. Open: http://localhost:9002/admin/products"
echo "2. Click 'Add Product' button"
echo "3. Fill in product details:"
echo "   - Name: Test Product"
echo "   - Description: This is a test product"
echo "   - Price: 99.99"
echo "   - Stock: 10"
echo "   - Category: Select any"
echo "   - Upload at least 1 image"
echo "   - Add at least 1 size (e.g., M)"
echo "   - Add at least 1 color (e.g., Red)"
echo "4. Click 'Create Product'"
echo ""
echo "✅ Expected Results:"
echo "   - Loading toast appears"
echo "   - Success toast: 'Product created successfully!'"
echo "   - Product appears in the table"
echo "   - Console shows: images as array of filenames"
echo "   - Database stores: ['filename.jpg'] (not full paths)"
echo ""
echo "🔍 Verify Database:"
echo "   Run this SQL in your database:"
echo "   SELECT id, name, images FROM \"Product\" ORDER BY \"createdAt\" DESC LIMIT 1;"
echo ""
echo "   Should see: {\"filename-123.jpg\"}"
echo "   NOT: {\"/uploads/products/filename-123.jpg\"}"
echo ""

# Check key files
echo "📄 Key Files Modified:"
echo "======================================"
files=(
    "src/lib/validations.ts"
    "src/lib/image-helper.ts"
    "src/app/api/upload/product/route.ts"
    "src/components/admin/ImageUploadZone.tsx"
    "src/app/admin/products/page.tsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (MISSING!)"
    fi
done
echo ""

echo "🎯 Quick Check Checklist:"
echo "======================================"
echo "[ ] Dev server running (npm run dev)"
echo "[ ] Can access admin panel (/admin/products)"
echo "[ ] Can upload images"
echo "[ ] Can create product"
echo "[ ] Images display correctly"
echo "[ ] Database stores only filenames"
echo "[ ] Console shows correct logs"
echo ""
echo "✨ All set! Start testing!"
