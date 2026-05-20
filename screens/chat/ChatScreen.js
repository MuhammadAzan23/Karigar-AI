// ═══════════════════════════════════════════════════════
// Karigar AI — ChatScreen Component
// ═══════════════════════════════════════════════════════

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS, SHADOWS } from '../../constants/layout';
import ChatBubble from '../../components/chat/ChatBubble';
import IntentCard from '../../components/chat/IntentCard';
import Avatar from '../../components/ui/Avatar';
import { extractIntent } from '../../agents/intentAgent';
import { discoverProviders } from '../../agents/discoveryAgent';
import { rankProviders } from '../../agents/matchingAgent';

const SUGGESTIONS = [
  { id: '1', label: '❄️ AC Checkup', query: 'Mera AC thanda nahi kar raha, Clifton mein check karwana hai.' },
  { id: '2', label: '⚡ Short Circuit', query: 'Bijli ka short circuit hai ghar pe, urgent electrician chahiye.' },
  { id: '3', label: '🔧 Water Leakage', query: 'Pani ki pipe leak ho rahi hai kitchen mein, foran plumber bheinjo.' },
  { id: '4', label: '💅 Salon Package', query: 'Bridal makeup or facial package chahiye ghar pe.' },
];

// Default center coordinates for Karachi
const KARACHI_LAT = 24.8607;
const KARACHI_LNG = 67.0011;

export default function ChatScreen({ route, navigation }) {
  const flatListRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Assalam-o-Alaikum! 👋 Mein Karigar AI hoon. Mujhe Roman Urdu ya English mein batayein, aapko kya kaam karwana hai? (E.g. AC repair, short circuit, nalka leakage)',
      time: 'Abhi',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userCoords, setUserCoords] = useState({ latitude: KARACHI_LAT, longitude: KARACHI_LNG });
  const [showThinking, setShowThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState('');
  const [selectedSuggestions, setSelectedSuggestions] = useState(SUGGESTIONS);

  // Fetch coordinates
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let loc = await Location.getCurrentPositionAsync({});
          setUserCoords({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      } catch (e) {
        console.log('Location bypass in ChatScreen:', e.message);
      }
    })();
  }, []);

  // Handle route params prefill
  useEffect(() => {
    if (route.params?.prefill) {
      sendMessage(route.params.prefill);
    }
  }, [route.params]);

  const runMultiAgentPipeline = async (text) => {
    setShowThinking(true);
    setThinkingStep('Analyzing your request (Gemini Flash)...');
    
    // 1. Intent Extraction Agent
    const intentResult = await extractIntent(text);
    await new Promise(r => setTimeout(r, 600));

    if (intentResult.clarification_needed) {
      setShowThinking(false);
      return {
        role: 'assistant',
        content: intentResult.clarification_question || 'Mujhe samajh nahi aya. Dobara likhein please.',
        time: 'Abhi',
      };
    }

    // Update thinking step
    setThinkingStep('Scanning 30 localized Karachi providers...');
    await new Promise(r => setTimeout(r, 600));

    // 2. Discovery Agent
    const discovered = discoverProviders(intentResult, userCoords.latitude, userCoords.longitude);

    setThinkingStep('Scoring and ranking based on 6 factors...');
    await new Promise(r => setTimeout(r, 600));

    // 3. Matching Agent
    const matchResult = rankProviders(discovered, intentResult);

    setShowThinking(false);
    return {
      role: 'assistant',
      content: matchResult.reasoning,
      time: 'Abhi',
      intent: intentResult,
      providers: matchResult.ranked.slice(0, 3), // Show top 3 matches directly in-chat
    };
  };

  const sendMessage = useCallback(async (text) => {
    if (!text || !text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      time: 'Abhi',
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const pipelineOutput = await runMultiAgentPipeline(text.trim());
      
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        ...pipelineOutput,
      };

      setMessages(prev => [...prev, aiMsg]);
      setSelectedSuggestions([]); // Hide chips once conversation begins
    } catch (error) {
      console.log('Pipeline error:', error);
      setShowThinking(false);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: 'Network masla ho gaya. Dobara try kijiye.',
          time: 'Abhi',
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [userCoords]);

  const renderMatchedProviderItem = (provider, intent) => {
    const [collapsed, setCollapsed] = useState(true);

    return (
      <View key={provider.id} style={styles.providerCard}>
        <View style={styles.providerHeader}>
          <Avatar
            initials={provider.initials || provider.name?.substring(0, 2)}
            size={36}
            bg={provider.avatar_bg || COLORS.teal}
          />
          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>{provider.name}</Text>
            <Text style={styles.providerMeta}>⭐ {provider.rating.toFixed(1)} ({provider.review_count} reviews)</Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{provider.matchScore}% Match</Text>
          </View>
        </View>

        <View style={styles.providerSpecs}>
          <Text style={styles.specItem}>📍 {provider.distanceKm} km</Text>
          <Text style={styles.specItem}>💰 PKR {provider.price_per_hour}/hr</Text>
        </View>

        {/* Collapsible reasoning */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setCollapsed(!collapsed)}
          style={styles.reasonCollapseBtn}
        >
          <Text style={styles.reasonCollapseText}>
            {collapsed ? '▼ Show AI Reasoning' : '▲ Hide AI Reasoning'}
          </Text>
        </TouchableOpacity>

        {!collapsed && (
          <View style={styles.reasonBox}>
            <Text style={styles.reasonText}>
              • 6-Factor Weights applied: Distance (25%), Rating (20%), On-Time ({provider.on_time_score}% score).
            </Text>
            <Text style={styles.reasonText}>
              • Specialization matched: "{provider.specialization || 'Home services'}".
            </Text>
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate('Booking', {
              screen: 'BookingScreen',
              params: { provider, intent },
            });
          }}
          style={styles.bookBtn}
        >
          <Text style={styles.bookBtnText}>Select & Book</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderMessageItem = ({ item }) => {
    return (
      <View style={styles.messageWrapper}>
        <ChatBubble message={item} />
        
        {item.intent && (
          <View style={styles.intentWrapper}>
            <IntentCard intent={item.intent} />
          </View>
        )}

        {item.providers && item.providers.length > 0 && (
          <View style={styles.providersContainer}>
            <Text style={styles.matchedTitle}>Top Recommended Karigars:</Text>
            {item.providers.map(p => renderMatchedProviderItem(p, item.intent))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backEmoji}>⬅️</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Karigar Conversational AI</Text>
          <Text style={styles.headerSubtitle}>🟢 Active Gemini Flash</Text>
        </View>
        <View style={styles.placeholderBtn} />
      </View>

      {/* Suggestion Chips */}
      {selectedSuggestions.length > 0 && (
        <View style={styles.suggestionsBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
            {selectedSuggestions.map(chip => (
              <TouchableOpacity
                key={chip.id}
                style={styles.chip}
                onPress={() => sendMessage(chip.query)}
              >
                <Text style={styles.chipText}>{chip.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Message List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={() => (
          showThinking && (
            <View style={styles.thinkingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.thinkingText}>{thinkingStep}</Text>
            </View>
          )
        )}
      />

      {/* Input Tray */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputTray}>
          <TextInput
            style={styles.input}
            placeholder="E.g. AC cooling check karna hai..."
            placeholderTextColor={COLORS.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={150}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            disabled={!input.trim() || loading}
            onPress={() => sendMessage(input)}
          >
            <Text style={styles.sendText}>➡️</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  backBtn: {
    padding: SPACING.xs,
  },
  backEmoji: {
    fontSize: 20,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: COLORS.primary,
    fontSize: 11,
    marginTop: 2,
  },
  placeholderBtn: {
    width: 24,
  },
  suggestionsBar: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionsScroll: {
    paddingHorizontal: SPACING.lg,
  },
  chip: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: SPACING.sm,
  },
  chipText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 40,
  },
  messageWrapper: {
    marginVertical: SPACING.xs,
  },
  intentWrapper: {
    paddingLeft: SPACING.xl,
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  thinkingText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginLeft: SPACING.sm,
  },
  providersContainer: {
    paddingLeft: SPACING.xl,
    marginTop: SPACING.sm,
  },
  matchedTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  providerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerInfo: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  providerName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  providerMeta: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  scoreBadge: {
    backgroundColor: 'rgba(2, 195, 154, 0.1)',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  scoreText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  providerSpecs: {
    flexDirection: 'row',
    marginTop: SPACING.md,
  },
  specItem: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    marginRight: SPACING.lg,
  },
  reasonCollapseBtn: {
    marginTop: SPACING.sm,
    paddingVertical: 4,
  },
  reasonCollapseText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  reasonBox: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginTop: SPACING.xs,
  },
  reasonText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  bookBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  bookBtnText: {
    color: COLORS.bg,
    fontSize: 13,
    fontWeight: '700',
  },
  inputTray: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 14,
    maxHeight: 80,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendText: {
    fontSize: 16,
  },
});
