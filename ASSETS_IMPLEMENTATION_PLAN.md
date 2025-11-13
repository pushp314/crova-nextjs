# CROVA Assets Implementation Plan

## 📊 Assets Inventory

### Images: 22 files (.jpg)
- Hash-named images: 20 files (professional product/lifestyle shots)
- WhatsApp image: 1 file (likely behind-the-scenes or casual)

### Videos: 8 files (.mp4)
- Hash-named videos: 3 files
- WhatsApp videos: 5 files (various timestamps)

---

## 🎯 Recommended Implementation Strategy

Based on typical e-commerce best practices for a fashion brand like CROVA, here's where to use these assets:

### 1. **Hero Section** (Homepage)
**Best Use: 1 High-Impact Video or Image**

**Recommendation:**
- Use: `20251110_1123_New Video_simple_compose_01k9p55zzaffnb6t04xsww49dq.mp4`
- Why: The filename suggests it's a composed/edited video specifically for this purpose
- Fallback: One of the hash-named images for users who prefer reduced motion

**Alternative:** If video doesn't work, use the most striking product/lifestyle image

---

### 2. **Featured Products Section** (Homepage)
**Best Use: 4-6 Product Images**

**Recommendation:** Select 4 best product shots from:
- `5834cd7fe7924254bd9be69ec0a4d1b8.jpg`
- `a7d42d6d432245c9920d8acdd5c6f0ca.jpg`
- `bb9544cd0c6d48638515b7d70918138b.jpg`
- `ed863cecb5084dcc9b88ca11a18733a8.jpg`

**Criteria:**
- Clear product visibility
- Good lighting
- Diverse styles/colors
- Professional composition

---

### 3. **Men's/Women's Collection Cards** (Homepage)
**Best Use: 2 Lifestyle/Editorial Images**

**Recommendation:**
- Men's: One image with masculine styling
- Women's: One image with feminine styling

**Select from:**
- `631c5a0b96d74210adb1ffc046abea67.jpg`
- `69aa23d17a314b2aac0ca8e772ec8ff4.jpg`
- `936609171b154c3e8785ed00c21f0818.jpg`
- `dcb05b24a8eb40b599e7b4b4e1f9f892.jpg`

---

### 4. **About/Story Section** (New section or About page)
**Best Use: 2-3 Behind-the-Scenes Images**

**Recommendation:**
- Use: `WhatsApp Image 2025-11-10 at 11.15.23_fe6592dc.jpg`
- Additional candid/workshop images showing craftsmanship
- Shows authenticity and brand story

---

### 5. **Product Pages** (Individual product details)
**Best Use: Multiple Angles per Product**

**Recommendation:** Organize remaining images as product galleries:
- Front view
- Back view
- Detail shots
- Lifestyle/worn shots

**Images pool:**
- All remaining hash-named JPGs can be product images
- Group by similar products (if identifiable)

---

### 6. **Social Proof / Instagram-Style Feed**
**Best Use: Video Carousel or Grid**

**Recommendation:** Create an "As Seen On You" section with videos

**Videos to use:**
- `WhatsApp Video 2025-11-10 at 11.16.42_791dc088.mp4`
- `WhatsApp Video 2025-11-10 at 11.16.42_ac39432f.mp4`
- `WhatsApp Video 2025-11-10 at 11.18.39_47e1ef6b.mp4`

**Why WhatsApp videos:** They look authentic, user-generated, which builds trust

---

### 7. **Promotional Banners**
**Best Use: 1-2 Wide-Format Images**

**Recommendation:**
- Select images that work well in 16:9 or wider aspect ratios
- Consider images with space for text overlay
- Use in banner slider component

---

## 🚫 Assets to Skip (For Now)

**Don't use all assets at once!** Here's what to hold back:

1. **Duplicate/Similar Videos**: If multiple videos show the same thing, pick the best quality one
2. **Low-Quality Assets**: Any blurry or poorly lit images
3. **Redundant Angles**: If you have 3 similar shots, use only the best one
4. **Overwhelming Content**: Save some assets for future updates, seasonal changes, or A/B testing

---

## �� Implementation Priority

### Phase 1: Essential (Do First)
1. ✅ Hero video/image
2. ✅ 4 featured product images
3. ✅ 2 collection category images (Men's/Women's)

### Phase 2: Enhancement (Do Next)
4. ⏳ Product page galleries (3-4 images per product)
5. ⏳ About/Story section images
6. ⏳ Promotional banners

### Phase 3: Engagement (Optional)
7. ⏳ Social proof video section
8. ⏳ Customer gallery
9. ⏳ Blog/lookbook images

---

## 🎨 Technical Implementation Guidelines

### For Videos:
```tsx
<video
  autoPlay
  loop
  muted
  playsInline
  className="absolute inset-0 w-full h-full object-cover"
>
  <source src="/assets/video-file.mp4" type="video/mp4" />
</video>
```

### For Images:
```tsx
<Image
  src="/assets/image-file.jpg"
  alt="Descriptive alt text"
  fill
  className="object-cover"
  priority={isHero} // true for hero, false for others
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### Optimization:
1. **Compress all images** (use tools like TinyPNG or ImageOptim)
2. **Convert to WebP** format where possible
3. **Create multiple sizes** for responsive loading
4. **Use lazy loading** for non-critical images
5. **Add proper alt text** for accessibility and SEO

---

## 📁 Recommended File Structure

```
public/
  assets/
    hero/
      hero-video.mp4
      hero-image.jpg
    products/
      product-1-front.jpg
      product-1-back.jpg
      product-2-front.jpg
      ...
    collections/
      mens-collection.jpg
      womens-collection.jpg
    lifestyle/
      about-1.jpg
      about-2.jpg
    social/
      customer-video-1.mp4
      customer-video-2.mp4
```

Move assets from `src/assets/` to `public/assets/` with organized naming.

---

## 🎯 My Specific Recommendations for CROVA

Based on your brand ("Because your story deserves more than a print" - embroidered fashion):

### Must-Use Assets:
1. **Hero**: The composed video - shows movement, luxury, attention-grabbing
2. **Products**: 4 best embroidered tee close-ups - shows craftsmanship
3. **Collections**: 2 lifestyle shots - shows the products being worn
4. **Social Proof**: 2-3 customer videos - builds authenticity

### Save for Later:
- Extra product shots for when you add more products to catalog
- Seasonal/campaign-specific images
- Blog content
- Email marketing

---

## ✅ Next Steps

1. **Review assets manually** - Open each file and categorize by quality and content
2. **Rename files descriptively** - e.g., `hero-video.mp4`, `product-navy-tee-front.jpg`
3. **Move to public folder** - From `src/assets/` to `public/assets/organized-name/`
4. **Optimize files** - Compress and convert formats
5. **Implement gradually** - Start with hero, then products, then enhance
6. **Get client approval** - Show her the implementation before going live

---

## 💡 Pro Tips

1. **Quality over Quantity** - 10 great images beat 30 mediocre ones
2. **Consistent Style** - Choose assets that feel cohesive
3. **Leave Room to Grow** - Save some assets for future content updates
4. **Test Loading Speed** - Don't let too many assets slow down your site
5. **Mobile-First** - Ensure all assets look good on small screens

Would you like me to help you implement specific sections?
