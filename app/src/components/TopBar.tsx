import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { IconButton } from './IconButton';
import { Colors, Fonts } from '../constants';

interface TopBarProps {
  onBack?: () => void;
  onMenu?: () => void;
}

export function TopBar({ onBack, onMenu }: TopBarProps) {
  return (
    <View style={styles.container}>
      <IconButton onPress={onBack}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={Colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="m18 9-6 6-6-6" />
        </Svg>
      </IconButton>
      <IconButton onPress={onMenu}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={Colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
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
