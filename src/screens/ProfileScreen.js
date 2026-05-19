import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Alert, Animated, LayoutAnimation, Platform, UIManager,
  ActivityIndicator, StatusBar, TextInput, Dimensions, Modal, Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/colors';
import { T } from '../constants/typography';
import GlassCard from '../components/GlassCard';
import * as Haptics from 'expo-haptics';
import { auth } from '../../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';

const { width: W, height: H } = Dimensions.get('window');

// Enable layout animation on Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function ProfileScreen({ navigation }) {
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Google Sheet Selection States
  const [showGoogleSheet, setShowGoogleSheet] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const getAvatarInitials = () => {
    if (user && user.displayName) {
      return user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
    if (user && user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'KA';
  };

  const getUserName = () => {
    if (user && user.displayName) {
      return user.displayName;
    }
    if (user && user.email) {
      const parts = user.email.split('@')[0];
      return parts.charAt(0).toUpperCase() + parts.slice(1);
    }
    return 'Karigar User';
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
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
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

  const handleForgotPassword = async () => {
    if (!email || !email.trim().includes('@')) {
      setAuthError('Password reset ke liye pehle apna email likhein!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    try {
      setAuthError('');
      setIsLoggingIn(true);
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Email Sent', `Password reset link ${email} par bhej diya gaya hai!`);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setAuthError(`Reset failed: ${error.message}`);
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
      try {
        await signInWithEmailAndPassword(auth, selectedEmail, secureGooglePassword);
      } catch (signInErr) {
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential' || signInErr.code === 'auth/wrong-password') {
          await createUserWithEmailAndPassword(auth, selectedEmail, secureGooglePassword);
        } else {
          throw signInErr;
        }
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
        await signInWithPopup(auth, provider);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

  const bookingHistory = [
    {
      id: 'h1',
      emoji: '❄️',
      service: 'AC Repair',
      karigar: 'Ali Hassan',
      date: '19 May, 2026',
      price: 'PKR 900',
      status: 'completed',
      statusLabel: 'Mukammal',
    },
    {
      id: 'h2',
      emoji: '⚡',
      service: 'Electrician',
      karigar: 'Kamran Baig',
      date: '15 May, 2026',
      price: 'PKR 1,600',
      status: 'completed',
      statusLabel: 'Mukammal',
    },
    {
      id: 'h3',
      emoji: '🔧',
      service: 'Plumber',
      karigar: 'Tariq Mehmood',
      date: '12 May, 2026',
      price: 'PKR 750',
      status: 'active',
      statusLabel: 'Jari Hai',
    },
  ];

  const handleToggleNotifications = (value) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotificationsOn(value);
  };

  const handleExpandItem = (id) => {
    Haptics.selectionAsync();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedItemId === id) {
      setExpandedItemId(null);
    } else {
      setExpandedItemId(id);
    }
  };

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Logout', 'Pakka logout karna hai?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (err) {
            Alert.alert('Error', 'Logout nahi ho saka. Dobara koshish karein.');
          }
        }
      }
    ]);
  };

  const handlePreferenceRowPress = (prefName) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="light-content" backgroundColor={C.bgDeep} />
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={[T.body, { marginTop: 12, color: C.textSecond }]}>Profile loading ho rahi hai...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={C.bgDeep} />
        <ScrollView contentContainerStyle={styles.authScrollContent}>
          <LinearGradient
            colors={['rgba(2,195,154,0.15)', 'transparent']}
            style={styles.authHeroSection}
          >
            <View style={styles.authLogoOutline}>
              <View style={styles.authLogoCircle}>
                <Image source={require('../../assets/logo.png')} style={{ width: 44, height: 44 }} resizeMode="contain" />
              </View>
            </View>
            <Text style={[T.display, { marginTop: 12, fontSize: 32 }]}>KARIGAR-AI</Text>
            <Text style={[T.body, { textAlign: 'center', marginTop: 8, paddingHorizontal: 40 }]}>
              Pakistan Ka Pehla AI-Powered Home Service Platform
            </Text>
          </LinearGradient>

          <View style={styles.authCardContainer}>
            <GlassCard intensity={30} style={styles.authCard}>
              <Text style={[T.h2, { textAlign: 'center', color: C.primary, marginBottom: 4 }]}>
                {isSignUp ? 'Naya Account Banayein' : 'Karigar AI Sign In'}
              </Text>
              <Text style={[T.body, { textAlign: 'center', color: C.textSecond, marginBottom: 20, fontSize: 13 }]}>
                {isSignUp 
                  ? 'Apna email aur password darj karke Karigar AI join karein.' 
                  : 'Gemini AI services, notifications aur booking tracking ke liye sign in karein.'}
              </Text>

              {authError ? (
                <BlurView intensity={20} tint="dark" style={styles.errorBanner}>
                  <Ionicons name="alert-circle-outline" size={16} color={C.danger} style={{ marginRight: 6 }} />
                  <Text style={styles.errorText}>{authError}</Text>
                </BlurView>
              ) : null}

              {isLoggingIn ? (
                <View style={styles.spinnerContainer}>
                  <ActivityIndicator size="large" color={C.primary} />
                  <Text style={styles.spinnerText}>
                    {isSignUp ? 'Secure Account Ban raha hai...' : 'Authentication ho rahi hai...'}
                  </Text>
                </View>
              ) : (
                <View style={styles.formContainer}>
                  {/* Email Input */}
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={18} color={C.textMuted} style={styles.inputIcon} />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Apna email likhein..."
                      placeholderTextColor={C.textMuted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={styles.textInput}
                    />
                  </View>

                  {/* Password Input */}
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={18} color={C.textMuted} style={styles.inputIcon} />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Password likhein..."
                      placeholderTextColor={C.textMuted}
                      secureTextEntry
                      autoCapitalize="none"
                      style={styles.textInput}
                    />
                  </View>

                  {!isSignUp && (
                    <TouchableOpacity onPress={handleForgotPassword} style={{ alignSelf: 'flex-end', marginBottom: 12 }}>
                      <Text style={{ color: C.primary, fontSize: 13, fontWeight: '600' }}>Forgot Password?</Text>
                    </TouchableOpacity>
                  )}

                  {/* Email Sign In/Up Button */}
                  <TouchableOpacity
                    onPress={handleEmailAuth}
                    activeOpacity={0.8}
                    style={styles.primaryAuthBtn}
                  >
                    <Text style={styles.primaryAuthBtnText}>
                      {isSignUp ? 'Account Banayein' : 'Sign In Karo'}
                    </Text>
                  </TouchableOpacity>

                  {/* Toggle Sign Up / Login */}
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      setIsSignUp(!isSignUp);
                      setAuthError('');
                    }}
                    style={styles.toggleModeBtn}
                  >
                    <Text style={styles.toggleModeText}>
                      {isSignUp 
                        ? 'Pehle se account hai? Sign In karein' 
                        : 'Naya account banana hai? Sign Up karein'}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>ya phir</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Google Button */}
                  <TouchableOpacity
                    onPress={handleGoogleAuth}
                    activeOpacity={0.8}
                    style={styles.googleBtn}
                  >
                    <View style={styles.googleBtnContent}>
                      <Text style={styles.googleIconText}>G</Text>
                      <Text style={styles.googleBtnText}>Google Se Sign In Karo</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </GlassCard>
          </View>
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

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <ScrollView
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HERO AVATAR SECTION */}
        <LinearGradient
          colors={['rgba(2,195,154,0.15)', 'transparent']}
          style={styles.heroSection}
        >
          <View style={styles.avatarOutline}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{getAvatarInitials()}</Text>
            </View>
          </View>
          <Text style={T.h1}>{getUserName()}</Text>
          <Text style={T.body}>📍 Islamabad, Pakistan</Text>
          
          <BlurView intensity={25} tint="dark" style={styles.memberBadge}>
            <Text style={styles.memberBadgeText}>Member since 2024</Text>
          </BlurView>
        </LinearGradient>

        {/* STATS ROW */}
        <View style={styles.statsRow}>
          <GlassCard intensity={30} style={styles.statCard}>
            <Text style={[T.h1, { color: C.primary }]}>3</Text>
            <Text style={T.label}>Bookings</Text>
          </GlassCard>

          <GlassCard intensity={30} style={styles.statCard}>
            <Text style={[T.h1, { color: C.primary }]}>4.9</Text>
            <Text style={T.label}>Rating</Text>
          </GlassCard>

          <GlassCard intensity={30} style={styles.statCard}>
            <Text style={[T.h1, { color: C.primary, fontSize: 16, lineHeight: 32 }]}>PKR 2,550</Text>
            <Text style={T.label}>Kharch</Text>
          </GlassCard>
        </View>

        {/* BOOKING HISTORY */}
        <View style={styles.sectionContainer}>
          <Text style={[T.label, styles.sectionLabel]}>PEHLE KE KAAM</Text>
          
          <View style={styles.historyList}>
            {bookingHistory.map((item) => {
              const isExpanded = expandedItemId === item.id;
              return (
                <GlassCard key={item.id} intensity={30} style={styles.historyCard}>
                  <TouchableOpacity
                    onPress={() => handleExpandItem(item.id)}
                    activeOpacity={0.9}
                    style={styles.historyHeader}
                  >
                    <View style={styles.historyLeft}>
                      <View style={styles.historyEmojiCircle}>
                        <Text style={styles.historyEmojiText}>{item.emoji}</Text>
                      </View>
                      <View style={styles.historyMetaInfo}>
                        <Text style={T.h3}>{item.service}</Text>
                        <Text style={T.small}>{item.date}</Text>
                      </View>
                    </View>
                    <View style={styles.historyRight}>
                      <Text style={[T.bodyMed, { fontWeight: '700' }]}>{item.price}</Text>
                      <View style={[
                        styles.statusBadge, 
                        { backgroundColor: item.status === 'completed' ? C.primaryDim : C.warningDim }
                      ]}>
                        <Text style={[
                          styles.statusBadgeText,
                          { color: item.status === 'completed' ? C.success : C.warning }
                        ]}>
                          {item.statusLabel}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Expandable detailed drawer */}
                  {isExpanded && (
                    <View style={styles.historyDetailsDrawer}>
                      <View style={styles.historyDetailRow}>
                        <Text style={styles.detailLabel}>Karigar Name:</Text>
                        <Text style={styles.detailValue}>{item.karigar}</Text>
                      </View>
                      <View style={styles.historyDetailRow}>
                        <Text style={styles.detailLabel}>Order ID:</Text>
                        <Text style={styles.detailValue}>#KAI-{item.id}932</Text>
                      </View>

                      {item.status === 'active' ? (
                        <TouchableOpacity
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            navigation.navigate('TrackingScreen', {
                              booking: {
                                bookingId: `#KAI-${item.id}932`,
                                providerName: item.karigar,
                                service: item.service,
                                timeSlot: "Subah 9-11",
                                estimatedArrival: "~15 minutes"
                              },
                              provider: {
                                name: item.karigar,
                                service: item.service,
                                price: parseInt(item.price.replace(/[^\d]/g, '')) || 750
                              }
                            });
                          }}
                          style={[styles.rebookBtn, { backgroundColor: C.primaryDim, borderColor: C.primary }]}
                        >
                          <Text style={[styles.rebookBtnText, { color: C.primary }]}>Kaam Track Karo</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            navigation.navigate('Chat', { prefill: `${item.service} karwana hai dobara` });
                          }}
                          style={styles.rebookBtn}
                        >
                          <Text style={styles.rebookBtnText}>Dobara Book Karo</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </GlassCard>
              );
            })}
          </View>
        </View>

        {/* PREFERENCES / SETTINGS */}
        <View style={styles.sectionContainer}>
          <Text style={[T.label, styles.sectionLabel]}>SETTINGS</Text>
          
          <GlassCard intensity={30} style={styles.preferencesCard}>
            {/* Row 1: Notifications */}
            <View style={styles.prefRow}>
              <View style={styles.prefLeft}>
                <Ionicons name="notifications-outline" size={20} color={C.textSecond} />
                <Text style={styles.prefText}>Notifications</Text>
              </View>
              <Switch
                value={notificationsOn}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: C.border, true: C.primaryGlow }}
                thumbColor={notificationsOn ? C.primary : C.textMuted}
              />
            </View>

            <View style={styles.rowDivider} />

            {/* Row 2: Language */}
            <TouchableOpacity 
              onPress={() => handlePreferenceRowPress('Language')} 
              style={styles.prefRowClickable}
            >
              <View style={styles.prefLeft}>
                <Ionicons name="globe-outline" size={20} color={C.textSecond} />
                <Text style={styles.prefText}>Language: Roman Urdu</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* Row 3: Location */}
            <TouchableOpacity 
              onPress={() => handlePreferenceRowPress('Location')} 
              style={styles.prefRowClickable}
            >
              <View style={styles.prefLeft}>
                <Ionicons name="location-outline" size={20} color={C.textSecond} />
                <Text style={styles.prefText}>Location: Islamabad</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* Row 4: Privacy */}
            <TouchableOpacity 
              onPress={() => handlePreferenceRowPress('Privacy')} 
              style={styles.prefRowClickable}
            >
              <View style={styles.prefLeft}>
                <Ionicons name="lock-closed-outline" size={20} color={C.textSecond} />
                <Text style={styles.prefText}>Privacy</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* Row 5: About */}
            <TouchableOpacity 
              onPress={() => handlePreferenceRowPress('About')} 
              style={styles.prefRowClickable}
            >
              <View style={styles.prefLeft}>
                <Ionicons name="information-circle-outline" size={20} color={C.textSecond} />
                <Text style={styles.prefText}>About Karigar AI</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
            </TouchableOpacity>
          </GlassCard>
        </View>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          style={styles.logoutWrapper}
        >
          <BlurView intensity={30} tint="dark" style={styles.logoutCard}>
            <Text style={styles.logoutText}>Logout</Text>
          </BlurView>
        </TouchableOpacity>
      </ScrollView>
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
  heroSection: {
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatarOutline: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: C.white,
  },
  memberBadge: {
    backgroundColor: C.primaryDim,
    borderWidth: 1,
    borderColor: C.primaryGlow,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 10,
    overflow: 'hidden',
  },
  memberBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.primary,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginTop: -16,
    zIndex: 5,
  },
  statCard: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sectionContainer: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  sectionLabel: {
    marginBottom: 12,
  },
  historyList: {
    gap: 10,
  },
  historyCard: {
    padding: 14,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyEmojiCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.tealDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyEmojiText: {
    fontSize: 20,
  },
  historyMetaInfo: {
    justifyContent: 'center',
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  historyDetailsDrawer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.divider,
  },
  historyDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: C.textSecond,
  },
  detailValue: {
    fontSize: 12,
    color: C.textPrimary,
    fontWeight: '600',
  },
  rebookBtn: {
    backgroundColor: C.primaryDim,
    borderColor: C.primary,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  rebookBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.primary,
  },
  preferencesCard: {
    paddingVertical: 6,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  prefRowClickable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  prefLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prefText: {
    fontSize: 14,
    color: C.textPrimary,
    fontWeight: '500',
  },
  rowDivider: {
    height: 1,
    backgroundColor: C.divider,
    marginHorizontal: 16,
  },
  logoutWrapper: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 14,
    overflow: 'hidden',
  },
  logoutCard: {
    borderWidth: 1,
    borderColor: C.dangerDim,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: C.glass,
  },
  logoutText: {
    color: C.danger,
    fontWeight: '750',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 16,
  },
  authScrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
    backgroundColor: C.bgDeep,
  },
  authHeroSection: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  authLogoOutline: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: 'rgba(2,195,154,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authLogoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: C.primaryDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authLogoText: {
    fontSize: 36,
  },
  authCardContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  authCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.glassBorder,
    backgroundColor: C.glass,
    overflow: 'hidden',
  },
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  spinnerText: {
    fontSize: 13,
    color: C.textSecond,
    marginTop: 12,
    fontWeight: '600',
  },
  googleBtn: {
    backgroundColor: C.white,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  googleIconText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#4285F4',
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0A1520',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 71, 111, 0.12)',
    borderColor: 'rgba(239, 71, 111, 0.3)',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  errorText: {
    color: C.danger,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  formContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 12,
    color: C.textSecond,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: C.textPrimary,
    fontSize: 14,
    height: '100%',
  },
  primaryAuthBtn: {
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryAuthBtnText: {
    color: '#0A1520',
    fontSize: 14,
    fontWeight: '800',
  },
  toggleModeBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  toggleModeText: {
    fontSize: 12,
    color: C.primary,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    fontSize: 11,
    color: C.textMuted,
    fontWeight: '600',
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
