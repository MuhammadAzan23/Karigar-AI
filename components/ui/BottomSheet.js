// ═══════════════════════════════════════════════════════
// Karigar AI — Animated BottomSheet Component
// ═══════════════════════════════════════════════════════

import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { RADIUS, SHADOWS } from '../../constants/layout';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function BottomSheet({
  visible,
  onClose,
  children,
  height = 300,
}) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate up: backdrop opacity to 1, slide up
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate down
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      if (onClose) onClose();
    });
  };

  const backdropOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Backdrop overlay */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
        </TouchableWithoutFeedback>

        {/* Dynamic bottom sheet surface */}
        <Animated.View
          style={[
            styles.sheet,
            {
              height: height,
              transform: [{ translateY: translateY }],
            },
          ]}
        >
          {/* Careem-style drag/handle bar */}
          <View style={styles.handle} />
          
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  sheet: {
    backgroundColor: COLORS.sheet,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: 20,
    paddingTop: 14,
    ...SHADOWS.sheet,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.pill,
    alignSelf: 'center',
    marginBottom: 16,
  },
  content: {
    flex: 1,
  },
});
