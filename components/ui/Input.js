// ═══════════════════════════════════════════════════════
// Karigar AI — Input Reusable Component
// ═══════════════════════════════════════════════════════

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';

export default function Input({
  label,
  value,
  onChangeText,
  onChange, // Support both React Native standard and dynamic hooks
  placeholder,
  multiline = false,
  keyboardType = 'default',
  error = '',
  icon = null,
  placeholderTextColor = COLORS.textMuted,
  style = {},
  inputStyle = {},
  ...rest
}) {
  const [isFocused, setIsFocused] = useState(false);

  const handleTextChange = (text) => {
    if (onChangeText) {
      onChangeText(text);
    }
    if (onChange) {
      onChange(text);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View
        style={[
          styles.inputWrapper,
          multiline && styles.multilineWrapper,
          isFocused && styles.focusedBorder,
          error ? styles.errorBorder : null,
        ]}
      >
        {icon && <Text style={styles.icon}>{icon}</Text>}
        
        <TextInput
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          multiline={multiline}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          {...rest}
        />
      </View>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    ...TYPOGRAPHY.label,
    marginBottom: 6,
  },
  inputWrapper: {
    height: 52,
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  multilineWrapper: {
    height: 100,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  icon: {
    marginRight: 10,
    fontSize: 16,
  },
  input: {
    flex: 1,
    height: '100%',
    color: COLORS.white,
    fontSize: 15,
    padding: 0, // Reset default padding
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  focusedBorder: {
    borderColor: COLORS.primary,
  },
  errorBorder: {
    borderColor: COLORS.danger,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
