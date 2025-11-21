# Mobile App Optimization Guide

This folder contains comprehensive guides for optimizing the Jeeva Learning mobile app (React Native/Expo) performance and user experience.

## 📚 Documentation Files

### [1. Hero Banners Optimization](./hero-banners-optimization.md)
Complete guide for implementing fast-loading hero banners in the Expo app with caching, preloading, and loading states.

**Topics Covered:**
- React Query caching strategies
- Preloading during app initialization
- Loading skeletons and placeholders
- Image optimization with React Native Fast Image
- Offline support and cache persistence

**Who Should Read:** Mobile developers implementing the home screen hero section

---

### [2. Backend API Optimization](./backend-api-optimization.md)
Backend and admin portal optimizations that affect mobile app performance.

**Topics Covered:**
- Database query optimization for hero sections
- Admin portal changes (dashboard_heroes bug fix)
- API response optimization
- Rate limiting best practices
- Supabase RLS policies for hero sections

**Who Should Read:** Backend developers, admin portal maintainers

---

### [3. Image Optimization](./image-optimization.md)
Best practices for loading and caching images in React Native applications.

**Topics Covered:**
- React Native Fast Image setup
- Image caching strategies
- Progressive image loading
- Image format optimization (WebP)
- CDN setup and optimization
- Placeholder images and blur effects

**Who Should Read:** Mobile developers working with images and media

---

## 🎯 Quick Start

If you're experiencing **slow hero banner loading** in the Expo app:

1. **Read Hero Banners Optimization first** - Implement caching and preloading
2. **Then read Image Optimization** - Set up Fast Image for hero banner images
3. **Review Backend API Optimization** - Understand what's happening on the backend

---

## 🔗 Related Documentation

- [Mobile App Chat Integration](../MOBILE_APP_CHAT_INTEGRATION.md) - JeevaBot implementation
- [Subscription Plans Setup](../SUBSCRIPTION_PLANS_SETUP.md) - Managing AI limits
- [Mobile App Features](../MOBILE_APP_FEATURES.md) - Complete feature list
- [Database Schema](../DATABASE_SCHEMA.md) - Full database structure

---

## 📝 November 16, 2025 Updates

### Admin Portal Fix
- **Fixed:** `dashboard_heroes` table name bug in `src/api/dashboard.ts`
- **Changed to:** `hero_sections` (correct table name)
- **Impact:** Dashboard hero methods now use the correct database table

### Documentation Created
- Created comprehensive mobile app optimization guides
- Step-by-step implementation instructions
- Code examples for React Native/Expo
- Backend optimization strategies

---

## 💡 Performance Targets

After implementing these optimizations, you should achieve:

- **Hero Banner Load Time:** < 500ms (with cache)
- **First Load:** < 2 seconds (with loading skeleton)
- **Image Display:** Progressive loading with blur-up effect
- **Offline Support:** Cached banners available offline
- **Memory Usage:** Efficient image caching with automatic cleanup

---

## 🆘 Need Help?

If you encounter issues during implementation:

1. Check the specific guide for troubleshooting sections
2. Review the code examples carefully
3. Ensure all dependencies are installed
4. Test on both iOS and Android devices
5. Check React Query DevTools for cache status

---

**Last Updated:** November 16, 2025
