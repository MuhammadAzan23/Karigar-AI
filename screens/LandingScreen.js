import React, {
  useRef, useEffect, useState, useCallback
} from 'react';

import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Easing, Dimensions, StatusBar, Platform,
  SafeAreaView, TextInput, FlatList, ImageBackground,
  useWindowDimensions, Image
} from 'react-native';

// ── DESIGN SYSTEM TOKENS ──
const C = {
  bg:      '#0D1B2A',
  card:    '#1A2F45',
  primary: '#02C39A',
  teal:    '#028090',
  warning: '#F9C74F',
  danger:  '#E63946',
  white:   '#FFFFFF',
  body:    '#8FB3C5',
  border:  '#1E3A5F',
  dark:    '#0A1520',
  overlay: 'rgba(13,27,42,0.85)',
};

// ── ANIMATION ENGINE HOOK ──
function useStaggeredEntrance(count, delay = 80, startDelay = 0) {
  const anims = useRef(
    Array.from({ length: count }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(40),
    }))
  ).current;

  const run = useCallback(() => {
    const sequence = anims.map((a, i) =>
      Animated.parallel([
        Animated.timing(a.opacity, {
          toValue: 1,
          duration: 700,
          delay: startDelay + i * delay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(a.translateY, {
          toValue: 0,
          duration: 700,
          delay: startDelay + i * delay,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ])
    );
    Animated.parallel(sequence).start();
  }, [anims, delay, startDelay]);

  useEffect(() => { run(); }, []);

  return anims.map(a => ({
    opacity: a.opacity,
    transform: [{ translateY: a.translateY }],
  }));
}

// ── GALLERY PROFILE DATA ──
const KARIGARS = [
  { id:1, initials:'AH', name:'Ali Hassan', service:'AC Repair', rating:4.9, jobs:312, years:5, price:900, dist:0.8, ontime:94, avatarBg: C.teal },
  { id:2, initials:'KB', name:'Kamran Baig', service:'Electrician', rating:4.7, jobs:247, years:3, price:800, dist:1.2, ontime:92, avatarBg: C.primary },
  { id:3, initials:'TM', name:'Tariq Mehmood', service:'Plumber', rating:4.8, jobs:189, years:4, price:750, dist:1.6, ontime:91, avatarBg: '#1E3A5F' },
  { id:4, initials:'SR', name:'Sohail Raza', service:'Carpenter', rating:4.6, jobs:156, years:6, price:1100, dist:2.1, ontime:89, avatarBg: C.teal },
  { id:5, initials:'UF', name:'Usman Farooq', service:'Painter', rating:4.7, jobs:203, years:2, price:700, dist:2.4, ontime:87, avatarBg: '#028090' },
  { id:6, initials:'BA', name:'Bilal Ahmed', service:'Welder', rating:4.5, jobs:134, years:7, price:950, dist:3.0, ontime:85, avatarBg: C.card },
];

// ── JOURNEY STEPS DATA ──
const STEPS = [
  { id: 0, icon: '💬', title: 'Zaroorat Batao', sub: 'Likho ya bolo — any language' },
  { id: 1, icon: '⚡', title: 'AI Samjha', sub: 'Instant intent extraction' },
  { id: 2, icon: '👤', title: 'Best Karigar Mila', sub: 'Matched by score & proximity' },
  { id: 3, icon: '✅', title: 'Booking Confirm', sub: 'One tap, instantly notified' },
  { id: 4, icon: '🏆', title: 'Kaam Mukammal', sub: 'Rate karigar, earn rewards' },
];

// ── MAIN LANDING SCREEN ──
export default function LandingScreen({ navigation }) {
  const { width: W, height: H } = useWindowDimensions();
  const scrollRef = useRef(null);
  
  // Section Layout offsets
  const statsSectionY = useRef(0);
  const aiDemoSectionY = useRef(0);
  const journeySectionY = useRef(0);

  // Staggered Entrance Hero
  const heroAnims = useStaggeredEntrance(6, 120, 300);
  const heroLabelStyle = heroAnims[0];
  const word1Style = heroAnims[1];
  const word2Style = heroAnims[2];
  const word3Style = heroAnims[3];
  const heroBodyStyle = heroAnims[4];
  const heroCTAStyle = heroAnims[5];

  // CTA spring animations
  const primaryScale = useRef(new Animated.Value(1)).current;
  const secondaryScale = useRef(new Animated.Value(1)).current;
  const footerScale = useRef(new Animated.Value(1)).current;

  // Bouncing Scroll Indicator Y
  const bounceAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const indicatorBounceY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-6, 6],
  });

  // Tickers content width and translation animation
  const [ticker1Width, setTicker1Width] = useState(W * 2);
  const [ticker2Width, setTicker2Width] = useState(W * 2);
  const ticker1Anim = useRef(new Animated.Value(0)).current;
  const ticker2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (ticker1Width > 0) {
      ticker1Anim.setValue(0);
      Animated.loop(
        Animated.timing(ticker1Anim, {
          toValue: -ticker1Width / 2,
          duration: 18000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [ticker1Width]);

  useEffect(() => {
    if (ticker2Width > 0) {
      ticker2Anim.setValue(-ticker2Width / 2);
      Animated.loop(
        Animated.timing(ticker2Anim, {
          toValue: 0,
          duration: 14000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [ticker2Width]);

  // Counts animations (Stats Section)
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const statsTriggered = useRef(false);
  const statCardAnims = useRef(Array.from({ length: 4 }, () => ({
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(40),
  }))).current;

  const triggerStatsCountUp = () => {
    if (statsTriggered.current) return;
    statsTriggered.current = true;

    // Trigger stat cards slide up
    const cardsSequence = statCardAnims.map((a, i) =>
      Animated.parallel([
        Animated.timing(a.opacity, { toValue: 1, duration: 600, delay: i * 120, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(a.translateY, { toValue: 0, duration: 600, delay: i * 120, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ])
    );
    Animated.parallel(cardsSequence).start();

    // Stats counting values timing
    const targets = [247, 4.8, 98, 60];
    const decimals = [0, 1, 0, 0];

    targets.forEach((target, i) => {
      const startTime = Date.now();
      const duration = 2000;
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = target * ease;
        setCounts(prev => {
          const next = [...prev];
          next[i] = decimals[i] > 0
            ? parseFloat(current.toFixed(decimals[i]))
            : Math.round(current);
          return next;
        });
        if (progress >= 1) clearInterval(interval);
      }, 16);
    });
  };

  // AI Demo word staggered reveals and typewriter
  const aiDemoTriggered = useRef(false);
  const aiWord1Fade = useRef(new Animated.Value(0)).current;
  const aiWord1Y = useRef(new Animated.Value(30)).current;
  const aiWord2Fade = useRef(new Animated.Value(0)).current;
  const aiWord2Y = useRef(new Animated.Value(30)).current;
  const aiWord3Fade = useRef(new Animated.Value(0)).current;
  const aiWord3Y = useRef(new Animated.Value(30)).current;

  const aiBulletAnims = useRef(Array.from({ length: 3 }, () => ({
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(20),
  }))).current;

  const triggerAIDemoAnimations = () => {
    if (aiDemoTriggered.current) return;
    aiDemoTriggered.current = true;

    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(aiWord1Fade, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(aiWord1Y, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(aiWord2Fade, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(aiWord2Y, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(aiWord3Fade, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(aiWord3Y, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    ]).start();

    const bulletSequence = aiBulletAnims.map((a, i) =>
      Animated.parallel([
        Animated.timing(a.opacity, { toValue: 1, duration: 500, delay: 450 + i * 150, useNativeDriver: true }),
        Animated.timing(a.translateY, { toValue: 0, duration: 500, delay: 450 + i * 150, useNativeDriver: true }),
      ])
    );
    Animated.parallel(bulletSequence).start();
  };

  // Cursor blink loop
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(cursorOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Typewriter typing loop
  const [typedText, setTypedText] = useState("");
  const [showConfidence, setShowConfidence] = useState(false);
  const confidenceFade = useRef(new Animated.Value(0)).current;
  const confidenceY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    let charIndex = 0;
    let typingInterval;
    const phrase = "AC theek karna hai, kal subah\nG-13 mein, budget kam hai...";

    const startTypingSequence = () => {
      setTypedText("");
      setShowConfidence(false);
      confidenceFade.setValue(0);
      confidenceY.setValue(20);
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
              Animated.timing(confidenceFade, { toValue: 1, duration: 500, useNativeDriver: true }),
              Animated.timing(confidenceY, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]).start();

            setTimeout(() => {
              startTypingSequence();
            }, 3500);

          }, 1200);
        }
      }, 60);
    };

    startTypingSequence();

    return () => {
      clearInterval(typingInterval);
    };
  }, []);

  // Journey active steps progress and node spring animations
  const [activeSteps, setActiveSteps] = useState([]);
  const progressHeightAnim = useRef(new Animated.Value(0)).current;
  const stepAnims = useRef(Array.from({ length: 5 }, () => new Animated.Value(1))).current;

  useEffect(() => {
    let targetHeight = 0;
    if (activeSteps.length > 0) {
      const maxIndex = Math.max(...activeSteps);
      targetHeight = maxIndex * 90; // 90px between step circles
    }
    Animated.timing(progressHeightAnim, {
      toValue: targetHeight,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [activeSteps]);

  // Gallery slider indices and dot widths animation
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const dotWidths = useRef(Array.from({ length: 6 }, () => new Animated.Value(6))).current;

  const handleGalleryScroll = (e) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (W - 64)); // CARD_W + gap
    if (index >= 0 && index < 6) {
      setActiveGalleryIndex(index);
    }
  };

  useEffect(() => {
    dotWidths.forEach((wAnim, i) => {
      Animated.timing(wAnim, {
        toValue: i === activeGalleryIndex ? 18 : 6,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });
  }, [activeGalleryIndex]);

  // Footer gradient shimmer translate animation
  const shineAnim = useRef(new Animated.Value(-W)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(shineAnim, {
        toValue: W,
        duration: 3500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [W]);

  // Scroll handler tracking positions dynamically
  const handleScroll = (e) => {
    const y = e.nativeEvent.contentOffset.y;

    if (statsSectionY.current > 0 && y > statsSectionY.current - H * 0.75) {
      triggerStatsCountUp();
    }

    if (aiDemoSectionY.current > 0 && y > aiDemoSectionY.current - H * 0.75) {
      triggerAIDemoAnimations();
    }

    const stepStartY = journeySectionY.current;
    if (stepStartY > 0) {
      const tempActive = [];
      for (let i = 0; i < 5; i++) {
        const threshold = stepStartY + 40 + i * 90;
        if (y > threshold - H * 0.6) {
          tempActive.push(i);
          Animated.spring(stepAnims[i], {
            toValue: 1.2,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(stepAnims[i], {
            toValue: 1.0,
            useNativeDriver: true,
          }).start();
        }
      }
      setActiveSteps(tempActive);
    }
  };

  // Button interaction springs
  const handlePrimaryIn = () => Animated.spring(primaryScale, { toValue: 0.95, useNativeDriver: true }).start();
  const handlePrimaryOut = () => Animated.spring(primaryScale, { toValue: 1, useNativeDriver: true }).start();
  const handleSecondaryIn = () => Animated.spring(secondaryScale, { toValue: 0.95, useNativeDriver: true }).start();
  const handleSecondaryOut = () => Animated.spring(secondaryScale, { toValue: 1, useNativeDriver: true }).start();
  const handleFooterIn = () => Animated.spring(footerScale, { toValue: 0.95, useNativeDriver: true }).start();
  const handleFooterOut = () => Animated.spring(footerScale, { toValue: 1, useNativeDriver: true }).start();

  const handleBookPress = () => {
    navigation.navigate("HomeScreen");
  };

  const handleSecondaryPress = () => {
    if (scrollRef.current && journeySectionY.current > 0) {
      scrollRef.current.scrollTo({ y: journeySectionY.current, animated: true });
    }
  };

  const CELL = 48;
  const cols = Math.ceil(W / CELL) + 1;
  const rows = 12;
  const CARD_W = W - 80;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* ========================================================
            SECTION 1 — HERO SECTION
            ======================================================== */}
        <View style={[styles.heroSection, { height: H }]}>
          {/* Engineering Grid Overlay */}
          <View style={styles.gridContainer} pointerEvents="none">
            {Array.from({ length: rows }).map((_, rIdx) => (
              <View key={`row-${rIdx}`} style={styles.gridRow}>
                {Array.from({ length: cols }).map((_, cIdx) => (
                  <View key={`cell-${rIdx}-${cIdx}`} style={styles.gridCell} />
                ))}
              </View>
            ))}
          </View>

          {/* Crosshairs Decorators */}
          <View style={[styles.crosshair, { top: 60, right: -20 }]} pointerEvents="none">
            <View style={styles.crosshairV} />
            <View style={styles.crosshairH} />
          </View>
          <View style={[styles.crosshair, { bottom: 120, left: 10 }]} pointerEvents="none">
            <View style={styles.crosshairV} />
            <View style={styles.crosshairH} />
          </View>

          {/* Hero Centered Content */}
          <View style={styles.heroContentContainer}>
            
            {/* [A] Label */}
            <Animated.View style={[heroLabelStyle, { alignItems: 'center' }]}>
              <Image
                source={require('../assets/logo..png')}
                style={styles.heroLogo}
                resizeMode="contain"
              />
              <Text style={styles.sectionLabelPrimary}>
                Pakistan Ka Pehla AI-Powered Service Platform
              </Text>
            </Animated.View>

            {/* [B] Headline Clip Mask */}
            <View style={styles.maskContainer}>
              <View style={styles.clipMask}>
                <Animated.Text style={[styles.heroHeading, word1Style]}>Ghar Ka</Animated.Text>
              </View>
              <View style={styles.clipMask}>
                <Animated.Text style={[styles.heroHeading, styles.heroHeadingAccent, word2Style]}>Karigar,</Animated.Text>
              </View>
              <View style={styles.clipMask}>
                <Animated.Text style={[styles.heroHeading, word3Style]}>Fauran.</Animated.Text>
              </View>
            </View>

            {/* [C] Subtext Body */}
            <Animated.View style={heroBodyStyle}>
              <Text style={styles.bodyTextCentered}>
                Ek message mein apna kaam karwao — AI aapki zaroorat samjhega, best karigar dhundega, aur booking confirm karega.
              </Text>
            </Animated.View>

            {/* [D] CTA Buttons */}
            <Animated.View style={[styles.ctaButtonsContainer, heroCTAStyle]}>
              <Animated.View style={{ transform: [{ scale: primaryScale }], width: '100%' }}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPressIn={handlePrimaryIn}
                  onPressOut={handlePrimaryOut}
                  onPress={handleBookPress}
                  style={styles.btnPrimary}
                >
                  <Text style={styles.btnTextDark}>Karigar Dhundho →</Text>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View style={{ transform: [{ scale: secondaryScale }], width: '100%' }}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPressIn={handleSecondaryIn}
                  onPressOut={handleSecondaryOut}
                  onPress={handleSecondaryPress}
                  style={styles.btnSecondary}
                >
                  <Text style={styles.btnTextLight}>How it Works</Text>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>

          </View>

          {/* [E] Scroll indicator */}
          <View style={styles.scrollIndicatorContainer} pointerEvents="none">
            <Animated.View style={{ transform: [{ translateY: indicatorBounceY }] }}>
              <Text style={styles.bounceArrow}>↓</Text>
            </Animated.View>
            <Text style={styles.scrollTextLabel}>Scroll karein</Text>
          </View>
        </View>

        {/* ========================================================
            SECTION 2 — TICKER TAPE SECTION
            ======================================================== */}
        <View style={styles.tickerSection}>
          {/* Row 1 - Left Direction */}
          <View style={styles.tickerRowContainer}>
            <Animated.View
              onLayout={(e) => setTicker1Width(e.nativeEvent.layout.width)}
              style={[styles.tickerTrack, { transform: [{ translateX: ticker1Anim }] }]}
            >
              <Text numberOfLines={1} style={styles.tickerHeadingText}>
                {"In every booking, discover the "}
                <Text style={styles.tickerHighlightText}>REAL MAGIC</Text>
                {" of connecting trusted "}
                <Text style={styles.tickerHighlightText}>KARIGAR</Text>
                {" with every home — fast, fair, always. • In every booking, discover the "}
                <Text style={styles.tickerHighlightText}>REAL MAGIC</Text>
                {" of connecting trusted "}
                <Text style={styles.tickerHighlightText}>KARIGAR</Text>
                {" with every home — fast, fair, always. • "}
              </Text>
            </Animated.View>
          </View>

          {/* Row 2 - Right Direction */}
          <View style={[styles.tickerRowContainer, { borderBottomWidth: 0, marginTop: 14 }]}>
            <Animated.View
              onLayout={(e) => setTicker2Width(e.nativeEvent.layout.width)}
              style={[styles.tickerTrack, { transform: [{ translateX: ticker2Anim }] }]}
            >
              <Text numberOfLines={1} style={styles.tickerServicesText}>
                {"Electrician "}
                <Text style={styles.decoratorDot}>●</Text>
                {" Plumber "}
                <Text style={styles.decoratorDiamond}>◆</Text>
                {" AC Repair "}
                <Text style={styles.decoratorDot}>●</Text>
                {" Painter "}
                <Text style={styles.decoratorDiamond}>◆</Text>
                {" Carpenter "}
                <Text style={styles.decoratorDot}>●</Text>
                {" Tutor "}
                <Text style={styles.decoratorDiamond}>◆</Text>
                {" Cleaner "}
                <Text style={styles.decoratorDot}>●</Text>
                {" Welder "}
                <Text style={styles.decoratorDiamond}>◆</Text>
                {" Electrician "}
                <Text style={styles.decoratorDot}>●</Text>
                {" Plumber "}
                <Text style={styles.decoratorDiamond}>◆</Text>
                {" AC Repair "}
                <Text style={styles.decoratorDot}>●</Text>
                {" Painter "}
                <Text style={styles.decoratorDiamond}>◆</Text>
                {" Carpenter "}
                <Text style={styles.decoratorDot}>●</Text>
                {" Tutor "}
                <Text style={styles.decoratorDiamond}>◆</Text>
                {" Cleaner "}
                <Text style={styles.decoratorDot}>●</Text>
                {" Welder "}
                <Text style={styles.decoratorDiamond}>◆ </Text>
              </Text>
            </Animated.View>
          </View>
        </View>

        {/* ========================================================
            SECTION 3 — STATS SECTION
            ======================================================== */}
        <View
          onLayout={(e) => { statsSectionY.current = e.nativeEvent.layout.y; }}
          style={styles.statsSection}
        >
          <Text style={styles.statsLabelCenter}>OUR NUMBERS</Text>
          
          <View style={styles.statsGrid}>
            {[
              { value: counts[0], suffix: '+', label: 'Verified Karigar', sub: 'Across 12 cities' },
              { value: counts[1], suffix: '★', label: 'Avg Rating', sub: '12,400+ reviews' },
              { value: counts[2], suffix: '%', label: 'Jobs Completed', sub: 'Satisfaction rate' },
              { value: counts[3], suffix: 's', label: 'Booking Time', sub: 'Request to confirm' }
            ].map((stat, idx) => {
              const cardAnim = statCardAnims[idx];
              return (
                <Animated.View
                  key={idx}
                  style={[
                    styles.statCard,
                    {
                      width: (W - 60) / 2,
                      opacity: cardAnim.opacity,
                      transform: [{ translateY: cardAnim.translateY }]
                    }
                  ]}
                >
                  <Text style={styles.statNumber}>
                    {stat.value}
                    <Text style={styles.statSuffix}>{stat.suffix}</Text>
                  </Text>
                  <Text style={styles.statHeadingLabel}>{stat.label}</Text>
                  <Text style={styles.statSubText}>{stat.sub}</Text>
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* ========================================================
            SECTION 4 — AI DEMO SECTION
            ======================================================== */}
        <View
          onLayout={(e) => { aiDemoSectionY.current = e.nativeEvent.layout.y; }}
          style={styles.aiSection}
        >
          <Text style={styles.sectionLabelStyle}>AI-POWERED UNDERSTANDING</Text>
          
          {/* Staggered Heading */}
          <View style={styles.aiHeadingMasks}>
            <View style={styles.clipMask}>
              <Animated.Text
                style={[
                  styles.subHeading,
                  { opacity: aiWord1Fade, transform: [{ translateY: aiWord1Y }] }
                ]}
              >
                Urdu, Roman Urdu,
              </Animated.Text>
            </View>
            <View style={styles.clipMask}>
              <Animated.Text
                style={[
                  styles.subHeading,
                  { opacity: aiWord2Fade, transform: [{ translateY: aiWord2Y }] }
                ]}
              >
                ya English —
              </Animated.Text>
            </View>
            <View style={styles.clipMask}>
              <Animated.Text
                style={[
                  styles.subHeading,
                  styles.heroHeadingAccent,
                  { opacity: aiWord3Fade, transform: [{ translateY: aiWord3Y }] }
                ]}
              >
                koi bhi.
              </Animated.Text>
            </View>
          </View>

          <Text style={styles.aiBodyText}>
            Karigar AI aapki zaroorat ko samajhta hai chahe aap koi bhi language mein likhein. Bilkul human jaisi understanding.
          </Text>

          {/* Staggered Bullets */}
          <View style={styles.bulletsContainer}>
            {[
              '✓  Detects service type automatically',
              '✓  Understands location context',
              '✓  Estimates budget sensitivity'
            ].map((bulletText, bIdx) => {
              const bAnim = aiBulletAnims[bIdx];
              return (
                <Animated.View
                  key={bIdx}
                  style={[
                    styles.bulletRow,
                    {
                      opacity: bAnim.opacity,
                      transform: [{ translateY: bAnim.translateY }]
                    }
                  ]}
                >
                  <Text style={styles.bulletTextContent}>
                    <Text style={{ color: C.primary, fontWeight: 'bold' }}>✓</Text>
                    {bulletText.substring(1)}
                  </Text>
                </Animated.View>
              );
            })}
          </View>

          {/* Phone Mockup frame */}
          <View style={[styles.phoneOuterShell, { width: W - 48 }]}>
            {/* Notch */}
            <View style={styles.phoneNotch} />
            
            {/* Header */}
            <Text style={styles.phoneHeaderLabel}>⚙️ Karigar AI</Text>

            {/* Simulated Typewriter Bubble */}
            <View style={styles.phoneTypewriterBox}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <Text style={styles.typewriterValueText}>{typedText}</Text>
                <Animated.View style={[styles.typingCursor, { opacity: cursorOpacity }]} />
              </View>
              <Text style={styles.phoneHint}>Roman Urdu Request</Text>
            </View>

            {/* Sliding Confidence Card */}
            {showConfidence && (
              <Animated.View
                style={[
                  styles.confidenceOuterCard,
                  {
                    opacity: confidenceFade,
                    transform: [{ translateY: confidenceY }]
                  }
                ]}
              >
                <View style={styles.confidenceHeaderRow}>
                  <Text style={styles.confidenceLabelActive}>✅ Samajh Gaya</Text>
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceBadgeText}>94%</Text>
                  </View>
                </View>

                {/* 2x2 data grid */}
                <View style={styles.confidenceGrid}>
                  <View style={styles.confidenceGridItem}>
                    <Text style={styles.confidenceGridLabel}>SERVICE</Text>
                    <Text style={styles.confidenceGridValue}>AC Repair</Text>
                  </View>
                  <View style={styles.confidenceGridItem}>
                    <Text style={styles.confidenceGridLabel}>LOCATION</Text>
                    <Text style={styles.confidenceGridValue}>G-13, Islamabad</Text>
                  </View>
                  <View style={styles.confidenceGridItem}>
                    <Text style={styles.confidenceGridLabel}>TIME</Text>
                    <Text style={styles.confidenceGridValue}>Kal Subah</Text>
                  </View>
                  <View style={styles.confidenceGridItem}>
                    <Text style={styles.confidenceGridLabel}>BUDGET</Text>
                    <Text style={styles.confidenceGridValue}>Budget-Friendly</Text>
                  </View>
                </View>
              </Animated.View>
            )}

          </View>
        </View>

        {/* ========================================================
            SECTION 5 — JOURNEY TIMELINE SECTION
            ======================================================== */}
        <View
          onLayout={(e) => { journeySectionY.current = e.nativeEvent.layout.y; }}
          style={styles.journeySection}
        >
          <Text style={styles.sectionLabelStyle}>BOOKING KA SAFAR</Text>
          <Text style={[styles.subHeading, { marginBottom: 28 }]}>5 Steps, Fauran Karigar</Text>

          <View style={styles.timelineContainer}>
            {/* Background Base Line */}
            <View style={styles.timelineVerticalLine} />

            {/* Scroll-mapped progress line */}
            <Animated.View
              style={[
                styles.timelineProgressOverlay,
                { height: progressHeightAnim }
              ]}
            />

            {/* Steps array */}
            {STEPS.map((step, idx) => {
              const isActive = activeSteps.includes(idx);
              const scale = stepAnims[idx];
              return (
                <View key={idx} style={styles.stepRow}>
                  {/* Circle Node */}
                  <Animated.View
                    style={[
                      styles.timelineNode,
                      isActive ? styles.timelineNodeActive : styles.timelineNodeInactive,
                      { transform: [{ scale }] }
                    ]}
                  >
                    <Text style={styles.nodeIconText}>{step.icon}</Text>
                  </Animated.View>

                  {/* Content columns */}
                  <View style={styles.stepTextColumn}>
                    <Text
                      style={[
                        styles.stepTextTitle,
                        { color: isActive ? C.white : C.body, opacity: isActive ? 1 : 0.6 }
                      ]}
                    >
                      {step.title}
                    </Text>
                    <Text
                      style={[
                        styles.stepTextSub,
                        { color: isActive ? C.body : C.border }
                      ]}
                    >
                      {step.sub}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* ========================================================
            SECTION 6 — KARIGAR GALLERY SECTION
            ======================================================== */}
        <View style={styles.gallerySection}>
          <Text style={[styles.sectionLabelStyle, { paddingHorizontal: 24 }]}>BEST KARIGAR</Text>
          <Text style={[styles.subHeading, { paddingHorizontal: 24, marginBottom: 24 }]}>
            {"Aapke Ilaqe Ke\nTop Professionals"}
          </Text>

          {/* Gallery scroll list */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_W + 16}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
            nestedScrollEnabled={true}
            onScroll={handleGalleryScroll}
            scrollEventThrottle={16}
          >
            {KARIGARS.map((karigar) => (
              <KarigarCard
                key={karigar.id}
                karigar={karigar}
                CARD_W={CARD_W}
                handleBook={handleBookPress}
              />
            ))}
          </ScrollView>

          {/* Snap dots tracking */}
          <View style={styles.dotRow}>
            {KARIGARS.map((_, dotIdx) => {
              const dotWidth = dotWidths[dotIdx];
              return (
                <Animated.View
                  key={dotIdx}
                  style={[
                    styles.galleryIndicatorDot,
                    {
                      width: dotWidth,
                      backgroundColor: dotIdx === activeGalleryIndex ? C.primary : C.border,
                      borderRadius: dotIdx === activeGalleryIndex ? 4 : 3,
                    }
                  ]}
                />
              );
            })}
          </View>
        </View>

        {/* ========================================================
            SECTION 7 — FOOTER CTA SECTION
            ======================================================== */}
        <View style={styles.footerCTA}>
          
          {/* Shimmer header text container */}
          <View style={styles.shimmerBox}>
            <Text style={styles.footerHeadingBase}>Karigar AI</Text>
            <Animated.Text
              style={[
                styles.footerHeadingShine,
                { transform: [{ translateX: shineAnim }] }
              ]}
            >
              Karigar AI
            </Animated.Text>
          </View>

          <Text style={styles.footerSubHeadline}>
            Pakistan ka pehla AI karigar marketplace.
          </Text>

          <Animated.View style={[styles.footerCTAButtonWrapper, { transform: [{ scale: footerScale }] }]}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPressIn={handleFooterIn}
              onPressOut={handleFooterOut}
              onPress={handleBookPress}
              style={styles.footerCTAButton}
            >
              <Text style={styles.btnTextDark}>Apna Karigar Dhundho →</Text>
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.footerFinePrint}>
            Free to use  •  No signup  •  24/7 support
          </Text>

          <View style={styles.footerLineSeparator} />

          <View style={styles.footerLinksGrid}>
            {["Privacy", "Terms", "Contact", "Careers"].map((link, idx) => (
              <Text key={idx} style={styles.footerLinkItem}>{link}</Text>
            ))}
          </View>

          <Text style={styles.footerCopyrightText}>
            &copy; {new Date().getFullYear()} Karigar AI. All rights reserved.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── SUB-COMPONENT KARIGAR CARD ──
function KarigarCard({ karigar, CARD_W, handleBook }) {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <View style={[styles.karigarCard, { width: CARD_W }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardAvatar, { backgroundColor: karigar.avatarBg }]}>
          <Text style={styles.cardAvatarText}>{karigar.initials}</Text>
        </View>
        <View>
          <Text style={styles.cardName}>{karigar.name}</Text>
          <Text style={styles.cardService}>{karigar.service}</Text>
        </View>
      </View>

      <Text style={styles.cardRating}>
        ⭐ {karigar.rating}  ·  {karigar.jobs} jobs  ·  {karigar.years} yrs
      </Text>

      <View style={styles.cardDivider} />

      <View style={styles.cardStatsRow}>
        <View style={styles.miniStatItem}>
          <Text style={styles.miniStatVal}>✅ {karigar.ontime}%</Text>
          <Text style={styles.miniStatLabel}>On-Time</Text>
        </View>
        <View style={[styles.miniStatItem, styles.miniStatCenter]}>
          <Text style={[styles.miniStatVal, { color: C.primary }]}>PKR {karigar.price}</Text>
          <Text style={styles.miniStatLabel}>/hr</Text>
        </View>
        <View style={styles.miniStatItem}>
          <Text style={styles.miniStatVal}>📍 {karigar.dist}km</Text>
          <Text style={styles.miniStatLabel}>Away</Text>
        </View>
      </View>

      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handleBook}
          style={styles.cardButton}
        >
          <Text style={styles.cardButtonText}>Book Karo →</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ── STYLE SHEET DEFINITION ──
const styles = StyleSheet.create({
  // ── GLOBAL ──
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 0,
  },
  heroHeading: {
    fontSize: 64,
    fontWeight: '800',
    color: C.white,
    lineHeight: 68,
    letterSpacing: -1.5,
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 28,
    fontWeight: '700',
    color: C.white,
    lineHeight: 34,
  },
  sectionLabelPrimary: {
    fontSize: 11,
    fontWeight: '700',
    color: C.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionLabelStyle: {
    fontSize: 11,
    fontWeight: '700',
    color: C.teal,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  bodyTextCentered: {
    fontSize: 15,
    color: C.body,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 320,
    marginTop: 20,
    marginBottom: 28,
  },
  smallText: {
    fontSize: 12,
    color: C.body,
  },

  // ── HERO ──
  heroLogo: {
    width: 100,
    height: 100,
    marginBottom: 16,
    borderRadius: 50,
  },
  heroSection: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: C.bg,
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.08,
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridCell: {
    width: 48,
    height: 48,
    borderWidth: 0.5,
    borderColor: C.primary,
  },
  crosshair: {
    position: 'absolute',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshairV: {
    width: 1,
    height: 100,
    backgroundColor: C.primary,
    opacity: 0.15,
    position: 'absolute',
  },
  crosshairH: {
    width: 100,
    height: 1,
    backgroundColor: C.primary,
    opacity: 0.15,
    position: 'absolute',
  },
  heroContentContainer: {
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  maskContainer: {
    alignItems: 'center',
  },
  clipMask: {
    overflow: 'hidden',
    marginVertical: 2,
  },
  heroHeadingAccent: {
    color: C.primary,
  },
  ctaButtonsContainer: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 24,
    width: '100%',
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: C.primary,
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondary: {
    borderWidth: 1.5,
    borderColor: C.teal,
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTextDark: {
    color: C.dark,
    fontSize: 16,
    fontWeight: '700',
  },
  btnTextLight: {
    color: C.body,
    fontSize: 16,
    fontWeight: '700',
  },
  scrollIndicatorContainer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  bounceArrow: {
    fontSize: 22,
    color: C.primary,
    fontWeight: '900',
  },
  scrollTextLabel: {
    fontSize: 11,
    color: C.body,
    opacity: 0.5,
    marginTop: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // ── TICKER ──
  tickerSection: {
    backgroundColor: C.dark,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  tickerRowContainer: {
    flexDirection: 'row',
  },
  tickerTrack: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },
  tickerHeadingText: {
    fontSize: 22,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.15)',
  },
  tickerHighlightText: {
    color: C.primary,
    fontWeight: '700',
  },
  tickerServicesText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(2, 195, 154, 0.45)',
  },
  decoratorDot: {
    color: C.primary,
    fontSize: 10,
    opacity: 0.6,
  },
  decoratorDiamond: {
    color: C.teal,
    fontSize: 8,
    opacity: 0.5,
  },

  // ── STATS ──
  statsSection: {
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  statsLabelCenter: {
    fontSize: 11,
    fontWeight: '700',
    color: C.teal,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 20,
    borderTopWidth: 3,
    borderTopColor: C.primary,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  statNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: C.primary,
  },
  statSuffix: {
    fontSize: 28,
    color: C.primary,
  },
  statHeadingLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: C.white,
    marginTop: 6,
  },
  statSubText: {
    fontSize: 11,
    color: C.body,
    marginTop: 2,
  },

  // ── AI DEMO ──
  aiSection: {
    paddingHorizontal: 24,
    paddingVertical: 48,
    backgroundColor: C.dark,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: C.border,
  },
  aiHeadingMasks: {
    marginBottom: 20,
  },
  aiBodyText: {
    fontSize: 15,
    color: C.body,
    lineHeight: 24,
    marginBottom: 28,
  },
  bulletsContainer: {
    gap: 14,
    marginBottom: 36,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletTextContent: {
    fontSize: 15,
    color: C.white,
    fontWeight: '600',
  },
  phoneOuterShell: {
    alignSelf: 'center',
    backgroundColor: C.dark,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 20,
    overflow: 'hidden',
    marginTop: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
  },
  phoneNotch: {
    width: 80,
    height: 18,
    backgroundColor: C.dark,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    alignSelf: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    borderTopWidth: 0,
  },
  phoneHeaderLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: C.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  phoneTypewriterBox: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.teal,
    borderRadius: 12,
    padding: 16,
    minHeight: 90,
    justifyContent: 'space-between',
  },
  typewriterValueText: {
    fontSize: 13,
    lineHeight: 18,
    color: C.white,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  typingCursor: {
    width: 2,
    height: 16,
    backgroundColor: C.primary,
    marginLeft: 2,
    alignSelf: 'center',
  },
  phoneHint: {
    fontSize: 9,
    color: C.body,
    alignSelf: 'flex-end',
    marginTop: 8,
    fontWeight: 'bold',
  },
  confidenceOuterCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.primary,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  confidenceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  confidenceLabelActive: {
    fontSize: 13,
    fontWeight: '700',
    color: C.primary,
  },
  confidenceBadge: {
    backgroundColor: C.primary,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  confidenceBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.dark,
  },
  confidenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
  },
  confidenceGridItem: {
    width: '50%',
  },
  confidenceGridLabel: {
    fontSize: 10,
    color: C.body,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  confidenceGridValue: {
    fontSize: 13,
    fontWeight: '700',
    color: C.white,
    marginTop: 3,
  },

  // ── JOURNEY ──
  journeySection: {
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  timelineContainer: {
    position: 'relative',
    paddingLeft: 24,
    marginTop: 20,
  },
  timelineVerticalLine: {
    position: 'absolute',
    left: 33,
    top: 20,
    width: 2,
    height: 360,
    backgroundColor: C.border,
  },
  timelineProgressOverlay: {
    position: 'absolute',
    left: 33,
    top: 20,
    width: 2,
    backgroundColor: C.primary,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 48,
  },
  timelineNode: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    marginLeft: 8,
  },
  timelineNodeActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  timelineNodeInactive: {
    backgroundColor: C.card,
    borderWidth: 2,
    borderColor: C.border,
  },
  nodeIconText: {
    fontSize: 12,
  },
  stepTextColumn: {
    marginLeft: 20,
    flex: 1,
    justifyContent: 'center',
  },
  stepTextTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  stepTextSub: {
    fontSize: 12,
    lineHeight: 16,
  },

  // ── GALLERY ──
  gallerySection: {
    paddingVertical: 48,
    backgroundColor: C.dark,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: C.border,
  },
  karigarCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 14,
  },
  cardAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardAvatarText: {
    color: C.white,
    fontSize: 20,
    fontWeight: '800',
  },
  cardName: {
    fontSize: 18,
    fontWeight: '700',
    color: C.white,
  },
  cardService: {
    fontSize: 13,
    color: C.primary,
    marginTop: 2,
    fontWeight: '600',
  },
  cardRating: {
    fontSize: 12,
    color: C.body,
    marginTop: 6,
  },
  cardDivider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 14,
  },
  cardStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miniStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  miniStatCenter: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: C.border,
  },
  miniStatVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: C.white,
    marginBottom: 4,
  },
  miniStatLabel: {
    fontSize: 10,
    color: C.body,
  },
  cardButton: {
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  cardButtonText: {
    color: C.dark,
    fontWeight: '700',
    fontSize: 14,
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
  },
  galleryIndicatorDot: {
    height: 6,
  },

  // ── FOOTER ──
  footerCTA: {
    backgroundColor: C.dark,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingVertical: 60,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  shimmerBox: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerHeadingBase: {
    fontSize: 44,
    fontWeight: '800',
    color: C.white,
    textAlign: 'center',
    position: 'absolute',
  },
  footerHeadingShine: {
    fontSize: 44,
    fontWeight: '800',
    color: C.primary,
    opacity: 0.7,
    textAlign: 'center',
    position: 'absolute',
  },
  footerSubHeadline: {
    fontSize: 18,
    color: C.body,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 26,
    maxWidth: 260,
  },
  footerCTAButtonWrapper: {
    width: '100%',
    marginTop: 28,
  },
  footerCTAButton: {
    backgroundColor: C.primary,
    borderRadius: 30,
    paddingVertical: 20,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  footerFinePrint: {
    fontSize: 11,
    color: '#3D6680',
    letterSpacing: 1,
    marginTop: 18,
    textAlign: 'center',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  footerLineSeparator: {
    height: 1,
    backgroundColor: 'rgba(30, 58, 95, 0.3)',
    width: '100%',
    marginVertical: 24,
  },
  footerLinksGrid: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  footerLinkItem: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3D6680',
  },
  footerCopyrightText: {
    fontSize: 11,
    color: 'rgba(61, 102, 128, 0.6)',
  },
});
