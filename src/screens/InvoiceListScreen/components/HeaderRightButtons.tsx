import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LogoutIcon } from '../../../components/LogoutIcon';

export function HeaderRightButtons({
  onNewPress,
  onLogoutPress,
}: {
  onNewPress: () => void;
  onLogoutPress: () => void;
}) {
  return (
    <View style={styles.headerButtonsContainer}>
      <Pressable
        accessibilityRole="button"
        onPress={onNewPress}
        style={({ pressed }) => [
          styles.headerIconButton,
          pressed && styles.buttonPressed,
        ]}>
        <Text style={styles.headerIcon}>+</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={onLogoutPress}
        style={({ pressed }) => [
          styles.headerIconButton,
          pressed && styles.buttonPressed,
        ]}>
        <LogoutIcon size={24} color="#111827" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  headerButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 8,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 24,
    color: '#111827',
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.85,
  },
});
