import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Animated, KeyboardAvoidingView, Platform,
  ActivityIndicator, FlatList
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { C } from '../constants/colors';
import { T } from '../constants/typography';
import { SERVICES, KARIGARS } from '../constants/mockData';
import ServiceChip from '../components/ServiceChip';
import GlassCard from '../components/GlassCard';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { calculateDistance } from '../utils/location';

// Gemini Flash API Configuration
// Replace with actual API key if needed; placeholder string handles empty case gracefully
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `
Tu Karigar AI hai — Pakistan ka pehla AI home service assistant.
Tu bilkul naturally baat karta hai — jaise ek dost jo service
arrange karta ho. Mixed Roman Urdu aur English use kar.

Jab user koi service maange, extract karo:
- service_type: (AC Repair, Electrician, Plumber, etc.)
- location: (user ka area)
- preferred_time: (subah, dopahar, shaam, kal, aaj)
- urgency: (high / medium / low)
- budget_sensitivity: (budget-friendly / normal / premium)

RESPONSE FORMAT — STRICT JSON:
{
  "message": "Conversational reply in Roman Urdu/English mix",
  "intent_extracted": true,
  "service_type": "AC Repair",
  "location": "G-13",
  "preferred_time": "kal",
  "urgency": "medium",
  "budget_sensitivity": "normal",
  "clarification_needed": false,
  "clarification_question": "",
  "show_results": true,
  "thinking_steps": [
    "Dekh raha hoon service type...",
    "Location identify kar raha hoon...",
    "Best karigar match kar raha hoon..."
  ]
}

Agar sab info mil jaye, show_results:true karo.
Agar kuch incomplete ho, clarification_needed:true aur
ek simple question pucho.
Hamesha friendly aur brief raho — max 2 sentences.
`;

async function callGemini(userMessage, history) {
  if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE' || !GEMINI_API_KEY) {
    // Graceful fallback for mock service flow if key is missing
    await new Promise(r => setTimeout(r, 1200));
    const normalized = userMessage.toLowerCase();
    
    let service_type = 'AC Repair';
    let location = 'G-13';
    let urgency = 'medium';
    
    if (normalized.includes('bijli') || normalized.includes('electrician') || normalized.includes('fan')) {
      service_type = 'Electrician';
      location = 'F-11';
    } else if (normalized.includes('pani') || normalized.includes('plumber') || normalized.includes('leak')) {
      service_type = 'Plumber';
      location = 'I-8';
    } else if (normalized.includes('furniture') || normalized.includes('carpenter') || normalized.includes('wood')) {
      service_type = 'Carpenter';
      location = 'E-7';
    }

    return {
      message: `Aap ke liye perfect ${service_type} match kar liya hai jo ${location} ke qareeb available hain. Neeche click kar ke dekhain!`,
      intent_extracted: true,
      service_type,
      location,
      preferred_time: 'aaj',
      urgency,
      budget_sensitivity: 'normal',
      clarification_needed: false,
      clarification_question: '',
      show_results: true,
      thinking_steps: [
        'Request samajh raha hoon...',
        'Service type identify kar raha hoon...',
        'Location check kar raha hoon...',
        'Best karigar dhundh raha hoon...'
      ]
    };
  }

  const contents = [
    ...history.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
          responseMimeType: 'application/json'
        },
      }),
    });

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

export default function ChatScreen({ navigation }) {
  const route = useRoute();
  const flatListRef = useRef(null);
  
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Assalam o Alaikum! 👋 Kya kaam karwana hai aaj? Seedha bolo — AC, bijli, pani, ya kuch bhi.',
      type: 'text',
      time: 'Abhi',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState([]);
  const [showThinking, setShowThinking] = useState(false);
  const [intent, setIntent] = useState(null);
  const [geminiHistory, setGeminiHistory] = useState([]);
  const [userCoords, setUserCoords] = useState(null);
  
  // Animation value for thinking box
  const thinkingOpacity = useRef(new Animated.Value(0)).current;

  // Handle route prefill params & location
  useEffect(() => {
    if (route.params?.prefill) {
      setInput(route.params.prefill);
      // Automatically send the prefill query
      sendMessage(route.params.prefill);
    }

    // Attempt to get live location if permission exists
    (async () => {
      try {
        let { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          const req = await Location.requestForegroundPermissionsAsync();
          if (req.status !== 'granted') return;
        }
        let location = await Location.getCurrentPositionAsync({});
        setUserCoords({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (e) {
        console.log("Could not fetch location in chat:", e);
      }
    })();
  }, [route.params]);

  // Animate thinking box when state changes
  useEffect(() => {
    Animated.timing(thinkingOpacity, {
      toValue: showThinking ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showThinking]);

  const sendMessage = useCallback(async (text) => {
    if (!text || !text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      type: 'text',
      time: 'Abhi',
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setShowThinking(true);
    setThinkingSteps([]);

    // Scroll to bottom immediately
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const fakeSteps = [
        'Request samajh raha hoon...',
        'Service type identify kar raha hoon...',
        'Location check kar raha hoon...',
        'Best karigar dhundh raha hoon...',
      ];
      
      let stepIdx = 0;
      const stepTimer = setInterval(() => {
        if (stepIdx < fakeSteps.length) {
          setThinkingSteps(prev => [...prev, fakeSteps[stepIdx]]);
          stepIdx++;
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
        } else {
          clearInterval(stepTimer);
        }
      }, 250);

      const result = await callGemini(text.trim(), geminiHistory);
      
      clearInterval(stepTimer);
      setThinkingSteps(fakeSteps);

      setGeminiHistory(prev => [
        ...prev,
        { role: 'user', content: text.trim() },
        { role: 'assistant', content: result.message },
      ]);

      await new Promise(r => setTimeout(r, 600));

      setShowThinking(false);
      
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.message,
        type: 'text',
        time: 'Abhi',
        intent: result.intent_extracted ? result : null,
        showResults: result.show_results,
      };

      setMessages(prev => [...prev, aiMsg]);
      
      if (result.intent_extracted) {
        setIntent(result);
      }

      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      setShowThinking(false);
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Network masla ho gaya, dobara try karo.',
        type: 'text',
        time: 'Abhi',
      }]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } finally {
      setLoading(false);
    }
  }, [geminiHistory]);

  const renderMessageItem = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={isUser ? styles.userRow : styles.assistantRow}>
        <BlurView 
          intensity={40} 
          tint={isUser ? "light" : "dark"} 
          style={[
            isUser ? styles.userBubble : styles.assistantBubble,
            isUser && styles.userBubbleBorder
          ]}
        >
          <Text style={styles.bubbleText}>{item.content}</Text>
          
          {/* Action button if showing results */}
          {!isUser && item.showResults && (
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                // Perform Matchmaking ranking using mock Matching Agent rules
                const matchedService = item.intent?.service_type || 'AC Repair';
                const filtered = KARIGARS.map(karigar => {
                  let dist = karigar.distance || 0;
                  if (userCoords) {
                    dist = calculateDistance(userCoords.latitude, userCoords.longitude, karigar.lat, karigar.lng);
                  }
                  return { ...karigar, distance: dist };
                }).filter(
                  (k) => k.service.toLowerCase().includes(matchedService.toLowerCase()) ||
                         matchedService.toLowerCase().includes(k.service.toLowerCase())
                );
                
                const providersToScore = filtered.length > 0 ? filtered : KARIGARS;
                
                const ranked = providersToScore.map(p => {
                  // Calculate weighted score
                  const ratingPart = p.rating * 4; // up to 20
                  const distPart = Math.max(0, (5 - p.distance) * 4); // up to 20
                  const onTimePart = Math.max(0, (p.onTime - 80) * 0.5); // up to 10
                  const finalScore = Math.min(100, Math.round(50 + ratingPart + distPart + onTimePart));
                  
                  // Generate custom reasoning message
                  let reasoning = `${p.name} is selected. He is situated ${p.distance.toFixed(1)}km away with a stellar rating of ${p.rating}★ and an on-time record of ${p.onTime}%.`;
                  if (item.intent?.budget_sensitivity === 'high' || item.intent?.budget_sensitivity?.toLowerCase().includes('budget')) {
                    reasoning += ` Budget sensitivity matches his competitive rate of PKR ${p.price}/hr.`;
                  }
                  
                  return {
                    ...p,
                    score: finalScore,
                    reasoning
                  };
                });
                
                // Sort by matchmaking score descending
                ranked.sort((a, b) => b.score - a.score);
                
                navigation.navigate('ResultScreen', {
                  intent: item.intent || {},
                  rankedProviders: ranked
                });
              }}
              style={styles.resultsButton}
              activeOpacity={0.8}
            >
              <Text style={styles.resultsButtonText}>Karigar Dhundhe →</Text>
            </TouchableOpacity>
          )}

          {/* Extracted Intent Card */}
          {!isUser && item.intent && item.intent.intent_extracted && (
            <BlurView intensity={25} tint="dark" style={styles.intentCard}>
              <View style={styles.intentHeader}>
                <Text style={styles.intentTitle}>✅ Samjh Gaya</Text>
                <View style={styles.matchBadge}>
                  <Text style={styles.matchText}>98% Match</Text>
                </View>
              </View>
              <View style={styles.intentGrid}>
                <View style={styles.intentCell}>
                  <Text style={styles.intentLabel}>SERVICE</Text>
                  <Text style={styles.intentValue}>{item.intent.service_type || 'AC Repair'}</Text>
                </View>
                <View style={styles.intentCell}>
                  <Text style={styles.intentLabel}>LOCATION</Text>
                  <Text style={styles.intentValue}>{item.intent.location || 'G-13, Isb'}</Text>
                </View>
                <View style={styles.intentCell}>
                  <Text style={styles.intentLabel}>TIME</Text>
                  <Text style={styles.intentValue}>{item.intent.preferred_time || 'Aaj'}</Text>
                </View>
                <View style={styles.intentCell}>
                  <Text style={styles.intentLabel}>URGENCY</Text>
                  <Text style={[
                    styles.intentValue,
                    { color: item.intent.urgency === 'high' ? C.danger : item.intent.urgency === 'medium' ? C.warning : C.primary }
                  ]}>
                    {(item.intent.urgency || 'medium').toUpperCase()}
                  </Text>
                </View>
              </View>
            </BlurView>
          )}
        </BlurView>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      {/* HEADER */}
      <BlurView intensity={60} tint="dark" style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Ionicons name="chevron-back" size={24} color={C.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Karigar AI</Text>
          <Text style={styles.headerSubtitle}>🟢 Online</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="chatbubbles-outline" size={22} color={C.textPrimary} />
          </TouchableOpacity>
        </View>
      </BlurView>

      {/* CHIP BAR */}
      <View style={styles.chipBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled={true}
          contentContainerStyle={styles.chipScroll}
        >
          {SERVICES.map((service) => (
            <ServiceChip
              key={service.id}
              emoji={service.emoji}
              label={service.label}
              active={false}
              onPress={() => sendMessage(service.query)}
            />
          ))}
        </ScrollView>
      </View>

      {/* MESSAGES LIST */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={() => (
          showThinking && (
            <Animated.View style={[styles.thinkingContainer, { opacity: thinkingOpacity }]}>
              <BlurView intensity={40} tint="dark" style={styles.thinkingCard}>
                <View style={styles.thinkingHeader}>
                  <Text style={styles.thinkingTitle}>🤖 Soch raha hoon...</Text>
                  <ActivityIndicator size="small" color={C.primary} />
                </View>
                {thinkingSteps.map((step, idx) => (
                  <Text key={idx} style={styles.thinkingStep}>
                    • {step}
                  </Text>
                ))}
              </BlurView>
            </Animated.View>
          )
        )}
      />

      {/* INPUT BAR */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <BlurView intensity={70} tint="dark" style={styles.inputBar}>
          <View style={styles.row}>
            <TouchableOpacity 
              style={styles.micBtn} 
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              }}
            >
              <Ionicons name="mic-outline" size={22} color={C.textMuted} />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="AC theek karni hai, G-13 mein..."
              placeholderTextColor={C.textMuted}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={200}
            />

            <TouchableOpacity
              style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
              disabled={!input.trim()}
              onPress={() => sendMessage(input)}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={18} color={C.bgDeep} />
            </TouchableOpacity>
          </View>
        </BlurView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bgDeep,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.glassBorder,
    backgroundColor: 'rgba(11,22,34,0.7)',
  },
  headerLeft: {
    width: 40,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  headerBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textPrimary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: C.primary,
    marginTop: 2,
  },
  chipBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.glassBorder,
  },
  chipScroll: {
    paddingHorizontal: 16,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  userRow: {
    alignSelf: 'flex-end',
    marginBottom: 12,
    maxWidth: '78%',
  },
  assistantRow: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    maxWidth: '82%',
  },
  userBubble: {
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(2, 195, 154, 0.15)',
    overflow: 'hidden',
  },
  userBubbleBorder: {
    borderWidth: 1,
    borderColor: C.primaryGlow,
  },
  assistantBubble: {
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.glassBorder,
    overflow: 'hidden',
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
    color: C.textPrimary,
  },
  resultsButton: {
    backgroundColor: C.primaryDim,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginTop: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: C.primaryGlow,
  },
  resultsButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.primary,
  },
  intentCard: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.glassBorder,
    borderLeftWidth: 3,
    borderLeftColor: C.primary,
    padding: 12,
    overflow: 'hidden',
  },
  intentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  intentTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: C.textPrimary,
  },
  matchBadge: {
    backgroundColor: C.primaryDim,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  matchText: {
    fontSize: 9,
    fontWeight: '700',
    color: C.primary,
  },
  intentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  intentCell: {
    width: '50%',
    marginBottom: 8,
  },
  intentLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: C.textSecond,
    letterSpacing: 1,
  },
  intentValue: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textPrimary,
    marginTop: 2,
  },
  thinkingContainer: {
    alignSelf: 'flex-start',
    maxWidth: '70%',
    marginBottom: 12,
  },
  thinkingCard: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.glassBorder,
    overflow: 'hidden',
  },
  thinkingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  thinkingTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: C.primary,
  },
  thinkingStep: {
    fontSize: 11,
    color: C.textSecond,
    marginBottom: 4,
  },
  inputBar: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: C.glassBorder,
    backgroundColor: 'rgba(11,22,34,0.9)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  micBtn: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: C.glass,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.glassBorder,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: C.textPrimary,
    fontSize: 15,
    maxHeight: 100,
    marginHorizontal: 8,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
