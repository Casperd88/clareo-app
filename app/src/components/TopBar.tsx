import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { IconButton } from './IconButton';

interface TopBarProps {
  onBack?: () => void;
  onMenu?: () => void;
  // The player screen sits over a dark shader, so icon stroke is white
  // by default. Other screens can override via `tint`.
  tint?: string;
}

export function TopBar({ onBack, onMenu, tint = '#FFFFFF' }: TopBarProps) {
  return (
    <View style={styles.container}>
      <IconButton onPress={onBack}>
        <Svg
          width={22}
          height={22}
          viewBox="0 0 24 24"
          fill="none"
          stroke={tint}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Path d="m18 9-6 6-6-6" />
        </Svg>
      </IconButton>
      <IconButton onPress={onMenu}>
        <Svg
          width={22}
          height={22}
          viewBox="0 0 24 24"
          fill="none"
          stroke={tint}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Circle cx={12} cy={12} r={1} />
          <Circle cx={12} cy={5} r={1} />
          <Circle cx={12} cy={19} r={1} />
        </Svg>
      </IconButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
});
