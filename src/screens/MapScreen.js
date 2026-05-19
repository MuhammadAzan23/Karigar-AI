import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Animated, useWindowDimensions, Dimensions
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/colors';
import { T } from '../constants/typography';
import { KARIGARS } from '../constants/mockData';
import KarigarCard from '../components/KarigarCard';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { calculateDistance } from '../utils/location';

const ISLAMABAD = {
  latitude: 33.6844,
  longitude: 73.0479,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0c1a27' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8FB3C5' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0B1622' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1A2F45' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#1E3A5F' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#060E17' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

export default function MapScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  
  const mapRef = useRef(null);
  const listRef = useRef(null);
  
  const [selectedKarigarId, setSelectedKarigarId] = useState(null);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [userCoords, setUserCoords] = useState(null);
  const [locationLabel, setLocationLabel] = useState('Locating...');
  const [locationPermission, setLocationPermission] = useState(false);
  
  // Pulse Animation for User Location Dot
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Curving Polyline tracking path generator
  const getRouteCoordinates = (karigar) => {
    if (!karigar) return [];
    const userLat = userCoords ? userCoords.latitude : ISLAMABAD.latitude;
    const userLng = userCoords ? userCoords.longitude : ISLAMABAD.longitude;
    const steps = 6;
    const coords = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // Slight sinusoidal bend for realistic road mapping
      const bend = Math.sin(t * Math.PI) * 0.003; 
      coords.push({
        latitude: userLat + (karigar.lat - userLat) * t + bend,
        longitude: userLng + (karigar.lng - userLng) * t - bend,
      });
    }
    return coords;
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fetch Live Location on Mount
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationLabel('Permission Denied');
        return;
      }
      setLocationPermission(true);

      let location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserCoords(coords);

      let reverseGeo = await Location.reverseGeocodeAsync(coords);
      if (reverseGeo && reverseGeo.length > 0) {
        const { city, subregion, region } = reverseGeo[0];
        setLocationLabel(`${city || subregion || region || 'Live Location'}`);
      } else {
        setLocationLabel('Live Location');
      }

      // Animate map to live location
      setTimeout(() => {
        mapRef.current?.animateCamera({
          center: coords,
          zoom: 13,
        }, { duration: 1500 });
      }, 500);
    })();
  }, []);

  // Set filter from Chat intent if navigated from ChatScreen
  useEffect(() => {
    if (route.params?.intent) {
      const chatIntent = route.params.intent;
      if (chatIntent.service_type) {
        setFilter(chatIntent.service_type);
      }
    }
  }, [route.params]);

  const handleMarkerPress = (karigar) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedKarigarId(karigar.id);
    
    // Animate map camera to focus on Marker
    mapRef.current?.animateCamera({
      center: {
        latitude: karigar.lat,
        longitude: karigar.lng,
      },
      zoom: 14,
    }, { duration: 1000 });

    // Scroll flatlist to this karigar
    const index = filteredKarigars.findIndex(k => k.id === karigar.id);
    if (index !== -1) {
      listRef.current?.scrollTo({
        y: index * 120, // Approx height of list card
        animated: true,
      });
    }
  };

  const filteredKarigars = KARIGARS.map(karigar => {
    let dist = karigar.distance || 0;
    if (userCoords) {
      dist = calculateDistance(userCoords.latitude, userCoords.longitude, karigar.lat, karigar.lng);
    }
    return { ...karigar, distance: dist };
  }).filter(karigar => {
    const matchesFilter = filter === 'All' || karigar.service.toLowerCase() === filter.toLowerCase();
    const matchesQuery = searchQuery === '' || 
      karigar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      karigar.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      karigar.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  }).sort((a, b) => a.distance - b.distance);

  const filterChips = ['All', 'AC Repair', 'Electrician', 'Plumber', 'Carpenter'];

  return (
    <View style={styles.root}>
      {/* HEADER Floating glass search bar */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 12 }]}>
        <BlurView intensity={65} tint="dark" style={styles.searchBar}>
          <Ionicons name="search" size={20} color={C.textSecond} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Area ya service likho..."
            placeholderTextColor={C.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={20} color={C.textPrimary} />
          </TouchableOpacity>
        </BlurView>

        {/* Filter Chips row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContent}
        >
          {filterChips.map(chip => {
            const isSelected = filter.toLowerCase() === chip.toLowerCase();
            return (
              <TouchableOpacity
                key={chip}
                onPress={() => {
                  Haptics.selectionAsync();
                  setFilter(chip);
                }}
                activeOpacity={0.8}
              >
                {isSelected ? (
                  <View style={styles.selectedChip}>
                    <Text style={styles.selectedChipText}>{chip}</Text>
                  </View>
                ) : (
                  <BlurView intensity={35} tint="dark" style={styles.unselectedChip}>
                    <Text style={styles.unselectedChipText}>{chip}</Text>
                  </BlurView>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* MAP VIEW */}
      <View style={styles.mapContainer}>
        <View style={styles.liveLocationBadge}>
          <BlurView intensity={70} tint="dark" style={styles.liveLocationBlur}>
            <Ionicons name="location" size={14} color={C.primary} style={{ marginRight: 4 }} />
            <Text style={styles.liveLocationText}>{locationLabel}</Text>
          </BlurView>
        </View>

        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          initialRegion={ISLAMABAD}
          customMapStyle={DARK_MAP_STYLE}
          style={StyleSheet.absoluteFillObject}
        >
          {/* MOCK/LIVE USER LOCATION DOT */}
          <Marker coordinate={userCoords || ISLAMABAD}>
            <View style={styles.userDotOutline}>
              <Animated.View style={[styles.userDotPulse, { transform: [{ scale: pulseAnim }] }]} />
              <View style={styles.userDotInner} />
            </View>
          </Marker>

          {/* KARIGAR MARKERS */}
          {filteredKarigars.map(karigar => {
            const isSelected = selectedKarigarId === karigar.id;
            return (
              <Marker
                key={karigar.id}
                coordinate={{ latitude: karigar.lat, longitude: karigar.lng }}
                onPress={() => handleMarkerPress(karigar)}
              >
                <BlurView 
                  intensity={isSelected ? 65 : 45} 
                  tint="dark" 
                  style={[
                    styles.markerPill, 
                    isSelected && styles.markerPillSelected
                  ]}
                >
                  <Text style={styles.markerEmoji}>
                    {karigar.service === 'AC Repair' ? '❄️' : 
                     karigar.service === 'Electrician' ? '⚡' : 
                     karigar.service === 'Plumber' ? '🔧' : '🪚'}
                  </Text>
                  <Text style={[styles.markerPrice, isSelected && styles.markerPriceSelected]}>
                    PKR {karigar.price}
                  </Text>
                </BlurView>
              </Marker>
            );
          })}

          {/* DYNAMIC DASHED ROUTE POLYLINE */}
          {selectedKarigarId && (
            <Polyline
              coordinates={getRouteCoordinates(
                KARIGARS.find(k => k.id === selectedKarigarId)
              )}
              strokeColor={C.primary}
              strokeWidth={4}
              lineDashPattern={[6, 6]}
            />
          )}
        </MapView>
      </View>

      {/* FLOATING LIVE TRACKING OVERLAY */}
      {selectedKarigarId && (
        <View style={styles.etaOverlay}>
          <BlurView intensity={70} tint="dark" style={styles.etaBlur}>
            <View style={styles.etaLeft}>
              <Text style={styles.etaEmoji}>🚗</Text>
              <View>
                <Text style={styles.etaTitle}>Live Route Tracking Active</Text>
                <Text style={styles.etaSubtitle}>
                  {KARIGARS.find(k => k.id === selectedKarigarId)?.name} rawana ho chuka hai
                </Text>
              </View>
            </View>
            <View style={styles.etaRight}>
              <Text style={styles.etaTime}>~12 min</Text>
              <Text style={styles.etaDist}>
                {KARIGARS.find(k => k.id === selectedKarigarId)?.distance.toFixed(1)}km door
              </Text>
            </View>
          </BlurView>
        </View>
      )}

      {/* KARIGAR LIST CARD CONTAINER */}
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={T.h3}>{filteredKarigars.length} Karigar Mile</Text>
          <BlurView intensity={35} tint="dark" style={styles.sortBtn}>
            <Text style={styles.sortText}>Best Match ↓</Text>
          </BlurView>
        </View>

        <ScrollView
          ref={listRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listScrollContent}
        >
          {filteredKarigars.length > 0 ? (
            filteredKarigars.map((karigar, index) => (
              <KarigarCard
                key={karigar.id}
                karigar={karigar}
                rank={index === 0 ? 1 : undefined}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  navigation.navigate('Booking', { karigar });
                }}
              />
            ))
          ) : (
            <View style={styles.emptyView}>
              <Text style={styles.emptyIcon}>😔</Text>
              <Text style={styles.emptyText}>
                Is ilaqe mein nahi mila. Doosra area try karo.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bgDeep,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    zIndex: 10,
    width: '100%',
    paddingHorizontal: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11,22,34,0.7)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.glassBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    overflow: 'hidden',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: C.textPrimary,
  },
  filterBtn: {
    padding: 4,
  },
  chipsScroll: {
    marginTop: 10,
  },
  chipsContent: {
    paddingRight: 16,
    gap: 8,
  },
  selectedChip: {
    backgroundColor: C.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 50,
  },
  selectedChipText: {
    color: C.bgDeep,
    fontWeight: '700',
    fontSize: 13,
  },
  unselectedChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: C.glassBorder,
    backgroundColor: C.glass,
    overflow: 'hidden',
  },
  unselectedChipText: {
    color: C.textSecond,
    fontWeight: '600',
    fontSize: 13,
  },
  mapContainer: {
    height: '55%',
    width: '100%',
  },
  liveLocationBadge: {
    position: 'absolute',
    top: 90,
    left: 16,
    zIndex: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.glassBorder,
  },
  liveLocationBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(11,22,34,0.7)',
  },
  liveLocationText: {
    color: C.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  userDotOutline: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDotPulse: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(74, 144, 226, 0.4)',
  },
  userDotInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4A90E2',
    borderWidth: 2,
    borderColor: C.white,
  },
  markerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.glassBorder,
    backgroundColor: C.glass,
    overflow: 'hidden',
  },
  markerPillSelected: {
    borderColor: C.primary,
    backgroundColor: C.primaryDim,
    transform: [{ scale: 1.15 }],
  },
  markerEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  markerPrice: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textPrimary,
  },
  markerPriceSelected: {
    color: C.primary,
  },
  listContainer: {
    flex: 1,
    backgroundColor: C.bgDeep,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sortBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.glassBorder,
    backgroundColor: C.glass,
    overflow: 'hidden',
  },
  sortText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.textPrimary,
  },
  listScrollContent: {
    paddingBottom: 32,
  },
  emptyView: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: C.textMuted,
    textAlign: 'center',
  },
  etaOverlay: {
    position: 'absolute',
    top: 155,
    left: 16,
    right: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.glassBorder,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 100,
  },
  etaBlur: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(11,22,34,0.85)',
  },
  etaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  etaEmoji: {
    fontSize: 24,
  },
  etaTitle: {
    color: C.primary,
    fontWeight: '800',
    fontSize: 13,
  },
  etaSubtitle: {
    color: C.textSecond,
    fontSize: 11,
    marginTop: 2,
  },
  etaRight: {
    alignItems: 'flex-end',
  },
  etaTime: {
    color: C.warning,
    fontWeight: '900',
    fontSize: 14,
  },
  etaDist: {
    color: C.textMuted,
    fontSize: 10,
    marginTop: 2,
    fontWeight: '700',
  },
});
