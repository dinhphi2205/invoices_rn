import * as yup from 'yup';

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

export interface CreateInvoiceFormValues {
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

export const createInvoiceSchema = yup.object<CreateInvoiceFormValues>({
  customer: yup
    .object()
    .shape({
      firstName: yup.string().trim().required('First name is required'),
      lastName: yup.string().trim().optional(),
      contact: yup
        .object()
        .shape({
          email: yup.string().email('Invalid email').required('Email is required'),
          mobileNumber: yup.string().trim().optional(),
        })
        .required(),
      addresses: yup.array().of(
        yup.object().shape({
          premise: yup.string().trim().optional(),
          countryCode: yup.string().trim().optional(),
          postcode: yup.string().trim().optional(),
          county: yup.string().trim().optional(),
          city: yup.string().trim().optional(),
          addressType: yup.string().trim().optional(),
        }),
      ),
    })
    .required(),
  invoiceNumber: yup.string().trim().required('Invoice number is required'),
  invoiceDate: yup.string().trim().required('Invoice date is required'),
  dueDate: yup.string().trim().required('Due date is required'),
  currency: yup.string().trim().required('Currency is required'),
  items: yup
    .array()
    .of(
      yup.object().shape({
        description: yup.string().trim().required('Item description is required'),
        quantity: yup.number().typeError('Quantity must be a number').min(1).required('Quantity is required'),
        rate: yup.number().typeError('Rate must be a number').min(0).required('Rate is required'),
      }),
    )
    .min(1, 'At least one item is required'),
  description: yup.string().trim().max(500).optional(),
});
