import React, { useMemo, useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Easing,
  FadeIn,
  FadeOut,
  Layout,
} from "react-native-reanimated";

interface Word {
  word: string;
  start: number;
  end: number;
}

interface Segment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  words?: Word[];
}

interface SubtitlesProps {
  segments: Segment[];
  currentTime: number;
}

interface AnimatedWordProps {
  word: string;
  isSpoken: boolean;
  progress: number;
  isLast: boolean;
}

const LOOKAHEAD_S = 0.15;

function AnimatedWord({ word, isSpoken, progress, isLast }: AnimatedWordProps) {
  const opacity = useSharedValue(isSpoken ? 1 : 0.35);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isSpoken) {
      opacity.value = withTiming(1, {
        duration: 150,
        easing: Easing.out(Easing.ease),
      });
      scale.value = withSpring(1.02, {
        damping: 15,
        stiffness: 400,
      });
      setTimeout(() => {
        scale.value = withSpring(1, {
          damping: 12,
          stiffness: 300,
        });
      }, 80);
    } else {
      opacity.value = withTiming(0.35, {
        duration: 200,
        easing: Easing.inOut(Easing.ease),
      });
      scale.value = withTiming(1, { duration: 150 });
    }
  }, [isSpoken]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.Text style={[styles.word, animatedStyle]}>
      {word}
      {!isLast ? " " : ""}
    </Animated.Text>
  );
}

function SegmentContainer({
  segment,
  currentTime,
}: {
  segment: Segment;
  currentTime: number;
}) {
  const adjustedTime = currentTime + LOOKAHEAD_S;

  if (!segment.words?.length) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(200).easing(Easing.out(Easing.ease))}
      exiting={FadeOut.duration(150).easing(Easing.in(Easing.ease))}
      layout={Layout.springify().damping(20).stiffness(200)}
      style={styles.segmentContainer}
    >
      <Animated.Text style={styles.textContainer}>
        {segment.words.map((word, index) => {
          const isSpoken = adjustedTime >= word.start;
          const wordDuration = word.end - word.start;
          const progress = isSpoken
            ? Math.min(1, (adjustedTime - word.start) / Math.max(wordDuration, 0.1))
            : 0;

          return (
            <AnimatedWord
              key={`${segment.id}-${index}`}
              word={word.word}
              isSpoken={isSpoken}
              progress={progress}
              isLast={index === segment.words!.length - 1}
            />
          );
        })}
      </Animated.Text>
    </Animated.View>
  );
}

export function Subtitles({ segments, currentTime }: SubtitlesProps) {
  const currentSegment = useMemo(() => {
    return segments.find(
      (seg) => currentTime >= seg.startTime - 0.5 && currentTime < seg.endTime
    );
  }, [segments, currentTime]);

  if (!currentSegment?.words?.length) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <SegmentContainer
        key={currentSegment.id}
        segment={currentSegment}
        currentTime={currentTime}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  segmentContainer: {
    alignItems: "center",
  },
  textContainer: {
    textAlign: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  word: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
    textAlign: "center",
    color: "rgba(0, 0, 0, 1)",
  },
});
