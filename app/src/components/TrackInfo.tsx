import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../constants';

interface TrackInfoProps {
  title: string;
  author: string;
}

export function TrackInfo({ title, author }: TrackInfoProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.author}>{author}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 29,
    color: Colors.primary,
  },
  author: {
    fontSize: 16,
    color: Colors.secondary,
    opacity: 0.5,
    fontFamily: Fonts.medium,
    fontWeight: '500',
  },
});
