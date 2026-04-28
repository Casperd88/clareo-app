import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import type { AppTheme } from '../theme';

interface TrackInfoProps {
  title: string;
  author: string;
}

export function TrackInfo({ title, author }: TrackInfoProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.author}>{author}</Text>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  const { fonts } = theme;
  return StyleSheet.create({
    container: {
      alignItems: 'flex-start',
    },
    // The player screen always renders over a dark shader, so type
    // colors are pinned to white rather than themed.
    title: {
      fontFamily: fonts.display.regular,
      fontSize: 26,
      lineHeight: 30,
      letterSpacing: -0.4,
      color: '#FFFFFF',
      marginBottom: 6,
    },
    author: {
      fontFamily: fonts.display.italic,
      fontStyle: 'italic',
      fontSize: 16,
      lineHeight: 22,
      color: 'rgba(255,255,255,0.78)',
    },
  });
}
