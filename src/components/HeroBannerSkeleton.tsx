import React from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'

const SCREEN_WIDTH = Dimensions.get('window').width
const BANNER_HEIGHT = 200

export default function HeroBannerSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.skeletonBanner}>
        <View style={styles.skeletonOverlay}>
          <View style={styles.skeletonTextLarge} />
          <View style={styles.skeletonTextSmall} />
          <View style={styles.skeletonButton} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: BANNER_HEIGHT,
    marginBottom: 16,
  },
  skeletonBanner: {
    width: SCREEN_WIDTH,
    height: BANNER_HEIGHT,
    backgroundColor: '#e0e0e0',
  },
  skeletonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  skeletonTextLarge: {
    height: 28,
    width: '70%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonTextSmall: {
    height: 18,
    width: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: 16,
  },
  skeletonButton: {
    height: 40,
    width: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
  },
})
