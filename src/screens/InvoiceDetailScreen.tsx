import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { fetchInvoice } from '../services/invoiceService';
import type { Invoice } from '../types/invoice';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { formatCurrency } from '../utils/formatting';

type Props = NativeStackScreenProps<RootStackParamList, 'InvoiceDetail'>;

export function InvoiceDetailScreen({ route }: Props) {
  const { invoiceId } = route.params;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadInvoice() {
      try {
        const response = await fetchInvoice(invoiceId);

        if (isMounted) {
          setInvoice(response);
        }
      } catch {
        if (isMounted) {
          setError('Unable to load invoice details. Please try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInvoice();

    return () => {
      isMounted = false;
    };
  }, [invoiceId]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error || !invoice) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error ?? 'Invoice not found.'}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Invoice {invoice.invoiceNumber}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Customer</Text>
        <Text style={styles.value}>
          {String(
            invoice.merchant?.name ?? (invoice as any).customerName ?? '',
          )}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Issue Date</Text>
        <Text style={styles.value}>
          {String(invoice.invoiceDate ?? invoice.createdAt ?? '')}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Due Date</Text>
        <Text style={styles.value}>{invoice.dueDate}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Amount</Text>
        <Text style={styles.value}>
          {formatCurrency(
            // prefer invoice amounts if present
            (invoice as any).invoiceGrossTotal ??
              (invoice as any).totalAmount ??
              (invoice as any).balanceAmount ??
              (invoice as any).amount,
            (invoice as any).currencySymbol,
            (invoice as any).currency,
          )}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Status</Text>
        <Text style={[styles.value, styles.status]}>
          {String(
            invoice.status?.find(s => s.value)?.key ??
              invoice.status?.[0]?.key ??
              'Unknown',
          )}
        </Text>
      </View>
      {invoice.description ? (
        <View style={styles.row}>
          <Text style={styles.label}>Notes</Text>
          <Text style={styles.value}>{invoice.description}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
  },
  row: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
  },
  status: {
    textTransform: 'capitalize',
    color: '#2563EB',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
    textAlign: 'center',
  },
});
