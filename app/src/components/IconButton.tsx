import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';

interface IconButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  opacity?: number;
}

export function IconButton({ onPress, children, style, opacity = 1 }: IconButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.button, { opacity }, style]}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
