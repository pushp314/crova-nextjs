# Image Integration Guide for Crova Website

## 📸 Where to Add Client Images

### 1. Landing Page Hero Section

**Current:** Using placeholder image from `PlaceHolderImages`

**To Update:**
```tsx
// In src/app/page.tsx, replace:
const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

// With a direct path:
<Image
  src="/images/hero/crova-hero.jpg"
  alt="Crova embroidered tees collection"
  fill
  className="object-cover"
  priority
/>
```

**Recommended Image Specs:**
- Size: 1920x1080px minimum
- Format: JPG or WebP
- Subject: Hero shot of Crova products or embroidery process
- Location: `/public/images/hero/crova-hero.jpg`

---

### 2. Men's & Women's Edit Cards

**Current:** Using gradient backgrounds

**To Update in `src/app/page.tsx`:**

```tsx
// Men's Edit Card - Replace this:
<div className="aspect-[4/5] relative bg-gradient-to-br from-slate-100 to-slate-200">

// With:
<div className="aspect-[4/5] relative overflow-hidden">
  <Image
    src="/images/collections/mens-collection.jpg"
    alt="Men's Collection"
    fill
    className="object-cover group-hover:scale-105 transition-transform duration-300"
  />
  <div className="absolute inset-0 bg-black/40" />
  <div className="absolute inset-0 flex items-center justify-center">
    {/* Text content here */}
  </div>
</div>

// Women's Edit Card - Replace this:
<div className="aspect-[4/5] relative bg-gradient-to-br from-rose-100 to-peach-200">

// With same pattern but different image:
<Image
  src="/images/collections/womens-collection.jpg"
  alt="Women's Collection"
  fill
  className="object-cover group-hover:scale-105 transition-transform duration-300"
/>
```

**Recommended Image Specs:**
- Size: 800x1000px minimum (4:5 aspect ratio)
- Format: JPG or WebP
- Subject: Model or flat lay of men's/women's tees
- Location: 
  - `/public/images/collections/mens-collection.jpg`
  - `/public/images/collections/womens-collection.jpg`

---

### 3. About Page - Founders Photos

**Current:** Using emoji placeholders (👩‍🎨 and 🧵)

**To Update in `src/app/about/page.tsx`:**

```tsx
// Rashmeet Kaur Section - Replace:
<div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-6 flex items-center justify-center">
  <div className="text-6xl">👩‍🎨</div>
</div>

// With:
<div className="aspect-square relative rounded-lg mb-6 overflow-hidden">
  <Image
    src="/images/founders/rashmeet.jpg"
    alt="Rashmeet Kaur - Co-Founder of Crova"
    fill
    className="object-cover"
  />
</div>

// Harshleen Suri Section - Replace:
<div className="aspect-square bg-gradient-to-br from-blue-100 to-teal-100 rounded-lg mb-6 flex items-center justify-center">
  <div className="text-6xl">🧵</div>
</div>

// With:
<div className="aspect-square relative rounded-lg mb-6 overflow-hidden">
  <Image
    src="/images/founders/harshleen.jpg"
    alt="Harshleen Suri - Co-Founder of Crova"
    fill
    className="object-cover"
  />
</div>
```

**Recommended Image Specs:**
- Size: 800x800px (square)
- Format: JPG or WebP
- Subject: Professional portraits of Rashmeet and Harshleen
- Background: Studio or plain background
- Location:
  - `/public/images/founders/rashmeet.jpg`
  - `/public/images/founders/harshleen.jpg`

---

### 4. Custom Tees Page - Example Showcase

**To Add in `src/app/custom/page.tsx`:**

Add a gallery section before the pricing section:

```tsx
{/* Add after "What You Can Customize" section */}
<Separator className="my-16" />

<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
  className="mb-20"
>
  <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">Previous Custom Works</h2>
  
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="aspect-square relative rounded-lg overflow-hidden">
        <Image
          src={`/images/custom/example-${i}.jpg`}
          alt={`Custom embroidery example ${i}`}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
    ))}
  </div>
</motion.div>
```

**Recommended Image Specs:**
- Size: 600x600px (square)
- Format: JPG or WebP
- Subject: Close-up shots of custom embroidery work
- Location: `/public/images/custom/example-1.jpg` through `example-4.jpg`

---

### 5. About Page - Studio Photos

**To Add in `src/app/about/page.tsx`:**

Add a photo gallery after the "Inside the Studio" section:

```tsx
{/* Add after the checklist */}
<div className="mt-12 grid md:grid-cols-3 gap-4">
  <div className="aspect-video relative rounded-lg overflow-hidden">
    <Image
      src="/images/studio/embroidery-machine.jpg"
      alt="Crova embroidery machine"
      fill
      className="object-cover"
    />
  </div>
  <div className="aspect-video relative rounded-lg overflow-hidden">
    <Image
      src="/images/studio/workspace.jpg"
      alt="Crova studio workspace"
      fill
      className="object-cover"
    />
  </div>
  <div className="aspect-video relative rounded-lg overflow-hidden">
    <Image
      src="/images/studio/process.jpg"
      alt="Embroidery process"
      fill
      className="object-cover"
    />
  </div>
</div>
```

**Recommended Image Specs:**
- Size: 1200x675px (16:9 aspect ratio)
- Format: JPG or WebP
- Subject: Behind-the-scenes studio shots
- Location:
  - `/public/images/studio/embroidery-machine.jpg`
  - `/public/images/studio/workspace.jpg`
  - `/public/images/studio/process.jpg`

---

## 📁 Complete File Structure

Create these folders and add images:

```
/public
  /images
    /hero
      - crova-hero.jpg
    /collections
      - mens-collection.jpg
      - womens-collection.jpg
    /founders
      - rashmeet.jpg
      - harshleen.jpg
    /custom
      - example-1.jpg
      - example-2.jpg
      - example-3.jpg
      - example-4.jpg
    /studio
      - embroidery-machine.jpg
      - workspace.jpg
      - process.jpg
```

---

## 🎨 Image Optimization Tips

### 1. Use Next.js Image Component
Always use `next/image` for automatic optimization:
```tsx
import Image from 'next/image';

<Image
  src="/images/your-image.jpg"
  alt="Descriptive alt text"
  width={800}
  height={600}
  // or use fill for responsive containers
/>
```

### 2. Image Formats
- **JPG**: For photos with many colors
- **PNG**: For images with transparency
- **WebP**: Best compression (modern browsers)

### 3. Compress Before Upload
Use tools like:
- TinyPNG (https://tinypng.com)
- Squoosh (https://squoosh.app)
- ImageOptim (Mac)

### 4. Alt Text Best Practices
- Be descriptive: "Rashmeet Kaur, Co-Founder of Crova, in studio"
- Include keywords naturally
- Don't start with "Image of" or "Picture of"

---

## ✅ Quick Implementation Checklist

- [ ] Create `/public/images` folder structure
- [ ] Add hero image for landing page
- [ ] Add men's and women's collection photos
- [ ] Add founders' portraits (Rashmeet & Harshleen)
- [ ] Add custom embroidery examples (4 images)
- [ ] Add studio behind-the-scenes photos (3 images)
- [ ] Update Next.js config if using external domains
- [ ] Test all images load correctly
- [ ] Check mobile responsiveness
- [ ] Verify alt text is descriptive

---

## 🔧 Advanced: Using External Image CDN

If images are hosted on external CDN, update `next.config.ts`:

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'your-cdn-domain.com',
      port: '',
      pathname: '/**',
    },
  ],
},
```

Then use full URLs in Image components:
```tsx
<Image
  src="https://your-cdn-domain.com/images/hero.jpg"
  alt="Hero image"
  fill
/>
```

---

## 📞 Questions?

If you need help implementing these images, refer to:
- Next.js Image docs: https://nextjs.org/docs/api-reference/next/image
- Or contact for implementation support
