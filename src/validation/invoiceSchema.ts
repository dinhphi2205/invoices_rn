import * as yup from 'yup';

export interface CreateInvoiceFormValues {
  customerName: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  description?: string;
}

export const createInvoiceSchema = yup.object<CreateInvoiceFormValues>({
  customerName: yup
    .string()
    .trim()
    .required('Customer name is required')
    .min(2, 'Customer name must be at least 2 characters'),
  issueDate: yup
    .string()
    .trim()
    .required('Issue date is required'),
  dueDate: yup
    .string()
    .trim()
    .required('Due date is required'),
  amount: yup
    .number()
    .typeError('Amount must be a number')
    .positive('Amount must be greater than zero')
    .required('Amount is required'),
  description: yup.string().trim().max(250, 'Description can be at most 250 characters'),
});
