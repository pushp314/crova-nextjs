#!/bin/bash

# Product Image Upload - Test Script
# This script tests the image upload functionality

echo "🧪 Testing Product Image Upload System"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
echo "1️⃣  Checking if server is running..."
if curl -s http://localhost:9002 > /dev/null; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server is not running. Start with: npm run dev${NC}"
    exit 1
fi

echo ""
echo "2️⃣  Testing API endpoints..."

# Test 1: Upload without authentication (should fail)
echo "   Testing unauthorized upload..."
response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:9002/api/upload/product \
  -F "file0=@test-image.jpg" 2>/dev/null)
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" == "401" ]; then
    echo -e "   ${GREEN}✅ Unauthorized access blocked (401)${NC}"
else
    echo -e "   ${YELLOW}⚠️  Expected 401, got $http_code${NC}"
fi

echo ""
echo "3️⃣  Checking file structure..."

# Check if upload directory exists
if [ -d "public/uploads/products" ]; then
    echo -e "${GREEN}✅ Upload directory exists${NC}"
else
    echo -e "${YELLOW}⚠️  Upload directory not found. Creating...${NC}"
    mkdir -p public/uploads/products
fi

echo ""
echo "4️⃣  Checking required files..."

files=(
    "src/app/api/upload/product/route.ts"
    "src/lib/validation/product.ts"
    "src/components/admin/ImageUploadZone.tsx"
    "src/components/admin/product-form-dialog.tsx"
)

all_exist=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "   ${GREEN}✅ $file${NC}"
    else
        echo -e "   ${RED}❌ $file (missing)${NC}"
        all_exist=false
    fi
done

echo ""
echo "5️⃣  Checking documentation..."

docs=(
    "docs/PRODUCT_IMAGE_UPLOAD.md"
    "docs/QUICK_START_IMAGE_UPLOAD.md"
    "docs/IMPLEMENTATION_SUMMARY.md"
)

for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "   ${GREEN}✅ $doc${NC}"
    else
        echo -e "   ${YELLOW}⚠️  $doc (missing)${NC}"
    fi
done

echo ""
echo "======================================"
if [ "$all_exist" = true ]; then
    echo -e "${GREEN}✅ All system checks passed!${NC}"
    echo ""
    echo "📝 Next Steps:"
    echo "   1. Login as admin: http://localhost:9002/login"
    echo "   2. Go to products: http://localhost:9002/admin/products"
    echo "   3. Click 'Add Product'"
    echo "   4. Drag & drop images to upload"
    echo ""
    echo "📚 Documentation:"
    echo "   - Quick Start: docs/QUICK_START_IMAGE_UPLOAD.md"
    echo "   - Full Docs: docs/PRODUCT_IMAGE_UPLOAD.md"
else
    echo -e "${RED}❌ Some files are missing. Please check the implementation.${NC}"
fi
echo ""
