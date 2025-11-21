# Hero Banners Optimization for Expo App

## 📋 Overview

This guide explains how to optimize hero banner loading in your React Native/Expo app to eliminate slow loading times and improve user experience.

**Problem:** Hero banners load slowly every time the app starts because they're fetched from Supabase after the screen renders.

**Solution:** Implement aggressive caching, preloading during splash screen, and loading states for seamless UX.

---

## 🎯 Performance Goals

- **First Load:** < 2 seconds (with loading skeleton)
- **Cached Load:** < 500ms (instant from cache)
- **Offline:** Banners available from cache
- **Image Display:** Progressive loading with smooth transitions

---

## 📦 Required Dependencies

Install these packages in your Expo app:

```bash
# React Query for data caching
npm install @tanstack/react-query

# Async storage for cache persistence
npm install @react-native-async-storage/async-storage

# Fast image loading with caching
npm install react-native-fast-image

# Expo splash screen control
npx expo install expo-splash-screen
```

---

## 🏗️ Architecture Overview

```
App Initialization (App.tsx)
    ↓
Preload Hero Banners (QueryClient prefetch)
    ↓
Cache in Memory + AsyncStorage
    ↓
Hide Splash Screen
    ↓
User Sees Home Screen
    ↓
Instant Banner Display (from cache)
```

---

## 📝 Step-by-Step Implementation

### Step 1: Set Up React Query with Cache Persistence

Create `src/lib/queryClient.ts`:

```typescript
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create persister for offline cache
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  throttleTime: 1000, // Save to storage every 1 second
});

// Configure QueryClient with aggressive caching for hero banners
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache hero banners for 10 minutes
      staleTime: 10 * 60 * 1000, // 10 minutes
      
      // Keep in cache for 24 hours
      cacheTime: 24 * 60 * 60 * 1000, // 24 hours
      
      // Retry failed requests
      retry: 2,
      
      // Refetch on mount only if stale
      refetchOnMount: 'always',
      
      // Don't refetch on window focus (mobile doesn't need this)
      refetchOnWindowFocus: false,
      
      // Don't refetch on reconnect (we want cache)
      refetchOnReconnect: false,
    },
  },
});
```

---

### Step 2: Wrap App with Query Provider

Update your `App.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, asyncStoragePersister } from './src/lib/queryClient';
import { preloadHeroBanners } from './src/api/hero';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Preload hero banners during splash screen
        await preloadHeroBanners(queryClient);
        
        // Add any other preloading here (fonts, assets, etc.)
        // await Font.loadAsync({ ... });
        
      } catch (error) {
        console.warn('Error during app initialization:', error);
        // Continue even if preload fails
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      // Hide splash screen when ready
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null; // Splash screen stays visible
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      {/* Your app navigation here */}
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </PersistQueryClientProvider>
  );
}
```

---

### Step 3: Create Hero Banner API with Preloading

Create `src/api/hero.ts`:

```typescript
import { QueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

export interface HeroSection {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  displayOrder: number;
}

// Query key for React Query
export const HERO_BANNERS_QUERY_KEY = ['hero-banners'];

/**
 * Fetch active hero banners from Supabase
 */
export async function fetchHeroBanners(): Promise<HeroSection[]> {
  const { data, error } = await supabase
    .from('hero_sections')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching hero banners:', error);
    throw error;
  }

  return data.map(banner => ({
    id: banner.id,
    title: banner.title,
    subtitle: banner.subtitle,
    imageUrl: banner.image_url,
    ctaText: banner.cta_text,
    ctaLink: banner.cta_link,
    isActive: banner.is_active,
    displayOrder: banner.display_order,
  }));
}

/**
 * Preload hero banners during app initialization
 * This runs BEFORE the home screen renders
 */
export async function preloadHeroBanners(queryClient: QueryClient): Promise<void> {
  try {
    await queryClient.prefetchQuery({
      queryKey: HERO_BANNERS_QUERY_KEY,
      queryFn: fetchHeroBanners,
      staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    });
    console.log('✅ Hero banners preloaded successfully');
  } catch (error) {
    console.warn('⚠️ Failed to preload hero banners:', error);
    // Don't throw - allow app to continue
  }
}
```

---

### Step 4: Create Supabase Client for Mobile

Create `src/api/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials in app.config.js');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
```

**Add to `app.config.js`:**

```javascript
export default {
  expo: {
    // ... other config
    extra: {
      SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
  },
};
```

**Create `.env` file:**

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

### Step 5: Use Hero Banners in Home Screen with Loading State

Create `src/screens/HomeScreen.tsx`:

```typescript
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchHeroBanners, HERO_BANNERS_QUERY_KEY } from '../api/hero';
import HeroBannerCarousel from '../components/HeroBannerCarousel';
import HeroBannerSkeleton from '../components/HeroBannerSkeleton';

export default function HomeScreen() {
  const { data: banners, isLoading, error } = useQuery({
    queryKey: HERO_BANNERS_QUERY_KEY,
    queryFn: fetchHeroBanners,
    staleTime: 10 * 60 * 1000, // 10 minutes (matches preload)
  });

  return (
    <ScrollView style={styles.container}>
      {/* Hero Banner Section */}
      {isLoading && <HeroBannerSkeleton />}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load banners</Text>
        </View>
      )}
      
      {banners && banners.length > 0 && (
        <HeroBannerCarousel banners={banners} />
      )}

      {/* Rest of your home screen content */}
      {/* ... */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#666',
    fontSize: 14,
  },
});
```

---

### Step 6: Create Hero Banner Carousel Component

Create `src/components/HeroBannerCarousel.tsx`:

```typescript
import React, { useRef, useState } from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { FlatList } from 'react-native';
import FastImage from 'react-native-fast-image';
import { HeroSection } from '../api/hero';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BANNER_HEIGHT = 200;

interface Props {
  banners: HeroSection[];
}

export default function HeroBannerCarousel({ banners }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const renderBanner = ({ item }: { item: HeroSection }) => (
    <TouchableOpacity
      style={styles.bannerContainer}
      activeOpacity={0.9}
      onPress={() => {
        // Handle banner CTA link navigation
        console.log('Banner clicked:', item.ctaLink);
      }}
    >
      {/* Image with Fast Image for caching */}
      <FastImage
        source={{
          uri: item.imageUrl,
          priority: FastImage.priority.high,
        }}
        style={styles.bannerImage}
        resizeMode={FastImage.resizeMode.cover}
      />
      
      {/* Gradient Overlay */}
      <View style={styles.overlay}>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {item.subtitle}
          </Text>
          {item.ctaText && (
            <View style={styles.ctaButton}>
              <Text style={styles.ctaText}>{item.ctaText}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        renderItem={renderBanner}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
      />

      {/* Pagination Dots */}
      {banners.length > 1 && (
        <View style={styles.pagination}>
          {banners.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: BANNER_HEIGHT,
    marginBottom: 16,
  },
  bannerContainer: {
    width: SCREEN_WIDTH,
    height: BANNER_HEIGHT,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  textContainer: {
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#f0f0f0',
    marginBottom: 12,
  },
  ctaButton: {
    backgroundColor: '#007aff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  ctaText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
```

---

### Step 7: Create Loading Skeleton

Create `src/components/HeroBannerSkeleton.tsx`:

```typescript
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BANNER_HEIGHT = 200;

export default function HeroBannerSkeleton() {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, []);

  const opacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.skeleton, { opacity }]}>
        <View style={styles.textArea}>
          <View style={styles.titleBar} />
          <View style={styles.subtitleBar} />
          <View style={styles.buttonBar} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: BANNER_HEIGHT,
    marginBottom: 16,
  },
  skeleton: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    justifyContent: 'flex-end',
    padding: 20,
  },
  textArea: {
    marginBottom: 10,
  },
  titleBar: {
    height: 24,
    backgroundColor: '#c0c0c0',
    borderRadius: 4,
    marginBottom: 8,
    width: '70%',
  },
  subtitleBar: {
    height: 16,
    backgroundColor: '#c0c0c0',
    borderRadius: 4,
    marginBottom: 12,
    width: '90%',
  },
  buttonBar: {
    height: 40,
    backgroundColor: '#c0c0c0',
    borderRadius: 8,
    width: 120,
  },
});
```

---

## 🎯 Expected Results

After implementation:

✅ **App starts with splash screen** (1-2 seconds)  
✅ **Hero banners preload in background**  
✅ **Banners cached for 10 minutes**  
✅ **Instant display on subsequent launches** (< 500ms)  
✅ **Loading skeleton shown on first load**  
✅ **Images cached with Fast Image**  
✅ **Offline support via AsyncStorage**

---

## 🔧 Troubleshooting

### Banners Still Loading Slowly

1. **Check cache status:**
   ```typescript
   import { useQueryClient } from '@tanstack/react-query';
   
   const queryClient = useQueryClient();
   const cachedData = queryClient.getQueryData(HERO_BANNERS_QUERY_KEY);
   console.log('Cached banners:', cachedData);
   ```

2. **Verify preload is running:**
   - Check console for "✅ Hero banners preloaded successfully"
   - If missing, check `App.tsx` prepare function

3. **Check network requests:**
   - Install React Query DevTools for debugging
   - Monitor network tab in React Native Debugger

### Images Loading Slowly

1. **Verify Fast Image is installed:**
   ```bash
   npx expo install react-native-fast-image
   ```

2. **Check image URLs are accessible:**
   - Test URLs in browser
   - Ensure Supabase storage is public

3. **Enable Fast Image preloading:**
   ```typescript
   FastImage.preload([
     { uri: banner.imageUrl, priority: FastImage.priority.high }
   ]);
   ```

### Cache Not Persisting

1. **Check AsyncStorage permissions:**
   ```typescript
   import AsyncStorage from '@react-native-async-storage/async-storage';
   
   // Test storage
   AsyncStorage.setItem('test', 'value').then(() => {
     console.log('AsyncStorage working');
   });
   ```

2. **Verify persister is configured:**
   - Check `PersistQueryClientProvider` wrapper in App.tsx

---

## 📊 Performance Monitoring

Add performance tracking to measure improvement:

```typescript
import { PerformanceObserver, performance } from 'react-native-performance';

// Measure banner load time
const start = performance.now();

await preloadHeroBanners(queryClient);

const end = performance.now();
console.log(`Hero banners loaded in ${end - start}ms`);
```

---

## ✅ Next Steps

1. **Implement image optimization** - See [Image Optimization Guide](./image-optimization.md)
2. **Review backend optimizations** - See [Backend API Optimization](./backend-api-optimization.md)
3. **Test on real devices** - iOS and Android performance
4. **Monitor analytics** - Track load times in production

---

**Last Updated:** November 16, 2025  
**Related Docs:** Backend API Optimization, Image Optimization
