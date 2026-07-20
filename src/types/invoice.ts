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
  customer: CustomerSummary;

  // Status array from API: [{ key: string, value: boolean }]
  status?: RawStatusEntry[];

  // Optional additional fields from API
  description?: string;
  [key: string]: unknown;
}

export interface BankAccountPayload {
  bankId?: string;
  sortCode?: string;
  accountNumber?: string;
  accountName?: string;
}

export interface AddressPayload {
  premise?: string;
  countryCode?: string;
  postcode?: string;
  county?: string;
  city?: string;
  addressType?: string;
}

export interface ContactPayload {
  email?: string;
  mobileNumber?: string;
}

export interface CustomerPayload {
  firstName?: string;
  lastName?: string;
  contact?: ContactPayload;
  addresses?: AddressPayload[];
}

export interface ItemExtension {
  addDeduct?: 'ADD' | 'DEDUCT';
  value?: number;
  type?: 'PERCENTAGE' | 'FIXED_VALUE';
  name?: string;
}

export interface InvoiceItem {
  itemReference?: string;
  description?: string;
  quantity?: number;
  rate?: number;
  itemName?: string;
  itemUOM?: string;
  extensions?: ItemExtension[];
}

export interface InvoiceExtension {
  addDeduct?: 'ADD' | 'DEDUCT';
  value?: number;
  type?: 'PERCENTAGE' | 'FIXED_VALUE';
  name?: string;
}

export interface InvoiceCreatePayload {
  bankAccount?: BankAccountPayload;
  customer?: CustomerPayload;
  invoiceReference?: string;
  invoiceNumber?: string;
  currency?: string;
  invoiceDate?: string;
  dueDate?: string;
  description?: string;
  extensions?: InvoiceExtension[];
  items?: InvoiceItem[];
}

export type CreateInvoiceFormValues = InvoiceCreatePayload;
