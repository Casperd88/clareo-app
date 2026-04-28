import React, { useEffect, useMemo, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../theme';
import type { AppTheme } from '../theme';

interface PlayerControlsProps {
  isPlaying: boolean;
  isActive?: boolean;
  disabled?: boolean;
  onPlayPause?: () => void;
  onSkipBack?: () => void;
  onSkipForward?: () => void;
}

const BAR_WIDTH = 4;
const BAR_RADIUS = 2;
const BAR_GAP = 5;

interface WaveformBarProps {
  isActive: boolean;
  delay: number;
  minHeight: number;
  maxHeight: number;
  color: string;
}

function WaveformBar({ isActive, delay, minHeight, maxHeight, color }: WaveformBarProps) {
  const height = useRef(new Animated.Value(minHeight)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isActive) {
      const animate = () => {
        animationRef.current = Animated.loop(
          Animated.sequence([
            Animated.timing(height, {
              toValue: maxHeight,
              duration: 280 + Math.random() * 180,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false,
            }),
            Animated.timing(height, {
              toValue: minHeight + 6,
              duration: 280 + Math.random() * 180,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false,
            }),
          ]),
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
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
  }, [isActive, delay, minHeight, maxHeight, height]);

  return (
    <Animated.View
      style={{
        height,
        width: BAR_WIDTH,
        borderRadius: BAR_RADIUS,
        backgroundColor: color,
      }}
    />
  );
}

function PlayingWaveform({ isActive, color }: { isActive: boolean; color: string }) {
  return (
    <View style={styles.waveformContainer}>
      <WaveformBar isActive={isActive} delay={0} minHeight={6} maxHeight={24} color={color} />
      <WaveformBar isActive={isActive} delay={100} minHeight={6} maxHeight={32} color={color} />
      <WaveformBar isActive={isActive} delay={50} minHeight={6} maxHeight={20} color={color} />
    </View>
  );
}

export function PlayerControls({
  isPlaying,
  isActive = true,
  disabled = false,
  onPlayPause,
  onSkipBack,
  onSkipForward,
}: PlayerControlsProps) {
  const theme = useTheme();
  const skinStyles = useMemo(() => createStyles(theme), [theme]);
  const opacity = disabled ? 0.5 : 1;
  // Player screen sits over a dark shader, so icons/skip text are white.
  const iconStroke = '#FFFFFF';
  const playFill = '#FFFFFF';

  return (
    <View style={[skinStyles.container, { opacity }]}>
      <TouchableOpacity
        onPress={onSkipBack}
        activeOpacity={0.7}
        style={skinStyles.skipButton}
        disabled={disabled}
      >
        <Svg
          width={30}
          height={30}
          viewBox="0 0 24 24"
          fill="none"
          stroke={iconStroke}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <Path d="M3 3v5h5" />
        </Svg>
        <Text style={skinStyles.skipText}>15</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onPlayPause}
        activeOpacity={0.9}
        style={skinStyles.playButton}
        disabled={disabled}
      >
        {isPlaying ? (
          <PlayingWaveform isActive={isActive} color={theme.colors.primary} />
        ) : (
          <Svg width={32} height={32} viewBox="0 0 24 24" fill={theme.colors.primary} stroke="none">
            <Path d="M6.528 3.117A1 1 0 0 0 5 4v16a1 1 0 0 0 1.528.853l12-8a1 1 0 0 0 0-1.706l-12-8Z" />
          </Svg>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onSkipForward}
        activeOpacity={0.7}
        style={skinStyles.skipButton}
        disabled={disabled}
      >
        <Svg
          width={30}
          height={30}
          viewBox="0 0 24 24"
          fill="none"
          stroke={iconStroke}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <Path d="M21 3v5h-5" />
        </Svg>
        <Text style={skinStyles.skipText}>15</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: BAR_GAP,
    height: 36,
  },
});

function createStyles(theme: AppTheme) {
  const { fonts } = theme;
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      marginBottom: 0,
    },
    skipButton: {
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.7,
    },
    skipText: {
      fontSize: 10,
      position: 'absolute',
      fontFamily: fonts.body.medium,
      color: '#FFFFFF',
    },
    playButton: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000000',
      shadowOpacity: 0.35,
      shadowRadius: 30,
      shadowOffset: { width: 0, height: 12 },
      elevation: 12,
    },
  });
}
