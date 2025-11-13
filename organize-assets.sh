#!/bin/bash

# CROVA Assets Organization Helper Script
# This script helps you organize your assets into a proper structure

echo "🎨 CROVA Assets Organization Helper"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create directory structure
echo -e "${BLUE}📁 Creating directory structure...${NC}"
mkdir -p public/assets/hero
mkdir -p public/assets/products
mkdir -p public/assets/collections
mkdir -p public/assets/social
mkdir -p public/assets/about

echo -e "${GREEN}✓ Directories created!${NC}"
echo ""

echo -e "${YELLOW}📋 Next Steps:${NC}"
echo ""
echo "1. Review images in: src/assets/"
echo "2. Copy your selected files to the appropriate folders:"
echo ""
echo "   ${BLUE}Hero Section:${NC}"
echo "   cp src/assets/20251110_1123_New\ Video_simple_compose_01k9p55zzaffnb6t04xsww49dq.mp4 public/assets/hero/hero-video.mp4"
echo ""
echo "   ${BLUE}Featured Products (pick 4):${NC}"
echo "   cp src/assets/YOUR_CHOICE_1.jpg public/assets/products/featured-1.jpg"
echo "   cp src/assets/YOUR_CHOICE_2.jpg public/assets/products/featured-2.jpg"
echo "   cp src/assets/YOUR_CHOICE_3.jpg public/assets/products/featured-3.jpg"
echo "   cp src/assets/YOUR_CHOICE_4.jpg public/assets/products/featured-4.jpg"
echo ""
echo "   ${BLUE}Collections (pick 2):${NC}"
echo "   cp src/assets/YOUR_MENS_CHOICE.jpg public/assets/collections/mens-collection.jpg"
echo "   cp src/assets/YOUR_WOMENS_CHOICE.jpg public/assets/collections/womens-collection.jpg"
echo ""
echo "   ${BLUE}Social Proof (pick 2-3 WhatsApp videos):${NC}"
echo "   cp src/assets/WhatsApp\ Video\ 2025-11-10\ at\ 11.16.42_791dc088.mp4 public/assets/social/customer-1.mp4"
echo "   cp src/assets/WhatsApp\ Video\ 2025-11-10\ at\ 11.18.39_47e1ef6b.mp4 public/assets/social/customer-2.mp4"
echo ""
echo "3. View assets: open src/assets/"
echo ""
echo -e "${GREEN}📁 Directory structure ready!${NC}"
echo ""
echo "File sizes for your reference:"
ls -lh src/assets/ | grep -E "\.(jpg|mp4)$" | awk '{print $9, "(" $5 ")"}'
