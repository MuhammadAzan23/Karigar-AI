import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
  Platform,
  FlatList,
  Image,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { C } from "../constants/colors";
import { T } from "../constants/typography";
import { SERVICES, KARIGARS, CHAT_HISTORY } from "../constants/mockData";
import ServiceChip from "../components/ServiceChip";
import GlassCard from "../components/GlassCard";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { calculateDistance } from "../utils/location";
import { auth } from "../../config/firebase";
import { onAuthStateChanged } from "firebase/auth";

const { width: W, height: H } = Dimensions.get("window");

export default function LandingScreen({ navigation }) {
  // Staggered Mount Animations
  const heroAnim = useRef(new Animated.Value(0)).current;
  const chipsAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;

  // Count up stats state
  const [karigarCount, setKarigarCount] = useState(0);
  const [ratingCount, setRatingCount] = useState(0.0);
  const [bookingTime, setBookingTime] = useState(0);

  // Typewriter simulated mockup states
  const [typedText, setTypedText] = useState("");
  const [showConfidence, setShowConfidence] = useState(false);
  const confidenceFade = useRef(new Animated.Value(0)).current;
  const confidenceY = useRef(new Animated.Value(15)).current;

  // Active user journey timeline scrolling tracker
  const [activeStep, setActiveStep] = useState(0);

  // Location States
  const [locationPermission, setLocationPermission] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [locationLabel, setLocationLabel] = useState("Islamabad");
  const [sortedKarigars, setSortedKarigars] = useState(KARIGARS);

  // Auth State & Observer
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);

  const getUserGreetingName = () => {
    if (user) {
      if (user.displayName) return user.displayName;
      if (user.email) {
        const parts = user.email.split("@")[0];
        return parts.charAt(0).toUpperCase() + parts.slice(1);
      }
      return "Karigar User";
    }
    return "Guest";
  };

  // Notifications State
  const [notifications, setNotifications] = useState([
    {
      id: "n1",
      title: "AC Repair Confirmed!",
      desc: "Ali Hassan aapki booking ke liye nikal chuke hain.",
      time: "Abhi",
      unread: true,
      icon: "❄️",
    },
    {
      id: "n2",
      title: "Plumber Dispatched",
      desc: "Tariq Mehmood F-11 bypass cross kar chuke hain.",
      time: "10m pehle",
      unread: true,
      icon: "🔧",
    },
    {
      id: "n3",
      title: "AI Energy Saving Tip 🤖",
      desc: "AC ko 26°C pe chalane se monthly 15% bijli ki bachat ho sakti hai.",
      time: "2h pehle",
      unread: false,
      icon: "💡",
    },
    {
      id: "n4",
      title: "Dispute Resolved Successfully",
      desc: "Booking #4829 ka refundable amount wallet mein transfer ho gaya hai.",
      time: "1 din pehle",
      unread: false,
      icon: "🛡️",
    },
  ]);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  const hasUnread = notifications.some(n => n.unread);

  useEffect(() => {
    // Mount animations
    Animated.stagger(150, [
      Animated.timing(heroAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(chipsAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(statsAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // Trigger Count Up animations
    animateStats();

    // Start simulated typewriter loop
    startTypewriterLoop();

    // Trigger Geolocation Engine on Mount
    requestLocation();
  }, []);

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });
        const coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        };
        setUserCoords(coords);
        
        try {
          const geo = await Location.reverseGeocodeAsync(coords);
          if (geo && geo.length > 0) {
            const place = geo[0];
            const name = place.district || place.subregion || place.city || "Active Loc";
            setLocationLabel(name);
          }
        } catch (e) {
          console.log("Reverse geocode error:", e);
        }
      }
    } catch (e) {
      console.log("Location permission/fetching error:", e);
    }
  };

  useEffect(() => {
    if (userCoords) {
      const updatedList = KARIGARS.map(karigar => {
        const dist = calculateDistance(
          userCoords.latitude,
          userCoords.longitude,
          karigar.lat,
          karigar.lng
        );
        return { ...karigar, distance: dist };
      });
      updatedList.sort((a, b) => a.distance - b.distance);
      setSortedKarigars(updatedList);
    } else {
      const defaultLat = 33.6844;
      const defaultLng = 73.0479;
      const updatedList = KARIGARS.map(karigar => {
        const dist = calculateDistance(
          defaultLat,
          defaultLng,
          karigar.lat,
          karigar.lng
        );
        return { ...karigar, distance: dist };
      });
      updatedList.sort((a, b) => a.distance - b.distance);
      setSortedKarigars(updatedList);
    }
  }, [userCoords]);

  const animateStats = () => {
    // Count up for 247+ Karigars
    let k = 0;
    const kInterval = setInterval(() => {
      k += 13;
      if (k >= 247) {
        setKarigarCount(247);
        clearInterval(kInterval);
      } else {
        setKarigarCount(k);
      }
    }, 45);

    // Count up for 4.8★ Rating
    let r = 0.0;
    const rInterval = setInterval(() => {
      r += 0.3;
      if (r >= 4.8) {
        setRatingCount(4.8);
        clearInterval(rInterval);
      } else {
        setRatingCount(parseFloat(r.toFixed(1)));
      }
    }, 70);

    // Count down to <60s Booking
    let b = 180;
    const bInterval = setInterval(() => {
      b -= 12;
      if (b <= 60) {
        setBookingTime(60);
        clearInterval(bInterval);
      } else {
        setBookingTime(b);
      }
    }, 60);
  };

  const startTypewriterLoop = () => {
    let charIndex = 0;
    let typingInterval;
    const phrase = "AC theek karna hai, kal dopahar F-11 mein, reasonable price ho...";

    const runSequence = () => {
      setTypedText("");
      setShowConfidence(false);
      confidenceFade.setValue(0);
      confidenceY.setValue(15);
      charIndex = 0;

      typingInterval = setInterval(() => {
        if (charIndex < phrase.length) {
          setTypedText(phrase.slice(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typingInterval);
          
          setTimeout(() => {
            setShowConfidence(true);
            Animated.parallel([
              Animated.timing(confidenceFade, { toValue: 1, duration: 400, useNativeDriver: true }),
              Animated.timing(confidenceY, { toValue: 0, duration: 400, useNativeDriver: true }),
            ]).start();

            setTimeout(() => {
              runSequence();
            }, 4000);

          }, 1000);
        }
      }, 50);
    };

    runSequence();

    return () => clearInterval(typingInterval);
  };

  const heroTranslateY = heroAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  const chipsTranslateY = chipsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const statsScale = statsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
  });

  const handleNotificationPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowNotificationsModal(true);
  };

  const journeySteps = [
    { icon: "💬", title: "Masla Likho", sub: "Apni zaroorat chat box mein likhein ya bolain." },
    { icon: "🤖", title: "AI Decision", sub: "Gemini extract karega location, time, aur price sensitivity." },
    { icon: "🏆", title: "Matchmaking Score", sub: "Score aur doori ke hisab se behtareen Karigar chunega." },
    { icon: "✅", title: "Quick Booking", sub: "Direct dynamic quote ke sath 1-tap mein booking confirm." },
    { icon: "🔄", title: "Step Tracking", sub: "Karigar ke aane se kaam khatam hone tak har step track karein." },
  ];

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bgDeep} />
      
      <ScrollView
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          // Dynamically highlight active journey step
          const stepIndex = Math.min(Math.max(Math.floor((y - 300) / 120), 0), 4);
          setActiveStep(stepIndex);
        }}
      >
        {/* A. HEADER ROW */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Image
              source={require("../../assets/logo.png")}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <View style={styles.headerGreeting}>
              <Text style={T.small}>Good morning,</Text>
              <Text style={T.h2}>{getUserGreetingName()} 👋</Text>
              {/* Location Status Glass Badge */}
              <View style={styles.locationBadgeRow}>
                <BlurView intensity={30} tint="dark" style={styles.locationBadge}>
                  <Ionicons name="location-sharp" size={10} color={C.primary} />
                  <Text style={styles.locationBadgeText}>
                    {locationPermission === "granted" ? `Active: ${locationLabel}` : "Default: Islamabad"}
                  </Text>
                </BlurView>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={handleNotificationPress} 
            activeOpacity={0.75}
            style={styles.bellPillWrapper}
          >
            <BlurView intensity={40} tint="dark" style={styles.bellPill}>
              <Ionicons name={hasUnread ? "notifications" : "notifications-outline"} size={22} color={hasUnread ? C.primary : C.textSecond} />
              {hasUnread && <View style={styles.redDot} />}
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* B. HERO SECTION WITH STAGGERED ENTRANCES */}
        <Animated.View 
          style={[
            styles.heroContainer, 
            { transform: [{ translateY: heroTranslateY }], opacity: heroAnim }
          ]}
        >
          <LinearGradient
            colors={["rgba(2,195,154,0.15)", "rgba(2,128,144,0.08)", "rgba(11,22,34,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <BlurView intensity={35} tint="dark" style={styles.heroBlur}>
              <View style={styles.heroLogoRow}>
                <Image
                  source={require("../../assets/logo.png")}
                  style={styles.heroMiniLogo}
                  resizeMode="contain"
                />
                <Text style={T.label}>⚙️ KARIGAR AI AGENT</Text>
              </View>
              <Text style={[T.display, styles.heroTitle]}>
                Ghar Ka Karigar,{"\n"}Chutki Mein.
              </Text>
              <Text style={[T.body, styles.heroSub]}>
                Sirf bataiye kya kaam karwana hai. Baqi sab hamara AI Agent sambhal lega!
              </Text>

              {/* STATS TICKERS */}
              <Animated.View style={[styles.statsRow, { transform: [{ scale: statsScale }], opacity: statsAnim }]}>
                <View style={styles.statItem}>
                  <Text style={[T.h1, { color: C.primary, fontSize: 24 }]}>{karigarCount}+</Text>
                  <Text style={styles.statLabel}>Karigars</Text>
                </View>
                <View style={styles.statDivider} />
                
                <View style={styles.statItem}>
                  <Text style={[T.h1, { color: C.primary, fontSize: 24 }]}>{ratingCount.toFixed(1)}★</Text>
                  <Text style={styles.statLabel}>Avg Rating</Text>
                </View>
                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Text style={[T.h1, { color: C.primary, fontSize: 24 }]}>&lt;{bookingTime}s</Text>
                  <Text style={styles.statLabel}>Bookings</Text>
                </View>
              </Animated.View>

              {/* Call-to-action button */}
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  navigation.navigate("Chat");
                }}
                activeOpacity={0.8}
                style={styles.heroCtaBtn}
              >
                <LinearGradient
                  colors={[C.primary, C.teal]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.heroCtaGradient}
                >
                  <Text style={styles.heroCtaText}>AI Se Karigar Dhundho 🤖</Text>
                </LinearGradient>
              </TouchableOpacity>

            </BlurView>
          </LinearGradient>
        </Animated.View>

        {/* C. INTENT EXTRACTION SIMULATION (TYPEWRITER CARD) */}
        <View style={styles.typewriterSection}>
          <Text style={[T.label, styles.sectionLabel]}>MOCK AI WORKFLOW DEMO</Text>
          <BlurView intensity={25} tint="dark" style={styles.typewriterCard}>
            <View style={styles.mockPhoneHeader}>
              <View style={styles.mockPhoneDot} />
              <View style={styles.mockPhoneSpeaker} />
              <View style={styles.mockPhoneDot} />
            </View>

            <View style={styles.chatSpeechContainer}>
              <View style={styles.userMessageBubble}>
                <Text style={styles.typewriterText}>
                  {typedText}
                  <Text style={styles.cursor}>|</Text>
                </Text>
              </View>

              {showConfidence && (
                <Animated.View 
                  style={[
                    styles.aiConfidenceCard,
                    { opacity: confidenceFade, transform: [{ translateY: confidenceY }] }
                  ]}
                >
                  <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
                  <View style={styles.confidenceHeader}>
                    <Text style={styles.confidenceTitle}>🤖 Intent Extracted</Text>
                    <Text style={styles.confidencePercentage}>98% confidence</Text>
                  </View>
                  <View style={styles.intentDetailsGrid}>
                    <View style={styles.intentDetailCell}>
                      <Text style={styles.intentCellLabel}>SERVICE</Text>
                      <Text style={styles.intentCellValue}>AC Repair</Text>
                    </View>
                    <View style={styles.intentDetailCell}>
                      <Text style={styles.intentCellLabel}>LOCATION</Text>
                      <Text style={styles.intentCellValue}>F-11, Islamabad</Text>
                    </View>
                    <View style={styles.intentDetailCell}>
                      <Text style={styles.intentCellLabel}>TIME</Text>
                      <Text style={styles.intentCellValue}>Tomorrow Afternoon</Text>
                    </View>
                  </View>
                </Animated.View>
              )}
            </View>
          </BlurView>
        </View>

        {/* D. SERVICE CHIPS MARQUEE */}
        <Animated.View 
          style={[
            styles.chipsSection,
            { transform: [{ translateY: chipsTranslateY }], opacity: chipsAnim }
          ]}
        >
          <Text style={[T.label, styles.sectionLabel]}>QUICK CATEGORIES</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={true}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {SERVICES.map((service) => (
              <ServiceChip
                key={service.id}
                emoji={service.emoji}
                label={service.label}
                active={false}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  navigation.navigate("Chat", { prefill: service.query });
                }}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* E. NEARBY VERIFIED KARIGARS SLIDER */}
        <View style={styles.nearbySection}>
          <View style={styles.nearbyHeader}>
            <Text style={[T.h3, { flex: 1 }]}>Aapke Qareeb Verified Karigar</Text>
            <TouchableOpacity 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate("Map");
              }}
            >
              <Text style={styles.viewAllText}>Sab Dekho →</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={true}
            contentContainerStyle={styles.nearbyScrollContent}
          >
            {sortedKarigars.map((karigar) => (
              <TouchableOpacity
                key={karigar.id}
                activeOpacity={0.9}
                onPress={() => navigation.navigate("ProviderScreen", { provider: karigar })}
              >
                <BlurView intensity={35} tint="dark" style={styles.miniCard}>
                  <View style={[styles.avatarCircle, { backgroundColor: karigar.avatarColor || C.teal }]}>
                    <Text style={styles.avatarInitials}>{karigar.initials}</Text>
                    <View style={[styles.statusIndicatorDot, { backgroundColor: karigar.available ? C.primary : C.textMuted }]} />
                  </View>
                  
                  <Text style={styles.miniCardName} numberOfLines={1}>{karigar.name}</Text>
                  <Text style={styles.miniCardService} numberOfLines={1}>{karigar.service}</Text>
                  
                  <Text style={styles.miniCardMeta}>
                    📍 {karigar.distance ? karigar.distance.toFixed(1) : "0.0"}km  ⭐ {karigar.rating}
                  </Text>

                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      navigation.navigate("Booking", { karigar });
                    }}
                    activeOpacity={0.8}
                    style={styles.miniBookButton}
                  >
                    <Text style={styles.miniBookText}>Book Karo →</Text>
                  </TouchableOpacity>
                </BlurView>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* F. ACTIVE USER JOURNEY TIMELINE */}
        <View style={styles.journeySection}>
          <Text style={[T.label, styles.sectionLabel]}>APP KA KAAM KAISE HOTA HAI?</Text>
          <BlurView intensity={25} tint="dark" style={styles.journeyCard}>
            {journeySteps.map((step, index) => {
              const isHighlighted = index === activeStep;
              return (
                <View key={index} style={styles.journeyStepRow}>
                  <View style={styles.stepNumCol}>
                    <View style={[styles.stepNumCircle, isHighlighted && styles.stepNumCircleActive]}>
                      <Text style={[styles.stepNumText, isHighlighted && styles.stepNumTextActive]}>
                        {step.icon}
                      </Text>
                    </View>
                    {index < 4 && <View style={styles.stepVerticalLine} />}
                  </View>
                  <View style={styles.stepContentCol}>
                    <Text style={[styles.stepHeading, isHighlighted && styles.stepHeadingActive]}>
                      {step.title}
                    </Text>
                    <Text style={[styles.stepSubtitle, isHighlighted && styles.stepSubtitleActive]}>
                      {step.sub}
                    </Text>
                  </View>
                </View>
              );
            })}
          </BlurView>
        </View>

        {/* G. RECENT COMPLETED BOOKINGS HISTORY LIST */}
        <View style={styles.recentSection}>
          <Text style={[T.label, styles.sectionLabel]}>PEHLE KI ACTIVITY</Text>
          {CHAT_HISTORY.map((item) => (
            <BlurView key={item.id} intensity={35} tint="dark" style={styles.recentItem}>
              <View style={styles.recentLeft}>
                <View style={styles.recentIconCircle}>
                  <Text style={styles.recentIconText}>
                    {item.service.toLowerCase().includes("ac") ? "❄️" : "⚡"}
                  </Text>
                </View>
                <View style={styles.recentDetails}>
                  <Text style={styles.recentServiceName}>{item.service}</Text>
                  <Text style={styles.recentPreview} numberOfLines={1}>
                    {item.preview}
                  </Text>
                </View>
              </View>
              <View style={styles.recentRight}>
                <Text style={styles.recentDate}>{item.date}</Text>
                <TouchableOpacity
                  style={styles.historyTrackPill}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    navigation.navigate("Booking", {
                      karigar: KARIGARS.find(k => k.service === item.service) || KARIGARS[0]
                    });
                  }}
                >
                  <Text style={styles.historyTrackText}>Dobara</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          ))}
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Premium Notification Center Modal Drawer */}
      <Modal
        visible={showNotificationsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity 
            style={styles.modalDismissArea} 
            activeOpacity={1} 
            onPress={() => setShowNotificationsModal(false)} 
          />
          
          <View style={styles.notificationDrawer}>
            <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
            
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <View style={styles.drawerIndicator} />
              <View style={styles.drawerTitleRow}>
                <Text style={styles.drawerTitle}>Notification Center</Text>
                {hasUnread && (
                  <TouchableOpacity 
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                    }}
                    style={styles.clearAllBtn}
                  >
                    <Text style={styles.clearAllText}>Mark Read</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            {/* Notification List */}
            {notifications.length === 0 ? (
              <View style={styles.emptyNotifications}>
                <Ionicons name="notifications-off-outline" size={48} color={C.textMuted} />
                <Text style={styles.emptyText}>Sare notifications clear hain!</Text>
              </View>
            ) : (
              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.drawerScroll}
              >
                {notifications.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, unread: false } : n));
                    }}
                    style={[
                      styles.notificationCard,
                      item.unread && styles.notificationCardUnread
                    ]}
                  >
                    <View style={styles.notificationIconCol}>
                      <Text style={styles.notificationIconText}>{item.icon}</Text>
                    </View>
                    
                    <View style={styles.notificationContentCol}>
                      <View style={styles.notificationMetaRow}>
                        <Text 
                          style={[styles.notificationCardTitle, item.unread && styles.notificationTitleUnread]}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        <Text style={styles.notificationTime}>{item.time}</Text>
                      </View>
                      <Text style={styles.notificationDesc}>{item.desc}</Text>
                    </View>
                    
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        setNotifications(prev => prev.filter(n => n.id !== item.id));
                      }}
                      style={styles.deleteNotificationBtn}
                    >
                      <Ionicons name="close-circle-outline" size={20} color={C.textMuted} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            
            {/* Close Button */}
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowNotificationsModal(false);
              }}
              style={styles.closeDrawerBtn}
            >
              <Text style={styles.closeDrawerText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bgDeep,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  headerRow: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.glassBorder,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  headerGreeting: {
    justifyContent: "center",
  },
  heroLogoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  heroMiniLogo: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  bellPillWrapper: {
    borderRadius: 50,
    overflow: "hidden",
  },
  bellPill: {
    padding: 10,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: C.glassBorder,
    backgroundColor: C.glass,
    position: "relative",
  },
  redDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.danger,
  },
  heroContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.glassBorder,
  },
  heroGradient: {
    borderRadius: 24,
  },
  heroBlur: {
    padding: 24,
  },
  heroTitle: {
    marginTop: 8,
  },
  heroSub: {
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.glassBorder,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    color: C.textSecond,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: C.glassBorder,
  },
  heroCtaBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 20,
  },
  heroCtaGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCtaText: {
    color: C.bgDeep,
    fontSize: 15,
    fontWeight: "800",
  },
  typewriterSection: {
    paddingHorizontal: 24,
    marginTop: 28,
  },
  sectionLabel: {
    marginBottom: 12,
    letterSpacing: 1.5,
    color: C.teal,
    fontWeight: "700",
  },
  typewriterCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.glassBorder,
    overflow: "hidden",
    backgroundColor: C.glass,
    padding: 16,
    alignItems: "center",
  },
  mockPhoneHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 14,
    gap: 8,
  },
  mockPhoneDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.glassBorder,
  },
  mockPhoneSpeaker: {
    width: 40,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.glassBorder,
  },
  chatSpeechContainer: {
    width: "100%",
    minHeight: 150,
  },
  userMessageBubble: {
    backgroundColor: "rgba(0,0,0,0.3)",
    borderWidth: 1,
    borderColor: C.glassBorder,
    borderRadius: 14,
    padding: 12,
    alignSelf: "flex-end",
    maxWidth: "85%",
    marginBottom: 12,
  },
  typewriterText: {
    color: C.textPrimary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  cursor: {
    color: C.primary,
    fontWeight: "bold",
  },
  aiConfidenceCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.primaryGlow,
    backgroundColor: C.glass,
    overflow: "hidden",
    padding: 12,
    maxWidth: "90%",
    alignSelf: "flex-start",
  },
  confidenceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
    paddingBottom: 6,
  },
  confidenceTitle: {
    color: C.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  confidencePercentage: {
    color: C.textSecond,
    fontSize: 10,
    fontWeight: "600",
  },
  intentDetailsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  intentDetailCell: {
    flex: 1,
  },
  intentCellLabel: {
    fontSize: 8,
    color: C.textMuted,
    fontWeight: "700",
  },
  intentCellValue: {
    color: C.textPrimary,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  chipsSection: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  horizontalScrollContent: {
    paddingRight: 16,
  },
  nearbySection: {
    marginTop: 28,
  },
  nearbyHeader: {
    flexDirection: "row",
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 13,
    color: C.primary,
    fontWeight: "700",
  },
  nearbyScrollContent: {
    paddingLeft: 24,
    paddingRight: 12,
  },
  miniCard: {
    width: 170,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.glassBorder,
    padding: 14,
    marginRight: 12,
    backgroundColor: C.glass,
    overflow: "hidden",
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: 10,
  },
  avatarInitials: {
    fontSize: 14,
    fontWeight: "800",
    color: C.white,
  },
  statusIndicatorDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: C.bgDeep,
  },
  miniCardName: {
    fontSize: 14,
    fontWeight: "700",
    color: C.textPrimary,
  },
  miniCardService: {
    fontSize: 12,
    color: C.primary,
    marginTop: 2,
    fontWeight: "600",
  },
  miniCardMeta: {
    fontSize: 11,
    color: C.textSecond,
    marginTop: 6,
  },
  miniBookButton: {
    backgroundColor: C.primaryDim,
    borderWidth: 1,
    borderColor: C.primaryGlow,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 12,
    alignItems: "center",
  },
  miniBookText: {
    fontSize: 11,
    fontWeight: "800",
    color: C.primary,
  },
  journeySection: {
    paddingHorizontal: 24,
    marginTop: 28,
  },
  journeyCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.glassBorder,
    padding: 20,
    backgroundColor: C.glass,
    overflow: "hidden",
  },
  journeyStepRow: {
    flexDirection: "row",
  },
  stepNumCol: {
    alignItems: "center",
    marginRight: 16,
    width: 32,
  },
  stepNumCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: C.glassBorder,
  },
  stepNumCircleActive: {
    borderColor: C.primary,
    backgroundColor: C.primaryDim,
  },
  stepNumText: {
    fontSize: 14,
  },
  stepNumTextActive: {
    fontWeight: "bold",
  },
  stepVerticalLine: {
    width: 2,
    height: 48,
    backgroundColor: C.glassBorder,
  },
  stepContentCol: {
    flex: 1,
    paddingTop: 4,
    paddingBottom: 20,
  },
  stepHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: C.textPrimary,
  },
  stepHeadingActive: {
    color: C.primary,
  },
  stepSubtitle: {
    fontSize: 12,
    color: C.textSecond,
    marginTop: 4,
    lineHeight: 18,
  },
  stepSubtitleActive: {
    color: C.textPrimary,
  },
  recentSection: {
    paddingHorizontal: 24,
    marginTop: 28,
  },
  recentItem: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.glassBorder,
    overflow: "hidden",
    alignItems: "center",
  },
  recentLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  recentIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.tealDim,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recentIconText: {
    fontSize: 18,
  },
  recentDetails: {
    flex: 1,
  },
  recentServiceName: {
    fontSize: 14,
    fontWeight: "600",
    color: C.textPrimary,
  },
  recentPreview: {
    fontSize: 12,
    color: C.textSecond,
    marginTop: 2,
  },
  recentRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  recentDate: {
    fontSize: 11,
    color: C.textMuted,
  },
  historyTrackPill: {
    backgroundColor: C.primaryDim,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: C.primaryGlow,
  },
  historyTrackText: {
    fontSize: 10,
    color: C.primary,
    fontWeight: "800",
  },
  spacer: {
    height: 30,
  },
  locationBadgeRow: {
    marginTop: 6,
    flexDirection: "row",
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.glassBorder,
    backgroundColor: "rgba(2, 195, 154, 0.08)",
  },
  locationBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: C.primary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalDismissArea: {
    flex: 1,
  },
  notificationDrawer: {
    height: H * 0.7,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.glassBorder,
    backgroundColor: "rgba(11, 22, 34, 0.95)",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  drawerHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  drawerIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.glassBorder,
    marginBottom: 16,
  },
  drawerTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: C.white,
  },
  clearAllBtn: {
    backgroundColor: "rgba(2, 195, 154, 0.15)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.primaryGlow,
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: "800",
    color: C.primary,
  },
  emptyNotifications: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: C.textSecond,
    fontWeight: "600",
  },
  drawerScroll: {
    paddingBottom: 24,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.glassBorder,
    alignItems: "center",
  },
  notificationCardUnread: {
    backgroundColor: "rgba(2, 195, 154, 0.05)",
    borderColor: "rgba(2, 195, 154, 0.2)",
  },
  notificationIconCol: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationIconText: {
    fontSize: 18,
  },
  notificationContentCol: {
    flex: 1,
    marginRight: 8,
  },
  notificationMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notificationCardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: C.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  notificationTitleUnread: {
    color: C.primary,
    fontWeight: "700",
  },
  notificationTime: {
    fontSize: 10,
    color: C.textMuted,
  },
  notificationDesc: {
    fontSize: 12,
    color: C.textSecond,
    lineHeight: 16,
  },
  deleteNotificationBtn: {
    padding: 4,
  },
  closeDrawerBtn: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: C.glassBorder,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginVertical: 20,
  },
  closeDrawerText: {
    fontSize: 15,
    fontWeight: "700",
    color: C.textPrimary,
  },
});
