import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Defs, Pattern, Polygon, Rect } from 'react-native-svg';

interface TrianglePatternProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const TILE_SIZE = 18;
const TRIANGLE_SIZE = 16;

export function TrianglePattern({ children, style }: TrianglePatternProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <Pattern id="trianglePattern" x="0" y="0" width={TILE_SIZE} height={TILE_SIZE} patternUnits="userSpaceOnUse">
              <Polygon points={`0,0 ${TRIANGLE_SIZE},0 0,${TRIANGLE_SIZE}`} fill="rgba(0,0,0,0.04)" />
            </Pattern>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#trianglePattern)" />
        </Svg>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
});
