import React, {useCallback, useEffect, useLayoutEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {useAuth} from '../../contexts/AuthContext';
import type {Invoice} from '../../types/invoice';
import {formatCurrency, getStatusColor} from '../../utils/formatting';
import type {RootStackParamList} from '../../navigation/RootNavigator';
import { InlineDatePicker } from './components/InlineDatePicker';
import { HeaderRightButtons } from './components/HeaderRightButtons';
import { styles } from './styles';
import { useInvoices } from './hooks/useInvoices';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const STATUS_FILTERS: Array<'all' | string> = ['all', 'Overdue', 'Due', 'Paid'];

export function InvoicesListScreen({navigation}: Props) {
  const {logout} = useAuth();
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const { ordering, isLoading, statusFilter, setStatusFilter, fromDate, toDate,  error, invoices, isRefreshing, isLoadingMore, loadInitialInvoices, loadInvoices, loadMoreInvoices, setFromDate, setToDate, setSearchQuery, searchTerm, setSearchTerm, setOrdering } = useInvoices();
  const fromDateValue = fromDate ? new Date(`${fromDate}T00:00:00`) : new Date();
  const toDateValue = toDate ? new Date(`${toDate}T00:00:00`) : new Date();
  function formatDateYMD(d: Date) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  const onFromChange = (_event: any, selected?: Date) => {
    setShowFromPicker(false);
    if (selected) {
      const newFrom = formatDateYMD(selected);
      setFromDate(newFrom);
      // if toDate exists and is earlier than new from, bump toDate to newFrom
      if (toDate) {
        const to = new Date(`${toDate}T00:00:00`);
        if (selected > to) {
          setToDate(newFrom);
        }
      }
    }
  };

  const onToChange = (_event: any, selected?: Date) => {
    setShowToPicker(false);
    if (selected) {
      // if fromDate exists and selected is before it, clamp to fromDate
      if (fromDate) {
        const from = new Date(`${fromDate}T00:00:00`);
        if (selected < from) {
          setToDate(fromDate);
          return;
        }
      }
      setToDate(formatDateYMD(selected));
    }
  };


  const headerButtons = useMemo(
    () => <HeaderRightButtons onNewPress={() => navigation.navigate('CreateInvoice')} onLogoutPress={logout} />,
    [navigation, logout],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => headerButtons,
    });
  }, [navigation, headerButtons]);

  useEffect(() => {
    loadInitialInvoices();
  }, [loadInitialInvoices]);

  useFocusEffect(
    useCallback(() => {
      loadInitialInvoices();
    }, [loadInitialInvoices]),
  );

  const handleSearch = useCallback(() => {
    setSearchQuery(searchTerm.trim());
    loadInvoices(1, true);
  }, [loadInvoices, searchTerm]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchQuery('');
    setFromDate('');
    setToDate('');
    loadInvoices(1, true);
  }, [loadInvoices]);

  const toggleOrdering = useCallback(() => {
    setOrdering(current => (current === 'DESCENDING' ? 'ASCENDING' : 'DESCENDING'));
  }, []);

  const renderInvoice = useCallback(({item}: {item: Invoice}) => {
    const amount = item.invoiceGrossTotal ?? item.totalAmount ?? item.balanceAmount ?? 0;
    const symbol = (item.currencySymbol ?? item.currency ?? '$') as string;
    const paymentStatus = item.status?.[0]?.key ?? 'Unknown';
    const statusColors = getStatusColor(paymentStatus);

    return (
      <Pressable
        onPress={() => navigation.navigate('InvoiceDetail', {invoiceId: item.invoiceId ?? item.id})}
        style={({pressed}) => [styles.invoiceItem, pressed && styles.invoiceItemPressed]}>
        <View style={styles.itemRow}>
          <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
          <Text style={styles.invoiceAmount}>{formatCurrency(Number(amount), symbol)}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemMeta}>Cust: {item.customer?.firstName} {item.customer?.lastName}</Text>
          <Text style={styles.itemMeta}>Mer: {item.merchant?.name}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemMeta}>Issue: {String(item.invoiceDate ?? (item as any).createdAt ?? '')}</Text>
          <Text style={styles.itemMeta}>Due: {String(item.dueDate ?? '')}</Text>
        </View>
        <View style={styles.itemRow}>
          <View style={[styles.statusBadge, {backgroundColor: statusColors.backgroundColor}]}>
            <Text style={[styles.statusBadgeText, {color: statusColors.textColor}]}>
              {paymentStatus}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TextInput
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearch}
          placeholder="IV number (ex: IV_1234)"
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
          returnKeyType="search"
        />

        {searchTerm ? (
          <Pressable
            onPress={clearSearch}
            style={({pressed}) => [styles.clearButton, pressed && styles.buttonPressed]}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </Pressable>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={handleSearch}
          style={({pressed}) => [styles.searchButton, pressed && styles.buttonPressed]}>
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>
      </View>
      <View style={styles.dateRow}>
        <Pressable onPress={() => setShowFromPicker(true)} style={styles.dateInput}>
          <Text style={[styles.dateInputText, fromDate ? styles.dateInputValue : styles.dateInputPlaceholder]}>
            {fromDate || 'From date'}
          </Text>
        </Pressable>
        <Pressable onPress={() => setShowToPicker(true)} style={styles.dateInput}>
          <Text style={[styles.dateInputText, toDate ? styles.dateInputValue : styles.dateInputPlaceholder]}>
            {toDate || 'To date'}
          </Text>
        </Pressable>
      </View>
      <View style={styles.filterRow}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Status</Text>
          <View style={styles.chipRow}>
            {STATUS_FILTERS.map(filter => (
              <Pressable
                key={filter}
                onPress={() => setStatusFilter(filter)}
                style={({pressed}) => [
                  styles.filterChip,
                  statusFilter === filter && styles.filterChipActive,
                  pressed && styles.buttonPressed,
                ]}>
                <Text
                  style={
                    statusFilter === filter
                      ? styles.filterChipTextActive
                      : styles.filterChipText
                  }>
                  {filter === 'all' ? 'All' : filter}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.sortGroup}>
          <Text style={styles.filterLabel}>Sort</Text>
          <Pressable
            onPress={toggleOrdering}
            style={({pressed}) => [styles.sortButton, pressed && styles.buttonPressed]}>
            <Text style={styles.sortButtonText}>
              {ordering === 'DESCENDING' ? 'Newest' : 'Oldest'}
            </Text>
          </Pressable>
        </View>
      </View>
      <InlineDatePicker visible={showFromPicker} value={fromDateValue} onChange={onFromChange} />
      <InlineDatePicker visible={showToPicker} value={toDateValue} onChange={onToChange} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : invoices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No invoices found.</Text>
        </View>
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={item => item.invoiceId ?? item.id}
          renderItem={renderInvoice}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => loadInvoices(1, true)} />
          }
          onEndReached={loadMoreInvoices}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator size="small" color="#2563EB" />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
