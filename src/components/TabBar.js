/*
  Custom bottom tab bar — glass surface, animated active indicator.
  Replaces the default react-navigation tab bar.
*/
import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
  Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/colors';
import * as Haptics from 'expo-haptics';

const TABS = [
  { name: 'Landing', icon: 'home',       label: 'Home'    },
  { name: 'Chat',    icon: 'sparkles',   label: 'AI Chat' },
  { name: 'Map',     icon: 'map',        label: 'Nearby'  },
  { name: 'Booking', icon: 'calendar',   label: 'Bookings'},
  { name: 'Profile', icon: 'person',     label: 'Profile' },
];

export default function TabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const anims = useRef(TABS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    TABS.forEach((_, i) => {
      Animated.spring(anims[i], {
        toValue: state.index === i ? 1 : 0,
        useNativeDriver: true,
        speed: 30, bounciness: 8,
      }).start();
    });
  }, [state.index]);

  return (
    <BlurView
      intensity={80} tint="dark"
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}
    >
      {TABS.map((tab, i) => {
        const focused = state.index === i;
        const scale = anims[i].interpolate({
          inputRange: [0, 1], outputRange: [1, 1.08],
        });
        const iconY = anims[i].interpolate({
          inputRange: [0, 1], outputRange: [0, -2],
        });

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => {
              if (!focused) {
                Haptics.selectionAsync();
                navigation.navigate(tab.name);
              }
            }}
            activeOpacity={0.8}
            style={styles.tab}
          >
            {/* Active pill */}
            {focused && (
              <View style={styles.activePill} />
            )}

            <Animated.View style={{
              transform: [{ scale }, { translateY: iconY }],
              alignItems: 'center',
            }}>
              <Ionicons
                name={focused
                  ? tab.icon
                  : `${tab.icon}-outline`}
                size={22}
                color={focused ? C.primary : C.textMuted}
              />
              <Text style={[
                styles.label,
                focused ? styles.labelActive : styles.labelInactive
              ]}>
                {tab.label}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: C.glassBorder,
    backgroundColor: 'rgba(11,22,34,0.85)',
    paddingTop: 10,
  },
  tab: {
    flex: 1, alignItems: 'center',
    justifyContent: 'center', paddingBottom: 6,
    position: 'relative',
  },
  activePill: {
    position: 'absolute', top: -10,
    width: 32, height: 3, borderRadius: 2,
    backgroundColor: C.primary,
  },
  label: { fontSize: 10, fontWeight: '600', marginTop: 4 },
  labelActive: { color: C.primary },
  labelInactive: { color: C.textMuted },
});
