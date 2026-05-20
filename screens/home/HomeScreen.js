// ═══════════════════════════════════════════════════════
// Karigar AI — HomeScreen Component
// ═══════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS, SHADOWS } from '../../constants/layout';
import ServiceGrid from '../../components/home/ServiceGrid';
import KarigarCard from '../../components/home/KarigarCard';
import providersData from '../../data/providers.json';
import { getFirebaseDB, ref, onValue } from '../../config/firebase';

export default function HomeScreen({ navigation }) {
  const [recentProviders, setRecentProviders] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);

  useEffect(() => {
    // Select top 4 rated providers from local data to display as recommended
    const recommended = [...providersData]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
    setRecentProviders(recommended);

    // Check Firebase for any active en-route bookings — with proper cleanup
    let unsubscribe = null;
    
    try {
      const db = getFirebaseDB();
      const bookingsRef = ref(db, 'bookings');
      unsubscribe = onValue(bookingsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
          // Find any active booking that is not completed
          const active = list.reverse().find(b => b.status !== 'completed');
          setActiveBooking(active || null);
        }
      });
    } catch (e) {
      console.log('[HOME_SCREEN] Firebase connection error:', e.message);
    }

    // Cleanup: Unsubscribe from Firebase when component unmounts
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleSearchPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Chat', { screen: 'ChatScreen' });
  };

  const handleCategoryPress = (category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Chat', {
      screen: 'ChatScreen',
      params: { prefill: category.query },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header Panel */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Assalam-o-Alaikum 👋</Text>
          <Text style={styles.subGreeting}>Azan — Karachi, Pakistan</Text>
        </View>
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
        >
          <Text style={styles.bellEmoji}>🔔</Text>
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Active Booking Banner */}
        {activeBooking && (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.activeBanner}
            onPress={() => navigation.navigate('Booking', { screen: 'TrackingScreen', params: { bookingId: activeBooking.id } })}
          >
            <View style={styles.activeBannerLeft}>
              <Text style={styles.activeLabel}>⚡ LIVE BOOKING ACTIVE</Text>
              <Text style={styles.activeText}>
                {activeBooking.provider_name} is currently: <Text style={styles.activeStatus}>{(activeBooking.status || 'en_route').toUpperCase().replace('_', ' ')}</Text>
              </Text>
            </View>
            <Text style={styles.arrowEmoji}>➡️</Text>
          </TouchableOpacity>
        )}

        {/* Premium AI Bar (Main CTA) */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.searchBar}
          onPress={handleSearchPress}
        >
          <View style={styles.searchLeft}>
            <Text style={styles.searchIcon}>💬</Text>
            <Text style={styles.searchPlaceholder}>Ask Karigar AI (e.g. 'AC thik karna hai')</Text>
          </View>
          <View style={styles.searchMic}>
            <Text style={styles.micEmoji}>🎙️</Text>
          </View>
        </TouchableOpacity>

        {/* Category Grid */}
        <ServiceGrid onCategoryPress={handleCategoryPress} />

        {/* Recommended Karigars Carousel */}
        <View style={styles.carouselContainer}>
          <Text style={styles.carouselTitle}>Top Rated Nearby</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselScroll}
          >
            {recentProviders.map((p) => (
              <KarigarCard
                key={p.id}
                provider={p}
                width={210}
                style={styles.carouselCard}
                onBookPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  navigation.navigate('Booking', {
                    screen: 'BookingScreen',
                    params: { provider: p },
                  });
                }}
                onCardPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate('Map', {
                    screen: 'MapScreen',
                    params: { selectedProvider: p },
                  });
                }}
              />
            ))}
          </ScrollView>
        </View>

        {/* How It Works Guidelines */}
        <View style={styles.howContainer}>
          <Text style={styles.carouselTitle}>How Karigar AI Works</Text>
          <View style={styles.stepCard}>
            <Text style={styles.stepNum}>1</Text>
            <View style={styles.stepTextContent}>
              <Text style={styles.stepTitle}>Voice or Text in Urdu</Text>
              <Text style={styles.stepDesc}>Type or say your home task in Urdu or Roman Urdu. E.g. "Geyser kharab hai".</Text>
            </View>
          </View>
          <View style={styles.stepCard}>
            <Text style={styles.stepNum}>2</Text>
            <View style={styles.stepTextContent}>
              <Text style={styles.stepTitle}>Multi-Agent Matching</Text>
              <Text style={styles.stepDesc}>Our background agents rank candidates using rating, availability, and coordinates.</Text>
            </View>
          </View>
          <View style={styles.stepCard}>
            <Text style={styles.stepNum}>3</Text>
            <View style={styles.stepTextContent}>
              <Text style={styles.stepTitle}>Transparent Live Invoice</Text>
              <Text style={styles.stepDesc}>Approve pricing breakdowns (base, surge, distance) and track your Karigar live.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  greeting: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subGreeting: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellEmoji: {
    fontSize: 18,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  activeBanner: {
    backgroundColor: 'rgba(2, 195, 154, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(2, 195, 154, 0.3)',
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeBannerLeft: {
    flex: 1,
    marginRight: 8,
  },
  activeLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  activeText: {
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  activeStatus: {
    fontWeight: '700',
    color: COLORS.warning,
  },
  arrowEmoji: {
    fontSize: 16,
  },
  searchBar: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.card,
  },
  searchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchPlaceholder: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  searchMic: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micEmoji: {
    fontSize: 14,
  },
  carouselContainer: {
    marginVertical: SPACING.lg,
  },
  carouselTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    letterSpacing: -0.3,
  },
  carouselScroll: {
    paddingHorizontal: SPACING.lg,
  },
  carouselCard: {
    marginRight: SPACING.md,
  },
  howContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  stepNum: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    width: 36,
    textAlign: 'center',
  },
  stepTextContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  stepTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  stepDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
});
