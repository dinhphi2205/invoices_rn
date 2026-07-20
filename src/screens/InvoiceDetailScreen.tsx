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
import { formatCurrency, getStatusColor } from '../utils/formatting';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error ?? 'Invoice not found.'}</Text>
      </View>
    );
  }

  // Safe TypeScript type casting to map your exact JSON structure cleanly
  const rawInvoice = invoice as any;
  const symbol = rawInvoice.currencySymbol ?? '$';
  const currencyCode = rawInvoice.currency ?? 'USD';

  // Safe extraction of the primary status key
  const activeStatusObj = Array.isArray(rawInvoice.status)
    ? (rawInvoice.status.find((s: any) => s.value) ?? rawInvoice.status[0])
    : null;
  const statusLabel = activeStatusObj ? activeStatusObj.key : 'Unknown';
  const isOverdue = statusLabel.toLowerCase() === 'overdue';

  const statusColors = getStatusColor(statusLabel);

  const cleanLabel = (text: string) => {
    if (!text) return '';
    return text
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  // Safe address string compiler
  const renderMerchantAddress = () => {
    const addr = rawInvoice.merchant?.addresses?.[0];
    if (!addr) return null;
    return (
      <Text style={styles.addressText}>
        {`${addr.premise ?? ''} ${addr.city ?? ''}\n${addr.postcode ?? ''}`}
      </Text>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        {/* HEADER & STATUS BADGE */}
        <View style={styles.headerRow}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.invoiceType}>
              {cleanLabel(String(rawInvoice.type ?? 'INVOICE'))}
            </Text>
            <Text style={styles.title}>#{rawInvoice.invoiceNumber}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColors.backgroundColor },
            ]}>
            <Text
              style={[styles.statusText, { color: statusColors.textColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>

        {/* TIMELINE METADATA */}
        <View style={styles.metaContainer}>
          <View style={styles.metaColumn}>
            <Text style={styles.metaLabel}>Issued Date</Text>
            <Text style={styles.metaValue}>
              {String(rawInvoice.invoiceDate ?? rawInvoice.createdAt ?? '—')}
            </Text>
          </View>
          <View style={[styles.metaColumn, styles.metaBorder]}>
            <Text style={styles.metaLabel}>Due Date</Text>
            <Text
              style={[styles.metaValue, isOverdue && styles.textOverdueBold]}>
              {rawInvoice.dueDate ?? '—'}
            </Text>
          </View>
          <View style={styles.metaColumn}>
            <Text style={styles.metaLabel}>Ref Number</Text>
            <Text style={styles.metaValue}>
              {String(
                rawInvoice.referenceNo ?? rawInvoice.invoiceReference ?? '—',
              )}
            </Text>
          </View>
        </View>

        {/* BILLING PARTY SEGMENT */}
        <View style={styles.billingRow}>
          {rawInvoice.merchant ? (
            <View style={styles.billingBox}>
              <Text style={styles.sectionTitle}>From</Text>
              <Text style={styles.entityName}> {rawInvoice.merchant.name}</Text>
              {renderMerchantAddress()}
            </View>
          ) : null}

          {rawInvoice.customer ? (
            <View style={styles.billingBox}>
              <Text style={styles.sectionTitle}>To</Text>
              <Text style={styles.entityName}>
                {`${rawInvoice.customer.firstName ?? ''} ${rawInvoice.customer.lastName ?? ''}`.trim() ||
                  'Valued Customer'}
              </Text>
              {rawInvoice.customer.contact ? (
                <>
                  {rawInvoice.customer.contact.email ? (
                    <Text style={styles.addressText} numberOfLines={1}>
                      {rawInvoice.customer.contact.email}
                    </Text>
                  ) : null}
                  {rawInvoice.customer.contact.mobileNumber ? (
                    <Text style={styles.addressText}>
                      {rawInvoice.customer.contact.mobileNumber}
                    </Text>
                  ) : null}
                </>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* LINE ITEMS LISTING */}
        {Array.isArray(rawInvoice.items) && rawInvoice.items.length > 0 && (
          <View style={styles.sectionSpace}>
            <Text style={styles.sectionHeading}>Items Ordered</Text>
            {rawInvoice.items.map((item: any, index: number) => (
              <View key={item.orderIndex ?? index} style={styles.itemCard}>
                <View style={styles.itemMainRow}>
                  <Text style={styles.itemName}>
                    {item.itemName || 'Line Item'}
                  </Text>
                  <Text style={styles.itemPrice}>
                    {formatCurrency(item.amount ?? 0, symbol, currencyCode)}
                  </Text>
                </View>
                <Text style={styles.itemSubText}>
                  {`Qty: ${item.quantity ?? 1} ${item.itemUOM ?? 'Unit'} × ${formatCurrency(item.rate ?? 0, symbol, currencyCode)}`}
                </Text>
                {item.itemReference && item.itemReference !== 'No Ref' ? (
                  <Text style={styles.itemRefText}>
                    Ref: {item.itemReference}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {/* COMPREHENSIVE FINANCIAL SUMMARY */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(
                rawInvoice.invoiceSubTotal ?? 0,
                symbol,
                currencyCode,
              )}
            </Text>
          </View>
          {(rawInvoice.totalDiscount ?? 0) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={[styles.summaryValue, styles.discountText]}>
                -
                {formatCurrency(
                  rawInvoice.totalDiscount ?? 0,
                  symbol,
                  currencyCode,
                )}
              </Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(rawInvoice.totalTax ?? 0, symbol, currencyCode)}
            </Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Gross Amount</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(
                rawInvoice.invoiceGrossTotal ?? rawInvoice.totalAmount ?? 0,
                symbol,
                currencyCode,
              )}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Paid</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(rawInvoice.totalPaid ?? 0, symbol, currencyCode)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.balanceRow]}>
            <Text style={styles.balanceLabel}>Balance Due</Text>
            <Text style={styles.balanceValue}>
              {formatCurrency(
                rawInvoice.balanceAmount ?? 0,
                symbol,
                currencyCode,
              )}
            </Text>
          </View>
        </View>

        {/* DESCRIPTION/NOTES */}
        {rawInvoice.description ? (
          <View style={styles.notesContainer}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesBody}>{rawInvoice.description}</Text>
          </View>
        ) : null}

        {/* BANK REMITTANCE INSTRUCTIONS */}
        {rawInvoice.bankAccount?.accountNumber ? (
          <View style={styles.bankContainer}>
            <Text style={styles.sectionHeading}>Bank Remittance Details</Text>
            <View style={styles.bankCard}>
              <Text style={styles.bankLabel}>
                Beneficiary:{' '}
                <Text style={styles.bankValue}>
                  {rawInvoice.bankAccount.accountName}
                </Text>
              </Text>
              <Text style={styles.bankLabel}>
                Account Number:{' '}
                <Text style={styles.bankValue}>
                  {rawInvoice.bankAccount.accountNumber}
                </Text>
              </Text>
              <Text style={styles.bankLabel}>
                Sort Code:{' '}
                <Text style={styles.bankValue}>
                  {rawInvoice.bankAccount.sortCode}
                </Text>
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTitleContainer: { flex: 1, marginRight: 12 },
  invoiceType: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  statusText: { fontSize: 13, fontWeight: '700' },
  metaContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  metaColumn: { flex: 1, alignItems: 'center' },
  metaBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#F3F4F6',
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: 2,
  },
  metaValue: { fontSize: 13, fontWeight: '600', color: '#111827' },
  textOverdueBold: { color: '#DC2626', fontWeight: '700' },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  billingBox: {
    flex: 0.48,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  entityName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  addressText: { fontSize: 13, color: '#4B5563', lineHeight: 18 },
  sectionSpace: { marginBottom: 16 },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  itemPrice: { fontSize: 15, fontWeight: '600', color: '#111827' },
  itemSubText: { fontSize: 13, color: '#6B7280' },
  itemRefText: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  summaryLabel: { fontSize: 14, color: '#4B5563' },
  summaryValue: { fontSize: 14, color: '#111827', fontWeight: '500' },
  discountText: { color: '#10B981' },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
    paddingTop: 10,
  },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
  totalValue: { fontSize: 15, fontWeight: '700', color: '#111827' },
  balanceRow: {
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  balanceLabel: { fontSize: 14, fontWeight: '700', color: '#DC2626' },
  balanceValue: { fontSize: 16, fontWeight: '800', color: '#DC2626' },
  notesContainer: {
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  notesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  notesBody: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  bankContainer: { marginBottom: 12 },
  bankCard: {
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  bankLabel: { fontSize: 13, color: '#1E3A8A', marginBottom: 3 },
  bankValue: { fontWeight: '700', color: '#1D4ED8' },
  errorText: { color: '#DC2626', fontSize: 16, textAlign: 'center' },
});
