# Image Optimization for React Native / Expo

## 📋 Overview

This guide covers best practices for loading and caching images in your React Native/Expo app to eliminate slow loading times and improve user experience.

**Applies to:**
- Hero banner images
- Lesson thumbnails
- User avatars
- Question images
- Any image loaded from URLs

---

## 🎯 Performance Goals

- **First load:** Progressive loading with blur-up effect
- **Cached load:** Instant display (< 100ms)
- **Memory usage:** Efficient caching with automatic cleanup
- **Offline:** Images available from disk cache

---

## 📦 Installation

### 1. Install React Native Fast Image

```bash
npx expo install react-native-fast-image
```

**Why Fast Image?**
- ✅ Aggressive disk caching (persists across app restarts)
- ✅ Priority-based loading
- ✅ Automatic memory management
- ✅ Preloading support
- ✅ Significantly faster than default `<Image>`

**Performance Comparison:**

| Feature | Default `<Image>` | Fast Image |
|---------|------------------|------------|
| Disk cache | ❌ No | ✅ Yes |
| Priority loading | ❌ No | ✅ Yes |
| Preloading | ❌ No | ✅ Yes |
| Memory optimization | ⚠️ Basic | ✅ Advanced |
| Speed | Slow | **5-10x faster** |

---

## 🏗️ Basic Implementation

### Replace Default Image Component

**Before (Slow):**
```typescript
import { Image } from 'react-native';

<Image 
  source={{ uri: 'https://example.com/banner.jpg' }}
  style={{ width: 300, height: 200 }}
/>
```

**After (Fast):**
```typescript
import FastImage from 'react-native-fast-image';

<FastImage
  source={{
    uri: 'https://example.com/banner.jpg',
    priority: FastImage.priority.high,
  }}
  style={{ width: 300, height: 200 }}
  resizeMode={FastImage.resizeMode.cover}
/>
```

**Result:** Image loads from cache on repeat views (instant)

---

## 🚀 Advanced Techniques

### 1. Priority-Based Loading

Load critical images first (hero banners, lesson thumbnails), defer less important images.

```typescript
import FastImage from 'react-native-fast-image';

// HIGH PRIORITY: Hero banners (load immediately)
<FastImage
  source={{
    uri: banner.imageUrl,
    priority: FastImage.priority.high,  // ⚡ Loads first
  }}
  style={styles.heroBanner}
  resizeMode={FastImage.resizeMode.cover}
/>

// NORMAL PRIORITY: Content images (load after hero)
<FastImage
  source={{
    uri: lesson.thumbnailUrl,
    priority: FastImage.priority.normal,  // 📦 Loads second
  }}
  style={styles.thumbnail}
  resizeMode={FastImage.resizeMode.contain}
/>

// LOW PRIORITY: Avatar images (load last)
<FastImage
  source={{
    uri: user.avatarUrl,
    priority: FastImage.priority.low,  // 🐌 Loads last
  }}
  style={styles.avatar}
  resizeMode={FastImage.resizeMode.cover}
/>
```

**Load Order:** High → Normal → Low

---

### 2. Preloading Images

Load images **before** they're needed (during app init or screen transition).

```typescript
import FastImage from 'react-native-fast-image';

// Preload hero banners during splash screen
export async function preloadHeroBannerImages(banners: HeroSection[]): Promise<void> {
  const imageUrls = banners.map(banner => ({
    uri: banner.imageUrl,
    priority: FastImage.priority.high,
  }));

  await FastImage.preload(imageUrls);
  console.log('✅ Hero banner images preloaded');
}

// Usage in App.tsx
useEffect(() => {
  async function prepare() {
    // Fetch banner data
    const banners = await fetchHeroBanners();
    
    // Preload images BEFORE hiding splash screen
    await preloadHeroBannerImages(banners);
    
    setAppIsReady(true);
  }
  
  prepare();
}, []);
```

**Result:** Banners appear instantly when user reaches home screen

---

### 3. Progressive Loading with Blur Effect

Show a blurred placeholder while the full image loads (like Medium.com).

```typescript
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';

interface Props {
  imageUrl: string;
  thumbnailUrl?: string;  // Low-res blur placeholder
}

export default function ProgressiveImage({ imageUrl, thumbnailUrl }: Props) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={styles.container}>
      {/* Blurred thumbnail (loads instantly) */}
      {thumbnailUrl && (
        <FastImage
          source={{ uri: thumbnailUrl }}
          style={[styles.image, styles.thumbnail]}
          resizeMode={FastImage.resizeMode.cover}
          blurRadius={10}  // Apply blur effect
        />
      )}

      {/* Full resolution image (loads progressively) */}
      <FastImage
        source={{
          uri: imageUrl,
          priority: FastImage.priority.high,
        }}
        style={[
          styles.image,
          isLoading && styles.loading,
        ]}
        resizeMode={FastImage.resizeMode.cover}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
  },
  thumbnail: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loading: {
    opacity: 0,  // Hide until loaded
  },
});
```

**User Experience:**
1. Blurred placeholder appears instantly
2. Full image loads in background
3. Smooth fade-in when ready

---

### 4. Cache Management

Control cache behavior and clear when needed.

```typescript
import FastImage from 'react-native-fast-image';

// Clear all cached images (use sparingly)
async function clearImageCache() {
  await FastImage.clearMemoryCache();  // Clear RAM cache
  await FastImage.clearDiskCache();    // Clear disk cache
  console.log('✅ Image cache cleared');
}

// Clear only memory cache (keep disk cache)
async function clearMemoryOnly() {
  await FastImage.clearMemoryCache();
  console.log('✅ Memory cache cleared, disk cache preserved');
}

// Call when user logs out or settings change
export function onUserLogout() {
  clearMemoryOnly();
}
```

**When to Clear Cache:**
- User logs out (clear user-specific images)
- User changes theme (reload themed assets)
- Storage is full (free up space)

**Don't clear cache:**
- On every app start (defeats the purpose!)
- After normal app usage

---

## 🖼️ Image Format Optimization

### Best Practices for Hero Banners

**Recommended Format: WebP**

Why WebP?
- ✅ 25-35% smaller than JPEG at same quality
- ✅ Supports transparency (like PNG)
- ✅ Supported in React Native
- ✅ Fast decoding

**Image Dimensions:**

| Use Case | Dimensions | Max File Size |
|----------|-----------|---------------|
| Hero Banner | 1200×600 (2:1) | 150KB |
| Lesson Thumbnail | 800×600 (4:3) | 80KB |
| User Avatar | 200×200 (1:1) | 20KB |
| Question Image | 1000×800 | 120KB |

**Tools for Conversion:**

1. **ImageMagick** (CLI):
   ```bash
   # Convert JPEG to WebP
   magick convert banner.jpg -quality 85 banner.webp
   ```

2. **Squoosh** (Web): https://squoosh.app
   - Upload image
   - Select WebP format
   - Adjust quality (85% recommended)
   - Download optimized image

3. **TinyPNG** (Web): https://tinypng.com
   - Compresses PNG/JPEG without WebP conversion

---

### Admin Portal: Image Upload Optimization

Add automatic optimization when admins upload banner images.

**File:** `src/api/hero.ts` (Admin Portal)

```typescript
import imageCompression from 'browser-image-compression';

export const heroAPI = {
  async uploadImage(file: File): Promise<string> {
    // Compress image before upload
    const options = {
      maxSizeMB: 0.2,              // Max 200KB
      maxWidthOrHeight: 1200,      // Max 1200px
      useWebWorker: true,
      fileType: 'image/webp',      // Convert to WebP
    };

    const compressedFile = await imageCompression(file, options);
    
    // Upload to Supabase Storage
    const fileName = `hero-${Date.now()}.webp`;
    const { data, error } = await supabase.storage
      .from('hero-images')
      .upload(fileName, compressedFile, {
        cacheControl: '3600',      // Cache for 1 hour
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('hero-images')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  },
};
```

**Install dependency:**
```bash
npm install browser-image-compression
```

**Result:** All uploaded images are automatically optimized for mobile

---

## 🌐 CDN Setup (Optional Enhancement)

Use a CDN for even faster image loading worldwide.

### Option 1: Cloudflare Images (Recommended)

**Benefits:**
- Global CDN (faster loading worldwide)
- Automatic WebP conversion
- On-the-fly resizing
- Free tier: 100K images/month

**Setup:**

1. Sign up at https://cloudflare.com
2. Enable Cloudflare Images
3. Upload images via Cloudflare API
4. Use variant URLs in app

**Example URL:**
```
https://imagedelivery.net/YOUR_ACCOUNT/IMAGE_ID/banner
```

**Variants (auto-generated):**
- `/banner` - 1200×600 WebP
- `/thumbnail` - 400×200 WebP
- `/original` - Original file

---

### Option 2: Supabase Storage + Cloudflare CDN

**Setup:**

1. Enable Cloudflare CDN in Supabase settings
2. Update image URLs to use CDN

**Before:**
```
https://project.supabase.co/storage/v1/object/public/hero-images/banner.jpg
```

**After (with CDN):**
```
https://cdn.supabase.co/hero-images/banner.jpg
```

**Benefits:**
- Faster loading (edge caching)
- No code changes needed
- Free with Supabase

---

## 📊 Performance Monitoring

### Track Image Load Times

```typescript
import { performance } from 'react-native-performance';

export default function MonitoredImage({ imageUrl }: { imageUrl: string }) {
  const handleLoadStart = () => {
    performance.mark(`image-load-start-${imageUrl}`);
  };

  const handleLoadEnd = () => {
    performance.mark(`image-load-end-${imageUrl}`);
    performance.measure(
      'image-load',
      `image-load-start-${imageUrl}`,
      `image-load-end-${imageUrl}`
    );
    
    const measure = performance.getEntriesByName('image-load')[0];
    console.log(`Image loaded in ${measure.duration}ms`);
  };

  return (
    <FastImage
      source={{ uri: imageUrl, priority: FastImage.priority.high }}
      onLoadStart={handleLoadStart}
      onLoadEnd={handleLoadEnd}
      style={styles.image}
    />
  );
}
```

**Target Metrics:**
- First load (no cache): < 1 second
- Cached load: < 100ms

---

## 🐛 Troubleshooting

### Images Not Caching

**Check 1: Verify Fast Image is installed**
```bash
npx expo install react-native-fast-image
```

**Check 2: Rebuild the app**
```bash
npx expo run:ios    # For iOS
npx expo run:android # For Android
```

**Check 3: Test cache status**
```typescript
// Check if image is in cache
FastImage.preload([{ uri: imageUrl }]).then(() => {
  console.log('Image in cache');
});
```

---

### Images Not Loading

**Check 1: Verify URL is accessible**
```typescript
fetch(imageUrl)
  .then(res => console.log('Image accessible:', res.ok))
  .catch(err => console.error('Image error:', err));
```

**Check 2: Check Supabase Storage permissions**
- Ensure bucket is **public**
- Verify RLS policies allow read access

**Check 3: Check CORS settings**
- Supabase Storage should allow cross-origin requests
- No additional setup needed for Expo

---

### Images Loading Slowly

**Fix 1: Use WebP format**
- Convert all images to WebP
- Reduces file size by 30%

**Fix 2: Reduce image dimensions**
- Don't upload 4K images for mobile
- Target: 1200px max width

**Fix 3: Enable CDN**
- Use Cloudflare or Supabase CDN
- Faster loading worldwide

**Fix 4: Preload critical images**
- Preload hero banners during splash screen
- Don't wait for screen to render

---

## ✅ Image Optimization Checklist

### Before Upload (Admin Portal)
- [ ] Compress images (< 200KB per banner)
- [ ] Resize to target dimensions (1200×600)
- [ ] Convert to WebP format
- [ ] Test load time in browser

### In Mobile App
- [ ] Replace `<Image>` with `<FastImage>`
- [ ] Set priority levels (high/normal/low)
- [ ] Preload critical images during splash screen
- [ ] Add progressive loading with blur effect
- [ ] Test caching behavior

### Performance Testing
- [ ] Test first load (should be < 2 seconds)
- [ ] Test cached load (should be < 100ms)
- [ ] Test on slow 3G network
- [ ] Test offline (should show cached images)
- [ ] Monitor memory usage

---

## 🎯 Expected Results

After implementing these optimizations:

✅ **Hero banners load instantly** (from cache)  
✅ **First load shows blur placeholder** (smooth UX)  
✅ **Images cached across app restarts** (offline support)  
✅ **Memory usage optimized** (no crashes)  
✅ **Bandwidth reduced** (smaller WebP files)  
✅ **Faster loading worldwide** (CDN)

---

## 📚 Code Examples Summary

### 1. Basic Fast Image Usage
```typescript
<FastImage
  source={{ uri: imageUrl, priority: FastImage.priority.high }}
  style={{ width: 300, height: 200 }}
  resizeMode={FastImage.resizeMode.cover}
/>
```

### 2. Preload Images
```typescript
await FastImage.preload([
  { uri: banner1.imageUrl, priority: FastImage.priority.high },
  { uri: banner2.imageUrl, priority: FastImage.priority.high },
]);
```

### 3. Progressive Loading
```typescript
<ProgressiveImage 
  imageUrl={banner.imageUrl}
  thumbnailUrl={banner.thumbnailUrl}
/>
```

### 4. Clear Cache
```typescript
await FastImage.clearMemoryCache();
await FastImage.clearDiskCache();
```

---

## 🔗 Related Documentation

- [Hero Banners Optimization](./hero-banners-optimization.md) - Complete caching strategy
- [Backend API Optimization](./backend-api-optimization.md) - Server-side optimizations
- [React Native Fast Image Docs](https://github.com/DylanVann/react-native-fast-image) - Official documentation

---

**Last Updated:** November 16, 2025  
**Key Recommendation:** Use Fast Image + WebP format + Preloading for best results
