import { FeatureGate } from '@/components/FeatureGate'
import React from 'react'

export function withPracticeGate(Component: React.ComponentType<any>) {
  return function GatedComponent(props: any) {
    return (
      <FeatureGate feature='practice'>
        <Component {...props} />
      </FeatureGate>
    )
  }
}
