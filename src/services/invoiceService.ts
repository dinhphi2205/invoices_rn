import {apiClient} from './apiClient';
import type {Invoice, InvoiceCreatePayload} from '../types/invoice';

const invoicePath = '/invoice-service/1.0.0/invoices';

export interface InvoiceListParams {
  pageNum: number;
  pageSize: number;
  sortBy?: string;
  ordering?: 'ASCENDING' | 'DESCENDING';
  search?: string;
  status?: string;
}

export async function fetchInvoices(
  params: InvoiceListParams,
): Promise<Invoice[]> {
  const response = await apiClient.get<Invoice[] | {data: Invoice[]}>(invoicePath, {
    params,
  });

  const payload = response.data as any;
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.data ?? [];
}

export async function fetchInvoice(invoiceId: string): Promise<Invoice> {
  const response = await apiClient.get<Invoice>(`${invoicePath}/${invoiceId}`);
  return response.data;
}

export async function createInvoice(
  payload: InvoiceCreatePayload,
): Promise<Invoice> {
  const response = await apiClient.post<Invoice>(invoicePath, payload);
  return response.data;
}
