import React, { useRef, useState } from 'react'
import {
  View,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
} from 'react-native'
import FastImage from 'react-native-fast-image'
import { HeroSection } from '@/api/hero'

const SCREEN_WIDTH = Dimensions.get('window').width
const BANNER_HEIGHT = 200

interface Props {
  banners: HeroSection[]
}

export default function HeroBannerCarousel({ banners }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x
    const index = Math.round(contentOffsetX / SCREEN_WIDTH)
    setActiveIndex(index)
  }

  const renderBanner = ({ item }: { item: HeroSection }) => (
    <TouchableOpacity
      style={styles.bannerContainer}
      activeOpacity={0.9}
      onPress={() => {
        console.log('Banner clicked:', item.cta_link)
      }}
    >
      {item.image_url && (
        <FastImage
          source={{
            uri: item.image_url,
            priority: FastImage.priority.high,
          }}
          style={styles.bannerImage}
          resizeMode={FastImage.resizeMode.cover}
        />
      )}
      
      <View style={styles.overlay}>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={styles.subtitle} numberOfLines={2}>
              {item.subtitle}
            </Text>
          )}
          {item.cta_text && (
            <View style={styles.ctaButton}>
              <Text style={styles.ctaText}>{item.cta_text}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )

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
  )
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
    width: 24,
  },
})
