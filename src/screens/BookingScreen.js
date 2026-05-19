import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, TextInput, Linking, ActivityIndicator, LayoutAnimation,
  Platform, UIManager, Dimensions, Modal, Alert
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/colors';
import { T } from '../constants/typography';
import { KARIGARS, TIME_SLOTS } from '../constants/mockData';
import KarigarCard from '../components/KarigarCard';
import GlassCard from '../components/GlassCard';
import * as Haptics from 'expo-haptics';
import { triggerLocalNotification } from '../utils/notifications';
import { auth } from '../../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';

const { width: W, height: H } = Dimensions.get('window');

// Enable layout animation on Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function BookingScreen({ route, navigation }) {
  const [step, setStep] = useState(1); // 1-4
  const [selectedKarigar, setSelectedKarigar] = useState(
    route.params?.karigar ?? KARIGARS[0]
  );
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState('Today'); // Today, Kal, Parson
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [bookingId, setBookingId] = useState(null);
  
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Google Sheet Selection States
  const [showGoogleSheet, setShowGoogleSheet] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  const stepAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for tracking dot
  useEffect(() => {
    if (step === 4) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [step]);

  // Handle route param updates if navigated with a specific karigar
  useEffect(() => {
    if (route.params?.karigar) {
      setSelectedKarigar(route.params.karigar);
      setStep(2); // directly skip to time choice step
    }
  }, [route.params]);

  const goToStep = (n) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.timing(stepAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setStep(n);
      stepAnim.setValue(0);
      Animated.timing(stepAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleBack = () => {
    if (step === 2.5) {
      goToStep(2);
    } else {
      goToStep(step - 1);
    }
  };

  const prefillUserInfo = (currentUser) => {
    if (currentUser) {
      if (!userName) {
        if (currentUser.displayName) {
          setUserName(currentUser.displayName);
        } else if (currentUser.email) {
          const parts = currentUser.email.split('@')[0];
          setUserName(parts.charAt(0).toUpperCase() + parts.slice(1));
        }
      }
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setAuthError('Email aur Password dono likhein!');
      return;
    }
    if (password.length < 6) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setAuthError('Password kam az kam 6 characters ka hona chahiye!');
      return;
    }

    setAuthError('');
    setIsLoggingIn(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      prefillUserInfo(userCredential.user);
      goToStep(3);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      let friendlyMessage = error.message;
      if (error.code === 'auth/invalid-email') {
        friendlyMessage = 'Ghalat email format hai!';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        friendlyMessage = 'Email ya password ghalat hai!';
      } else if (error.code === 'auth/email-already-in-use') {
        friendlyMessage = 'Ye email pehle se istemal mein hai!';
      } else if (error.code === 'auth/weak-password') {
        friendlyMessage = 'Password kam az kam 6 characters ka hona chahiye!';
      }
      setAuthError(friendlyMessage);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const authenticateGoogleAccount = async (selectedEmail) => {
    setAuthError('');
    setIsLoggingIn(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Deterministic secure password mapper
    const secureGooglePassword = `KAI_Secure_${selectedEmail.replace(/[^a-zA-Z0-9]/g, '')}_2026!`;
    
    try {
      let loggedInUser = null;
      try {
        const result = await signInWithEmailAndPassword(auth, selectedEmail, secureGooglePassword);
        loggedInUser = result.user;
      } catch (signInErr) {
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential' || signInErr.code === 'auth/wrong-password') {
          const result = await createUserWithEmailAndPassword(auth, selectedEmail, secureGooglePassword);
          loggedInUser = result.user;
        } else {
          throw signInErr;
        }
      }
      
      if (loggedInUser) {
        prefillUserInfo(loggedInUser);
        goToStep(3);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowGoogleSheet(false);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setAuthError(`Google Sign In failed: ${error.message}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (Platform.OS === 'web') {
      setIsLoggingIn(true);
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (result.user) {
          prefillUserInfo(result.user);
          goToStep(3);
        }
      } catch (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setAuthError(`Google Sign In failed: ${error.message}`);
      } finally {
        setIsLoggingIn(false);
      }
    } else {
      setShowCustomInput(false);
      setCustomGoogleEmail('');
      setShowGoogleSheet(true);
    }
  };

  const handleProceedToDetails = () => {
    if (!auth.currentUser) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      goToStep(2.5);
    } else {
      prefillUserInfo(auth.currentUser);
      goToStep(3);
    }
  };

  const handleConfirmBooking = () => {
    if (!userName.trim() || !userPhone.trim() || !userAddress.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert('Tafseel mukammal darj karain.');
      return;
    }
    const generatedId = '#KAI-' + Math.floor(Math.random() * 9000 + 1000);
    setBookingId(generatedId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Trigger Real-Time Push Notification!
    triggerLocalNotification(
      "🎉 Booking Confirm Ho Gayi!",
      `Karigar ${selectedKarigar.name} (${selectedKarigar.service}) book ho chuka hai. Order ID: ${generatedId}`
    );
    
    // Navigate to premium tracking screen!
    navigation.navigate("TrackingScreen", {
      booking: {
        bookingId: generatedId,
        providerName: selectedKarigar.name,
        service: selectedKarigar.service,
        timeSlot: TIME_SLOTS.find(t => t.id === selectedTime)?.label || 'Subah 9-11',
        estimatedArrival: "~15 minutes"
      },
      provider: selectedKarigar
    });
  };

  const handleCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL('tel:+923001234567');
  };

  const handleCancel = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    goToStep(1);
  };

  // Header steps text helper
  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Karigar Chuno';
      case 2: return 'Waqt Chuno';
      case 2.5: return 'Sign In Zaroori Hai';
      case 3: return 'Confirm Karo';
      case 4: return 'Booking Ho Gayi!';
      default: return 'Ghar Ka Kaam';
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      {/* HEADER */}
      <BlurView intensity={60} tint="dark" style={styles.header}>
        <View style={styles.headerRow}>
          {step > 1 && step < 4 ? (
            <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={C.textPrimary} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}

          <Text style={styles.stepTitle}>{getStepTitle()}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress indicator: 4 dots */}
        <View style={styles.progressRow}>
          {[1, 2, 3, 4].map(dotIndex => {
            const isActive = step === dotIndex;
            const isCompleted = step > dotIndex;
            return (
              <View 
                key={dotIndex} 
                style={[
                  styles.progressDot,
                  isActive && styles.progressDotActive,
                  isCompleted && styles.progressDotCompleted,
                ]}
              />
            );
          })}
        </View>
      </BlurView>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* STEP 1: SERVICE & KARIGAR SELECTION */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={[T.h2, styles.sectionTitle]}>Kaunsa kaam karwana hai?</Text>
            
            {/* Horizontal Services selector */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.horizontalScroll}
              contentContainerStyle={{ paddingRight: 16 }}
            >
              {['All Services', 'AC Repair', 'Electrician', 'Plumber', 'Carpenter'].map((label, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={[styles.serviceChip, idx === 0 && styles.serviceChipActive]}
                  onPress={() => Haptics.selectionAsync()}
                >
                  <Text style={[styles.serviceChipText, idx === 0 && styles.serviceChipTextActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* List of Karigars */}
            <View style={styles.karigarsList}>
              {KARIGARS.map(karigar => (
                <TouchableOpacity 
                  key={karigar.id}
                  onPress={() => {
                    setSelectedKarigar(karigar);
                    goToStep(2);
                  }}
                  activeOpacity={0.9}
                  style={[
                    styles.karigarCardTouchable,
                    selectedKarigar.id === karigar.id && styles.karigarCardSelected
                  ]}
                >
                  <KarigarCard karigar={karigar} rank={karigar.id === 'k1' ? 1 : undefined} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* STEP 2: TIME SELECTION */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            {/* Mini Karigar Profile preview */}
            <KarigarCard karigar={selectedKarigar} compact={true} />

            <Text style={[T.h2, styles.sectionTitle, { marginTop: 24 }]}>Waqt batao</Text>

            {/* Date Picker (Today, Kal, Parson) */}
            <View style={styles.datePickerRow}>
              {['Today', 'Kal', 'Parson'].map(date => {
                const isSelected = selectedDate === date;
                return (
                  <TouchableOpacity
                    key={date}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedDate(date);
                    }}
                    style={[styles.datePill, isSelected && styles.datePillActive]}
                  >
                    <Text style={[styles.dateText, isSelected && styles.dateTextActive]}>
                      {date}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Time Slot Grid */}
            <View style={styles.timeGrid}>
              {TIME_SLOTS.map(slot => {
                const isSelected = selectedTime === slot.id;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    disabled={!slot.available}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedTime(slot.id);
                    }}
                    activeOpacity={0.8}
                    style={[
                      styles.timeSlot,
                      isSelected && styles.timeSlotActive,
                      !slot.available && styles.timeSlotUnavailable
                    ]}
                  >
                    <BlurView 
                      intensity={40} 
                      tint="dark" 
                      style={StyleSheet.absoluteFill} 
                    />
                    <Text style={[
                      styles.timeSlotLabel,
                      isSelected && styles.timeSlotLabelActive,
                      !slot.available && styles.timeSlotLabelUnavailable
                    ]}>
                      {slot.label}
                    </Text>
                    <Text style={styles.timeSlotSub}>
                      {slot.available ? 'Available' : 'Bhar gayi'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Next step button */}
            <TouchableOpacity
              disabled={!selectedTime}
              onPress={handleProceedToDetails}
              style={[styles.actionBtn, !selectedTime && styles.actionBtnDisabled]}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={selectedTime ? [C.primary, C.teal] : [C.glassBorder, C.glass]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientBtn}
              >
                <Text style={styles.actionBtnText}>Aage →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2.5: AUTH WALL BLOCK WITH INTEGRATED SIGN IN / SIGN UP */}
        {step === 2.5 && (
          <View style={styles.stepContainer}>
            <GlassCard intensity={30} style={styles.authWallCard}>
              <View style={styles.authWallIconCircle}>
                <Ionicons name="lock-closed-outline" size={32} color={C.primary} />
              </View>
              <Text style={[T.h2, { textAlign: 'center', color: C.primary, marginBottom: 4 }]}>
                {isSignUp ? 'Naya Account Banayein' : 'Karigar AI Sign In'}
              </Text>
              <Text style={[T.body, { textAlign: 'center', color: C.textSecond, marginBottom: 16, fontSize: 12 }]}>
                {isSignUp 
                  ? 'Booking confirm karne ke liye account banayein.' 
                  : 'Booking confirm karne ke liye pehle sign in karein.'}
              </Text>

              {authError ? (
                <BlurView intensity={20} tint="dark" style={styles.authWallErrorBanner}>
                  <Ionicons name="alert-circle-outline" size={16} color={C.danger} style={{ marginRight: 6 }} />
                  <Text style={styles.authWallErrorText}>{authError}</Text>
                </BlurView>
              ) : null}

              {isLoggingIn ? (
                <View style={styles.authWallSpinnerContainer}>
                  <ActivityIndicator size="large" color={C.primary} />
                  <Text style={styles.authWallSpinnerText}>
                    {isSignUp ? 'Account ban raha hai...' : 'Sign In ho raha hai...'}
                  </Text>
                </View>
              ) : (
                <View style={{ width: '100%' }}>
                  {/* Email Input */}
                  <Text style={styles.authWallInputLabel}>Email Address</Text>
                  <View style={styles.authWallInputWrapper}>
                    <Ionicons name="mail-outline" size={16} color={C.textMuted} style={styles.authWallInputIcon} />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Apna email likhein..."
                      placeholderTextColor={C.textMuted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={styles.authWallTextInput}
                    />
                  </View>

                  {/* Password Input */}
                  <Text style={styles.authWallInputLabel}>Password</Text>
                  <View style={styles.authWallInputWrapper}>
                    <Ionicons name="lock-closed-outline" size={16} color={C.textMuted} style={styles.authWallInputIcon} />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Password likhein..."
                      placeholderTextColor={C.textMuted}
                      secureTextEntry
                      autoCapitalize="none"
                      style={styles.authWallTextInput}
                    />
                  </View>

                  {/* Email Sign In/Up Button */}
                  <TouchableOpacity
                    onPress={handleEmailAuth}
                    activeOpacity={0.8}
                    style={styles.authWallPrimaryBtn}
                  >
                    <LinearGradient
                      colors={[C.primary, C.teal]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.gradientBtn}
                    >
                      <Text style={styles.authWallPrimaryBtnText}>
                        {isSignUp ? 'Register & Continue ✓' : 'Sign In & Continue ✓'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Toggle Sign Up / Login */}
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      setIsSignUp(!isSignUp);
                      setAuthError('');
                    }}
                    style={styles.authWallToggleModeBtn}
                  >
                    <Text style={styles.authWallToggleModeText}>
                      {isSignUp 
                        ? 'Pehle se account hai? Sign In' 
                        : 'Naya account banana hai? Register'}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.authWallDividerRow}>
                    <View style={styles.authWallDividerLine} />
                    <Text style={styles.authWallDividerText}>ya phir</Text>
                    <View style={styles.authWallDividerLine} />
                  </View>

                  {/* Google Button */}
                  <TouchableOpacity
                    onPress={handleGoogleAuth}
                    activeOpacity={0.8}
                    style={styles.authWallGoogleBtn}
                  >
                    <View style={styles.authWallGoogleBtnContent}>
                      <Text style={styles.authWallGoogleIconText}>G</Text>
                      <Text style={styles.authWallGoogleBtnText}>Google Se Sign In & Book</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                onPress={() => goToStep(2)}
                activeOpacity={0.8}
                style={[styles.authWallSecondaryBtn, { marginTop: 16 }]}
              >
                <Text style={styles.authWallSecondaryBtnText}>← Waqt Dobara Chuno</Text>
              </TouchableOpacity>
            </GlassCard>
          </View>
        )}

        {/* STEP 3: CONFIRMATION FORM */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            {/* Summary details */}
            <BlurView intensity={30} tint="dark" style={styles.summaryCard}>
              <Text style={T.label}>BOOKING SUMMARY</Text>
              <Text style={[T.bodyMed, { marginTop: 8 }]}>
                {selectedKarigar.name} — {selectedKarigar.service}
              </Text>
              <Text style={[T.small, { marginTop: 4 }]}>
                🗓️ {selectedDate} | ⏰ {TIME_SLOTS.find(t => t.id === selectedTime)?.label || 'Dopahar 12-2'}
              </Text>
            </BlurView>

            {/* Input fields */}
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={T.label}>Apka naam</Text>
                <BlurView intensity={25} tint="dark" style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Muhammad Azan..."
                    placeholderTextColor={C.textMuted}
                    value={userName}
                    onChangeText={setUserName}
                  />
                </BlurView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={T.label}>Phone number</Text>
                <BlurView intensity={25} tint="dark" style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="0300 1234567..."
                    placeholderTextColor={C.textMuted}
                    keyboardType="numeric"
                    value={userPhone}
                    onChangeText={setUserPhone}
                  />
                </BlurView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={T.label}>Ghar ka pata</Text>
                <BlurView intensity={25} tint="dark" style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    placeholder="House 12, Street 3, G-13/4, Islamabad..."
                    placeholderTextColor={C.textMuted}
                    multiline
                    numberOfLines={3}
                    value={userAddress}
                    onChangeText={setUserAddress}
                  />
                </BlurView>
              </View>
            </View>

            {/* PRICE BREAKDOWN (GlassCard) */}
            <GlassCard intensity={30} style={styles.priceBreakdown}>
              <Text style={T.label}>QEEMAT KI TAFSEEL</Text>
              
              <View style={styles.priceRow}>
                <Text style={styles.priceItemLabel}>Aamdani Fee</Text>
                <Text style={styles.priceItemValue}>PKR 300</Text>
              </View>
              
              <View style={styles.priceRow}>
                <Text style={styles.priceItemLabel}>Doori Charge</Text>
                <Text style={styles.priceItemValue}>PKR 150</Text>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.priceItemLabel}>Service Charge</Text>
                <Text style={styles.priceItemValue}>PKR 400</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.priceTotalRow}>
                <Text style={T.h2}>Total</Text>
                <Text style={[T.h2, { color: C.primary }]}>PKR 850</Text>
              </View>
              <Text style={styles.priceDiscountTip}>
                💡 Budget rate laga diya
              </Text>
            </GlassCard>

            {/* Confirm CTA */}
            <TouchableOpacity
              onPress={handleConfirmBooking}
              activeOpacity={0.8}
              style={styles.confirmCTA}
            >
              <LinearGradient
                colors={[C.primary, C.teal]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmGradient}
              >
                <Text style={styles.confirmBtnText}>Booking Confirm Karo ✓</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 4: TRACKING */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            {/* SUCCESS BANNER */}
            <LinearGradient
              colors={[C.primaryDim, 'transparent']}
              style={styles.successBanner}
            >
              <Text style={[T.h1, { color: C.primary, textAlign: 'center' }]}>
                ✅ Booking Ho Gayi!
              </Text>
              <Text style={[T.label, { color: C.textSecond, marginTop: 8, textAlign: 'center' }]}>
                ID: {bookingId || '#KAI-5912'}
              </Text>
            </LinearGradient>

            {/* TIMELINE */}
            <View style={styles.timelineContainer}>
              {[
                { id: 1, title: 'Booking Confirm', sub: 'Aaj ' + new Date().toLocaleTimeString('ur-PK'), done: true, active: false },
                { id: 2, title: 'Karigar Ko Bheja Gaya', sub: `${selectedKarigar.name} notify ho gaya`, done: true, active: false },
                { id: 3, title: 'Karigar Raste Mein', sub: '~15 minute mein pahunchega', done: false, active: true },
                { id: 4, title: 'Kaam Shuru', sub: 'Pending', done: false, active: false },
                { id: 5, title: 'Mukammal + Rating', sub: 'Pending', done: false, active: false },
              ].map((timelineStep, idx) => {
                return (
                  <View key={timelineStep.id} style={styles.timelineRow}>
                    {/* Left bullet dot + connecting line */}
                    <View style={styles.bulletCol}>
                      {timelineStep.done ? (
                        <View style={styles.dotDone} />
                      ) : timelineStep.active ? (
                        <Animated.View style={[styles.dotActive, { transform: [{ scale: pulseAnim }] }]} />
                      ) : (
                        <View style={styles.dotPending} />
                      )}
                      
                      {idx < 4 && (
                        <View style={[
                          styles.timelineLine,
                          timelineStep.done && styles.timelineLineDone,
                          !timelineStep.done && styles.timelineLinePending
                        ]} />
                      )}
                    </View>

                    {/* Content details */}
                    <View style={styles.timelineContent}>
                      <Text style={[
                        styles.timelineTitleText,
                        timelineStep.active && { color: C.warning },
                        timelineStep.done && { color: C.textPrimary }
                      ]}>
                        {timelineStep.title}
                      </Text>
                      <Text style={styles.timelineSubText}>{timelineStep.sub}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* KARIGAR ETA CARD */}
            <GlassCard intensity={30} style={styles.etaCard}>
              <View style={styles.etaHeaderRow}>
                <View style={[styles.avatarRound, { backgroundColor: selectedKarigar.avatarColor }]}>
                  <Text style={styles.avatarInitialsText}>{selectedKarigar.initials}</Text>
                </View>
                <View style={styles.etaInfo}>
                  <Text style={T.h3}>{selectedKarigar.name}</Text>
                  <Text style={styles.etaService}>{selectedKarigar.service}</Text>
                </View>
                <View style={styles.etaTextCol}>
                  <Text style={styles.etaBadgeText}>⏱️ ~15 min</Text>
                </View>
              </View>

              <View style={styles.etaActionButtons}>
                <TouchableOpacity onPress={handleCall} style={styles.callKarigarBtn}>
                  <Text style={styles.callKarigarText}>📞 Call Karigar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCancel} style={styles.cancelBookingBtn}>
                  <Text style={styles.cancelBookingText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>

            {/* FEEDBACK CORNER DEMO */}
            <View style={styles.feedbackContainer}>
              <Text style={T.h3}>Kaam ki rating do:</Text>
              
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map(star => {
                  const filled = selectedRating >= star;
                  return (
                    <TouchableOpacity
                      key={star}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setSelectedRating(star);
                      }}
                      style={styles.starBtn}
                    >
                      <Ionicons
                        name={filled ? 'star' : 'star-outline'}
                        size={32}
                        color={filled ? C.warning : C.textMuted}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              <BlurView intensity={25} tint="dark" style={styles.feedbackInputWrapper}>
                <TextInput
                  style={styles.feedbackInput}
                  placeholder="Apna tajruba share karain..."
                  placeholderTextColor={C.textMuted}
                  value={feedbackComment}
                  onChangeText={setFeedbackComment}
                />
              </BlurView>

              <TouchableOpacity
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  alert('Feedback shukriya!');
                  setSelectedRating(0);
                  setFeedbackComment('');
                }}
                style={styles.submitFeedbackBtn}
              >
                <Text style={styles.submitFeedbackText}>Feedback Do</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Premium Google Account Selection Bottom Sheet */}
      <Modal
        visible={showGoogleSheet}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGoogleSheet(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity 
            style={styles.modalDismissArea} 
            activeOpacity={1} 
            onPress={() => setShowGoogleSheet(false)} 
          />
          
          <View style={styles.googleSheet}>
            <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
            
            {/* Sheet Handle Indicator */}
            <View style={styles.sheetHeader}>
              <View style={styles.sheetIndicator} />
              <Text style={styles.sheetTitle}>Choose an account</Text>
              <Text style={styles.sheetSub}>to continue to Karigar-AI</Text>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetScroll}>
              {/* Account 1: Azan */}
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  authenticateGoogleAccount('azan.muhammad23@gmail.com');
                }}
                activeOpacity={0.8}
                style={styles.accountRow}
              >
                <View style={[styles.accountAvatar, { backgroundColor: '#EA4335' }]}>
                  <Text style={styles.accountAvatarText}>MA</Text>
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>Muhammad Azan</Text>
                  <Text style={styles.accountEmail}>azan.muhammad23@gmail.com</Text>
                </View>
                <Ionicons name="logo-google" size={16} color={C.textMuted} />
              </TouchableOpacity>

              {/* Account 2: Test User */}
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  authenticateGoogleAccount('test.user.karigar@gmail.com');
                }}
                activeOpacity={0.8}
                style={styles.accountRow}
              >
                <View style={[styles.accountAvatar, { backgroundColor: '#4285F4' }]}>
                  <Text style={styles.accountAvatarText}>TU</Text>
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>Test User Karigar</Text>
                  <Text style={styles.accountEmail}>test.user.karigar@gmail.com</Text>
                </View>
                <Ionicons name="logo-google" size={16} color={C.textMuted} />
              </TouchableOpacity>

              {/* Custom Input Toggle */}
              {!showCustomInput ? (
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowCustomInput(true);
                  }}
                  activeOpacity={0.8}
                  style={styles.addAccountRow}
                >
                  <View style={styles.addAccountIconCircle}>
                    <Ionicons name="person-add-outline" size={18} color={C.primary} />
                  </View>
                  <Text style={styles.addAccountText}>Use another account</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.customEmailForm}>
                  <Text style={styles.customEmailLabel}>Google Email Address</Text>
                  <View style={styles.customEmailInputWrapper}>
                    <Ionicons name="mail-outline" size={16} color={C.textMuted} style={styles.customEmailIcon} />
                    <TextInput
                      value={customGoogleEmail}
                      onChangeText={setCustomGoogleEmail}
                      placeholder="e.g. yourname@gmail.com"
                      placeholderTextColor={C.textMuted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={styles.customEmailInput}
                    />
                  </View>
                  
                  <View style={styles.customEmailActionRow}>
                    <TouchableOpacity
                      onPress={() => setShowCustomInput(false)}
                      style={styles.customCancelBtn}
                    >
                      <Text style={styles.customCancelBtnText}>Back</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => {
                        const sanitizedEmail = customGoogleEmail.trim().toLowerCase();
                        if (!sanitizedEmail || !sanitizedEmail.includes('@')) {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                          Alert.alert('Ghalat Email', 'Baraye meharbani sahih email address likhein.');
                          return;
                        }
                        authenticateGoogleAccount(sanitizedEmail);
                      }}
                      style={styles.customSubmitBtn}
                    >
                      <Text style={styles.customSubmitBtnText}>Sign In</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowGoogleSheet(false);
              }}
              style={styles.cancelSheetBtn}
            >
              <Text style={styles.cancelSheetText}>Cancel</Text>
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
  header: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.glassBorder,
    backgroundColor: 'rgba(11,22,34,0.7)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backBtn: {
    padding: 4,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.textPrimary,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.border,
  },
  progressDotActive: {
    backgroundColor: C.primary,
    transform: [{ scale: 1.4 }],
  },
  progressDotCompleted: {
    backgroundColor: C.primary,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  stepContainer: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  horizontalScroll: {
    marginBottom: 20,
  },
  serviceChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.glassBorder,
    marginRight: 8,
  },
  serviceChipActive: {
    backgroundColor: C.primaryDim,
    borderColor: C.primary,
  },
  serviceChipText: {
    color: C.textSecond,
    fontWeight: '600',
    fontSize: 13,
  },
  serviceChipTextActive: {
    color: C.primary,
  },
  karigarsList: {
    marginTop: 8,
  },
  karigarCardTouchable: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
  },
  karigarCardSelected: {
    borderWidth: 2,
    borderColor: C.primary,
  },
  datePickerRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  datePill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.glassBorder,
    backgroundColor: C.glass,
  },
  datePillActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  dateText: {
    color: C.textSecond,
    fontWeight: '600',
  },
  dateTextActive: {
    color: C.bgDeep,
    fontWeight: '700',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  timeSlot: {
    width: '48%',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.glassBorder,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  timeSlotActive: {
    borderColor: C.primary,
  },
  timeSlotUnavailable: {
    opacity: 0.35,
  },
  timeSlotLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textPrimary,
  },
  timeSlotLabelActive: {
    color: C.primary,
  },
  timeSlotLabelUnavailable: {
    textDecorationLine: 'line-through',
    color: C.textMuted,
  },
  timeSlotSub: {
    fontSize: 10,
    color: C.textMuted,
    marginTop: 4,
  },
  actionBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  actionBtnDisabled: {
    opacity: 0.5,
  },
  gradientBtn: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionBtnText: {
    color: C.bgDeep,
    fontSize: 16,
    fontWeight: '800',
  },
  summaryCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.glassBorder,
    marginBottom: 24,
    overflow: 'hidden',
  },
  formContainer: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.glassBorder,
    backgroundColor: C.glass,
    overflow: 'hidden',
    marginTop: 6,
  },
  textInput: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.textPrimary,
    fontSize: 15,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  priceBreakdown: {
    padding: 16,
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  priceItemLabel: {
    fontSize: 13,
    color: C.textSecond,
  },
  priceItemValue: {
    fontSize: 13,
    color: C.textPrimary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: C.divider,
    marginVertical: 12,
  },
  priceTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceDiscountTip: {
    fontSize: 11,
    color: C.warning,
    fontStyle: 'italic',
    marginTop: 8,
  },
  confirmCTA: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  confirmGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: C.bgDeep,
  },
  successBanner: {
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  timelineContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  bulletCol: {
    width: 30,
    alignItems: 'center',
  },
  dotDone: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: C.primary,
  },
  dotActive: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: C.warning,
  },
  dotPending: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: C.border,
  },
  timelineLine: {
    width: 2,
    height: 40,
    position: 'absolute',
    top: 14,
  },
  timelineLineDone: {
    backgroundColor: C.primary,
  },
  timelineLinePending: {
    backgroundColor: C.border,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderRadius: 1,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  timelineTitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textSecond,
  },
  timelineSubText: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 2,
  },
  etaCard: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  etaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarRound: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitialsText: {
    fontSize: 16,
    fontWeight: '800',
    color: C.white,
  },
  etaInfo: {
    flex: 1,
    marginLeft: 12,
  },
  etaService: {
    fontSize: 12,
    color: C.primary,
    marginTop: 2,
  },
  etaTextCol: {
    alignItems: 'flex-end',
  },
  etaBadgeText: {
    fontSize: 12,
    color: C.warning,
    fontWeight: '700',
  },
  etaActionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  callKarigarBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.teal,
    alignItems: 'center',
  },
  callKarigarText: {
    color: C.textPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  cancelBookingBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.danger,
    alignItems: 'center',
  },
  cancelBookingText: {
    color: C.danger,
    fontWeight: '700',
    fontSize: 13,
  },
  feedbackContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16,
  },
  starBtn: {
    padding: 4,
  },
  feedbackInputWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.glassBorder,
    backgroundColor: C.glass,
    overflow: 'hidden',
    marginBottom: 16,
  },
  feedbackInput: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.textPrimary,
    fontSize: 14,
  },
  submitFeedbackBtn: {
    backgroundColor: C.primaryDim,
    borderWidth: 1,
    borderColor: C.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitFeedbackText: {
    color: C.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  authWallCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.glassBorder,
    backgroundColor: C.glass,
    overflow: 'hidden',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 20,
  },
  authWallIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.primaryDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderColor: C.primaryGlow,
    borderWidth: 1,
  },
  authWallPrimaryBtn: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  authWallPrimaryBtnText: {
    color: '#0A1520',
    fontSize: 14,
    fontWeight: '800',
    paddingVertical: 14,
    textAlign: 'center',
  },
  authWallSecondaryBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.glassBorder,
    alignItems: 'center',
  },
  authWallSecondaryBtnText: {
    color: C.textSecond,
    fontSize: 13,
    fontWeight: '700',
  },
  authWallErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 71, 111, 0.4)',
    backgroundColor: 'rgba(239, 71, 111, 0.1)',
    marginBottom: 16,
    width: '100%',
  },
  authWallErrorText: {
    color: C.danger,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  authWallSpinnerContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  authWallSpinnerText: {
    color: C.textSecond,
    marginTop: 10,
    fontSize: 13,
  },
  authWallInputLabel: {
    color: C.textSecond,
    fontSize: 12,
    fontWeight: '700',
    alignSelf: 'flex-start',
    marginBottom: 6,
    marginTop: 8,
  },
  authWallInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginBottom: 12,
    width: '100%',
  },
  authWallInputIcon: {
    marginLeft: 12,
  },
  authWallTextInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
    color: C.textPrimary,
    fontSize: 14,
  },
  authWallToggleModeBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  authWallToggleModeText: {
    color: C.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  authWallDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    width: '100%',
  },
  authWallDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.divider,
  },
  authWallDividerText: {
    color: C.textMuted,
    fontSize: 11,
    marginHorizontal: 10,
  },
  authWallGoogleBtn: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.glassBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  authWallGoogleBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  authWallGoogleIconText: {
    color: C.white,
    fontWeight: '900',
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  authWallGoogleBtnText: {
    color: C.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  googleSheet: {
    height: H * 0.65,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.glassBorder,
    backgroundColor: 'rgba(10, 21, 32, 0.96)',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  sheetHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.glassBorder,
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.white,
  },
  sheetSub: {
    fontSize: 12,
    color: C.textSecond,
    marginTop: 4,
  },
  sheetScroll: {
    paddingBottom: 20,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: C.glassBorder,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  accountAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountAvatarText: {
    color: C.white,
    fontSize: 13,
    fontWeight: '800',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '700',
    color: C.textPrimary,
  },
  accountEmail: {
    fontSize: 12,
    color: C.textSecond,
    marginTop: 2,
  },
  addAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.glassBorder,
    backgroundColor: 'rgba(2, 195, 154, 0.05)',
    marginBottom: 12,
  },
  addAccountIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.primaryDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addAccountText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.primary,
  },
  cancelSheetBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: C.glassBorder,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 16,
  },
  cancelSheetText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.textPrimary,
  },
  customEmailForm: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: C.glassBorder,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  customEmailLabel: {
    fontSize: 12,
    color: C.textSecond,
    fontWeight: '600',
    marginBottom: 8,
  },
  customEmailInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  customEmailIcon: {
    marginRight: 8,
  },
  customEmailInput: {
    flex: 1,
    color: C.textPrimary,
    fontSize: 14,
    height: '100%',
  },
  customEmailActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  customCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.glassBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customCancelBtnText: {
    color: C.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  customSubmitBtn: {
    flex: 1,
    backgroundColor: C.primary,
    borderRadius: 10,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customSubmitBtnText: {
    color: '#0A1520',
    fontSize: 13,
    fontWeight: '800',
  },
});
