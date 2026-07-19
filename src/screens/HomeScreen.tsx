import React, {useCallback, useEffect, useLayoutEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {useAuth} from '../contexts/AuthContext';
import {fetchInvoices} from '../services/invoiceService';
import type {Invoice} from '../types/invoice';
import {formatCurrency, getStatusColor} from '../utils/formatting';
import {LogoutIcon} from '../components/LogoutIcon';
import type {RootStackParamList} from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const PAGE_SIZE = 10;
const STATUS_FILTERS: Array<'all' | string> = ['all', 'Overdue', 'Due', 'Paid'];

function HeaderRightButtons({onNewPress, onLogoutPress}: {onNewPress: () => void; onLogoutPress: () => void}) {
  return (
    <View style={styles.headerButtonsContainer}>
      <Pressable
        accessibilityRole="button"
        onPress={onNewPress}
        style={({pressed}) => [styles.headerIconButton, pressed && styles.buttonPressed]}>
        <Text style={styles.headerIcon}>+</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={onLogoutPress}
        style={({pressed}) => [styles.headerIconButton, pressed && styles.buttonPressed]}>
        <LogoutIcon size={24} color="#111827" />
      </Pressable>
    </View>
  );
}

function InlineDatePicker({
  visible,
  value,
  onChange,
}: {
  visible: boolean;
  value: Date;
  onChange: (event: any, date?: Date) => void;
}) {
  if (!visible) return null;
  return (
    <DatePicker
      modal
      open={visible}
      date={value}
      mode="date"
      onConfirm={d => onChange({}, d)}
      onCancel={() => onChange({}, undefined)}
    />
  );
}

export function HomeScreen({navigation}: Props) {
  const {logout} = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

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

  const fromDateValue = fromDate ? new Date(`${fromDate}T00:00:00`) : new Date();
  const toDateValue = toDate ? new Date(`${toDate}T00:00:00`) : new Date();
  const [statusFilter, setStatusFilter] = useState<'all' | string>('all');
  const [ordering, setOrdering] = useState<'ASCENDING' | 'DESCENDING'>('DESCENDING');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headerButtons = useMemo(
    () => <HeaderRightButtons onNewPress={() => navigation.navigate('CreateInvoice')} onLogoutPress={logout} />,
    [navigation, logout],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => headerButtons,
    });
  }, [navigation, headerButtons]);

  const loadInvoices = useCallback(
    async (page: number, reset = false) => {
      try {
        if (reset) {
          setIsLoading(true);
          setHasMore(true);
        } else {
          setIsLoadingMore(true);
        }

        setError(null);

        const invoiceList = await fetchInvoices({
          pageNum: page,
          pageSize: PAGE_SIZE,
          sortBy: 'CREATED_DATE',
          ordering,
          search: searchQuery || undefined,
          status: statusFilter === 'all' ? undefined : statusFilter,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        });

        setInvoices(prev => (reset ? invoiceList : [...prev, ...invoiceList]));
        setHasMore(invoiceList.length === PAGE_SIZE);
        setPageNum(page);
      } catch {
        setError('Unable to load invoices. Please try again.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [ordering, searchQuery, statusFilter, fromDate, toDate],
  );

  const loadInitialInvoices = useCallback(() => {
    loadInvoices(1, true);
  }, [loadInvoices]);

  const loadMoreInvoices = useCallback(() => {
    if (isLoading || isRefreshing || isLoadingMore || !hasMore || Boolean(error)) {
      return;
    }

    loadInvoices(pageNum + 1);
  }, [error, hasMore, isLoading, isLoadingMore, isRefreshing, loadInvoices, pageNum]);

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

  function renderInvoice({item}: {item: Invoice}) {
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
  }

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
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
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    color: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  searchButton: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
    marginLeft: 12,
    height: 44,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
    marginLeft: 12,
    height: 44,
  },
  clearButtonText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterGroup: {
    flex: 1,
    marginRight: 12,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterChipText: {
    color: '#111827',
    fontSize: 13,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  sortGroup: {
    alignItems: 'flex-end',
  },
  sortButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
    height: 44,
  },
  sortButtonText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
  },
  footerLoading: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  invoiceItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 3},
    elevation: 1,
  },
  invoiceItemPressed: {
    opacity: 0.85,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  invoiceAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  itemMeta: {
    fontSize: 13,
    color: '#6B7280',
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
    textAlign: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#111827',
    marginRight: 8,
    fontSize: 14,
  },
  dateInputText: {
    fontSize: 14,
  },
  dateInputPlaceholder: {
    color: '#9CA3AF',
  },
  dateInputValue: {
    color: '#111827',
  },
  listContent: {
    paddingBottom: 20,
  },
  
});
