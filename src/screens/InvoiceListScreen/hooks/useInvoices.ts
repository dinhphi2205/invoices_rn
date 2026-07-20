import { useCallback, useState } from "react";
import { Invoice } from "../../../types/invoice";
import { fetchInvoices } from "../../../services/invoiceService";

const PAGE_SIZE = 10;
type ORDERING = 'ASCENDING' | 'DESCENDING';

export const useInvoices = () => {
  const [statusFilter, setStatusFilter] = useState<'all' | string>('all');
  const [ordering, setOrdering] = useState<ORDERING>('DESCENDING');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
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

  return {
    invoices,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    statusFilter,
    setStatusFilter,
    ordering,
    setOrdering,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    searchTerm,
    setSearchTerm,
    searchQuery,
    setSearchQuery,
    loadInitialInvoices,
    loadInvoices,
    loadMoreInvoices,
  }
}