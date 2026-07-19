import * as yup from 'yup';

export const loginSchema = yup.object({
  username: yup
    .string()
    .trim()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormValues = yup.InferType<typeof loginSchema>;
