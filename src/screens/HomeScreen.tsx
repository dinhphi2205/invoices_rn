import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {useAuth} from '../contexts/AuthContext';

export function HomeScreen() {
  const {logout, session} = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invoices</Text>
      <Text style={styles.subtitle}>
        You are signed in. Invoice list will appear here.
      </Text>
      <Text style={styles.meta}>
        Organisation token loaded: {session?.orgToken ? 'Yes' : 'No'}
      </Text>

      <Pressable
        accessibilityRole="button"
        onPress={logout}
        style={({pressed}) => [styles.button, pressed && styles.buttonPressed]}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 12,
  },
  meta: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
