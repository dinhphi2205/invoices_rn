export type RawStatusEntry = {
  key: string;
  value: boolean;
};

export interface MerchantSummary {
  id: string;
  name: string;
  addresses: unknown[];
}

export interface CustomerSummary {
  id: string;
  firstName?: string;
  lastName?: string;
  addresses: unknown[];
}
export interface Invoice {
  // Primary identifiers from API
  invoiceId: string;
  invoiceNumber: string;

  // Dates
  createdAt?: string; // ISO datetime as returned by API
  invoiceDate?: string; // issue date
  dueDate?: string;

  // Amounts (API may return one or both)
  invoiceGrossTotal?: number;
  totalAmount?: number;
  totalPaid?: number;
  balanceAmount?: number;

  // Merchant / client
  merchant?: MerchantSummary;
  customer: CustomerSummary

  // Status array from API: [{ key: string, value: boolean }]
  status?: RawStatusEntry[];

  // Optional additional fields from API
  description?: string;
  [key: string]: unknown;
}

export interface InvoiceCreatePayload {
  customerName: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  description?: string;
}

export type CreateInvoiceFormValues = InvoiceCreatePayload;
