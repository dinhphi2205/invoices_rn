import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../contexts/AuthContext';
import { InvoicesListScreen } from '../screens/InvoiceListScreen/InvoicesListScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { CreateInvoiceScreen } from '../screens/CreateInvoiceScreen/CreateInvoiceScreen';
import { InvoiceDetailScreen } from '../screens/InvoiceDetailScreen/InvoiceDetailScreen';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  InvoiceDetail: { invoiceId: string };
  CreateInvoice: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
}

export function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: '#111827',
          contentStyle: { backgroundColor: '#FFFFFF' },
        }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen
              name="Home"
              component={InvoicesListScreen}
              options={{ title: 'Invoices' }}
            />
            <Stack.Screen
              name="InvoiceDetail"
              component={InvoiceDetailScreen}
              options={{ title: 'Invoice details' }}
            />
            <Stack.Screen
              name="CreateInvoice"
              component={CreateInvoiceScreen}
              options={{ title: 'Create invoice' }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});
