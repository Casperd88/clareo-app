import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

interface AudioWaveformProps {
  isPlaying: boolean;
}

const BAR_WIDTH = 3;
const BAR_RADIUS = 1.5;
const BAR_GAP = 4;

interface WaveformBarProps {
  isPlaying: boolean;
  delay: number;
  minHeight: number;
  maxHeight: number;
}

function WaveformBar({ isPlaying, delay, minHeight, maxHeight }: WaveformBarProps) {
  const height = useRef(new Animated.Value(minHeight)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        animationRef.current = Animated.loop(
          Animated.sequence([
            Animated.timing(height, {
              toValue: maxHeight,
              duration: 300 + Math.random() * 200,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false,
            }),
            Animated.timing(height, {
              toValue: minHeight + 4,
              duration: 300 + Math.random() * 200,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false,
            }),
          ])
        );
        animationRef.current.start();
      };

      const timeout = setTimeout(animate, delay);
      return () => {
        clearTimeout(timeout);
        animationRef.current?.stop();
      };
    } else {
      animationRef.current?.stop();
      Animated.timing(height, {
        toValue: minHeight,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [isPlaying, delay, minHeight, maxHeight, height]);

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          height,
          width: BAR_WIDTH,
          borderRadius: BAR_RADIUS,
        },
      ]}
    />
  );
}

export function AudioWaveform({ isPlaying }: AudioWaveformProps) {
  return (
    <View style={styles.container}>
      <WaveformBar isPlaying={isPlaying} delay={0} minHeight={4} maxHeight={18} />
      <WaveformBar isPlaying={isPlaying} delay={100} minHeight={4} maxHeight={24} />
      <WaveformBar isPlaying={isPlaying} delay={50} minHeight={4} maxHeight={16} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: BAR_GAP,
    height: 28,
    marginBottom: 12,
  },
  bar: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
