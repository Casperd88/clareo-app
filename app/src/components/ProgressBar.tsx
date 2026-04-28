import React, { useRef, useCallback, useMemo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, LayoutChangeEvent, Pressable } from 'react-native';
import type { Chapter } from '../types';

interface ProgressBarProps {
  progress: number;
  elapsed: string;
  remaining: string;
  duration: number;
  chapters?: Chapter[];
  onSeek?: (progress: number, shouldPlay?: boolean) => void;
}

const HIT_SLOP = 8;
const THUMB_SIZE = 16;
const CHAPTER_GAP = 4;
const TRACK_HEIGHT = 8;

interface ChapterSegment {
  startProgress: number;
  endProgress: number;
  widthPercent: number;
  seekProgress: number;
}

const TRANSITION_OFFSET = 2.5;

export function ProgressBar({ progress, elapsed, remaining, duration, chapters, onSeek }: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const trackRef = useRef<View>(null);
  const trackLayout = useRef({ x: 0, width: 0 });
  const onSeekRef = useRef(onSeek);
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    onSeekRef.current = onSeek;
  }, [onSeek]);

  const measureTrack = useCallback(() => {
    trackRef.current?.measure((x, y, width, height, pageX, pageY) => {
      trackLayout.current = { x: pageX + HIT_SLOP, width: width - HIT_SLOP * 2 };
    });
  }, []);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setTrackWidth(width - HIT_SLOP * 2);
    measureTrack();
  }, [measureTrack]);

  const calculateProgress = useCallback((pageX: number) => {
    const { x, width } = trackLayout.current;
    if (width === 0) return 0;
    const relativeX = pageX - x;
    return Math.min(Math.max(relativeX / width, 0), 1);
  }, []);

  const thumbPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !!onSeekRef.current,
        onMoveShouldSetPanResponder: () => !!onSeekRef.current,
        onPanResponderGrant: () => {
          measureTrack();
        },
        onPanResponderMove: (evt) => {
          if (onSeekRef.current) {
            onSeekRef.current(calculateProgress(evt.nativeEvent.pageX), false);
          }
        },
      }),
    [measureTrack, calculateProgress]
  );

  const chapterSegments = useMemo((): ChapterSegment[] => {
    if (!chapters || chapters.length === 0 || duration <= 0) {
      return [{ startProgress: 0, endProgress: 1, widthPercent: 100, seekProgress: 0 }];
    }

    const sorted = [...chapters].sort((a, b) => a.startTime - b.startTime);
    
    return sorted.map((chapter, index) => {
      const isFirstChapter = index === 0;
      const startTime = isFirstChapter ? 0 : chapter.startTime;
      const startProgress = startTime / duration;
      const endProgress = chapter.endTime / duration;
      const chapterDurationRatio = (chapter.endTime - startTime) / duration;
      const widthPercent = chapterDurationRatio * 100;
      
      let seekTime: number;
      if (isFirstChapter) {
        seekTime = 0;
      } else {
        const prevChapter = sorted[index - 1];
        const gapStart = prevChapter.endTime;
        seekTime = Math.max(gapStart, chapter.startTime - TRANSITION_OFFSET);
      }
      const seekProgress = seekTime / duration;
      
      return { startProgress, endProgress, widthPercent, seekProgress };
    });
  }, [chapters, duration]);

  const handleChapterPress = useCallback((segmentIndex: number) => {
    if (onSeekRef.current && chapterSegments[segmentIndex]) {
      onSeekRef.current(chapterSegments[segmentIndex].seekProgress, true);
    }
  }, [chapterSegments]);

  const handleSingleTrackPress = useCallback((pageX: number) => {
    measureTrack();
    if (onSeekRef.current) {
      onSeekRef.current(calculateProgress(pageX), false);
    }
  }, [measureTrack, calculateProgress]);

  const renderSegmentedTrack = () => {
    if (chapterSegments.length <= 1) {
      return (
        <Pressable 
          style={styles.track}
          onPress={(e) => handleSingleTrackPress(e.nativeEvent.pageX)}
        >
          <View style={[styles.fill, { width: `${clampedProgress * 100}%` }]} />
        </Pressable>
      );
    }

    return (
      <View style={styles.segmentedTrackContainer}>
        {chapterSegments.map((segment, index) => {
          let fillPercent = 0;
          if (clampedProgress >= segment.endProgress) {
            fillPercent = 100;
          } else if (clampedProgress > segment.startProgress) {
            const progressInSegment = clampedProgress - segment.startProgress;
            const segmentDuration = Math.max(
              segment.endProgress - segment.startProgress,
              Number.EPSILON
            );
            fillPercent = (progressInSegment / segmentDuration) * 100;
          }

          return (
            <React.Fragment key={index}>
              <Pressable 
                style={[styles.chapterSegment, { flex: segment.widthPercent }]}
                onPress={() => handleChapterPress(index)}
              >
                <View style={[styles.chapterFill, { width: `${fillPercent}%` }]} />
              </Pressable>
              {index < chapterSegments.length - 1 && (
                <View style={styles.chapterGap} />
              )}
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View
        ref={trackRef}
        style={styles.trackContainer}
        onLayout={handleLayout}
      >
        <View style={styles.trackWrapper}>
          {renderSegmentedTrack()}
          <View
            style={[
              styles.thumbHitArea,
              { left: `${clampedProgress * 100}%`, transform: [{ translateX: -(THUMB_SIZE + 24) / 2 }] },
            ]}
            {...thumbPanResponder.panHandlers}
          >
            <View style={styles.thumb} />
          </View>
        </View>
      </View>
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{elapsed}</Text>
        <Text style={styles.timeText}>{remaining}</Text>
      </View>
    </View>
  );
}

// The ProgressBar lives on the player screen, which always sits over a
// dark shader. Track/fill/text colors are pinned to translucent white
// rather than themed.
const TRACK_COLOR = 'rgba(255,255,255,0.18)';
const FILL_COLOR = '#FFFFFF';
const THUMB_COLOR = '#FFFFFF';
const TIME_COLOR = 'rgba(255,255,255,0.65)';

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  trackContainer: {
    height: THUMB_SIZE + 16,
    justifyContent: 'center',
    marginBottom: 8,
    marginHorizontal: -HIT_SLOP,
    paddingHorizontal: HIT_SLOP,
  },
  trackWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  track: {
    height: TRACK_HEIGHT,
    backgroundColor: TRACK_COLOR,
    borderRadius: TRACK_HEIGHT / 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: FILL_COLOR,
    borderRadius: TRACK_HEIGHT / 2,
  },
  segmentedTrackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: TRACK_HEIGHT,
  },
  chapterSegment: {
    height: TRACK_HEIGHT,
    backgroundColor: TRACK_COLOR,
    borderRadius: TRACK_HEIGHT / 2,
    overflow: 'hidden',
  },
  chapterFill: {
    height: '100%',
    backgroundColor: FILL_COLOR,
    borderRadius: TRACK_HEIGHT / 2,
  },
  chapterGap: {
    width: CHAPTER_GAP,
  },
  thumbHitArea: {
    position: 'absolute',
    width: THUMB_SIZE + 24,
    height: THUMB_SIZE + 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: THUMB_COLOR,
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 13,
    color: TIME_COLOR,
    letterSpacing: 0.4,
    fontVariant: ['tabular-nums'],
  },
});
