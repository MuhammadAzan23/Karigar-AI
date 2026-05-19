import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { C } from '../constants/colors';

/*
  StatusDot — animated availability indicator.
  Props:
    status    — 'online' | 'busy' | 'offline' (default 'offline')
    size      — diameter in px (default 10)
    pulse     — boolean, animate pulse ring (default true for online)
    style     — additional container styles
*/
export default function StatusDot({
  status = 'offline',
  size = 10,
  pulse = undefined,
  style,
}) {
  const shouldPulse = pulse !== undefined ? pulse : status === 'online';
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (shouldPulse) {
      const animation = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 2,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.6,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [shouldPulse]);

  const dotColor =
    status === 'online' ? C.primary :
    status === 'busy' ? C.warning :
    C.textMuted;

  const halfSize = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {shouldPulse && (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              width: size,
              height: size,
              borderRadius: halfSize,
              borderColor: dotColor,
              transform: [{ scale: pulseAnim }],
              opacity: opacityAnim,
            },
          ]}
        />
      )}
      <View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: halfSize,
            backgroundColor: dotColor,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  dot: {},
});
