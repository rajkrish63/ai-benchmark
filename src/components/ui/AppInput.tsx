import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppIcon } from './AppIcon';
import { AppText } from './AppText';

export interface AppInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  onClear?: () => void;
  rightElement?: React.ReactNode;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  error,
  helperText,
  containerStyle,
  onClear,
  rightElement,
  value,
  editable = true,
  placeholder,
  ...rest
}) => {
  const { theme } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);

  const hasError = Boolean(error);

  const borderColor = hasError
    ? theme.colors.danger
    : isFocused
    ? theme.colors.primary
    : theme.colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <AppText
          variant="secondary"
          weight="500"
          color={hasError ? 'danger' : 'secondary'}
          style={styles.label}
        >
          {label}
        </AppText>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.surfaceCard,
            borderColor,
            borderRadius: theme.radius.input, // 10px
            opacity: editable ? 1 : 0.38,
          },
        ]}
      >
        <TextInput
          value={value}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textTertiary}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            {
              color: theme.colors.textPrimary,
              fontSize: theme.typography.body.fontSize,
            },
          ]}
          {...rest}
        />

        {value && onClear && editable ? (
          <TouchableOpacity
            onPress={onClear}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.actionButton}
            accessibilityRole="button"
            accessibilityLabel="Clear text"
          >
            <AppIcon name="close" size={16} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        ) : null}

        {rightElement ? <View style={styles.actionButton}>{rightElement}</View> : null}
      </View>

      {hasError ? (
        <AppText variant="caption" color="danger" style={styles.helperText}>
          {error}
        </AppText>
      ) : helperText ? (
        <AppText variant="caption" color="tertiary" style={styles.helperText}>
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 0,
    fontFamily: 'sans-serif',
  },
  actionButton: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperText: {
    marginTop: 4,
  },
});
