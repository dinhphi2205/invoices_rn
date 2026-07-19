import React, {useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import {Controller, useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {createInvoice} from '../services/invoiceService';
import {createInvoiceSchema, type CreateInvoiceFormValues} from '../validation/invoiceSchema';
import type {RootStackParamList} from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateInvoice'>;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to create invoice. Please try again.';
}

export function CreateInvoiceScreen({navigation}: Props) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: {errors, isSubmitting},
  } = useForm<CreateInvoiceFormValues>({
    defaultValues: {
      customerName: '',
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date().toISOString().slice(0, 10),
      amount: 0,
      description: '',
    },
    resolver: yupResolver(createInvoiceSchema) as any,
    mode: 'onSubmit',
  });

  const onSubmit = handleSubmit(async (values: CreateInvoiceFormValues) => {
    setSubmitError(null);

    try {
      await createInvoice(values);
      Alert.alert('Invoice created', 'The invoice has been created successfully.');
      navigation.navigate('Home');
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.card} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Invoice</Text>
        <Text style={styles.subtitle}>Fill in the invoice details below.</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Customer Name</Text>
          <Controller
            control={control}
            name="customerName"
            render={({field: {onChange, onBlur, value}}) => (
              <TextInput
                autoCapitalize="words"
                autoCorrect
                editable={!isSubmitting}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Enter customer name"
                placeholderTextColor="#9CA3AF"
                style={[styles.input, errors.customerName && styles.inputError]}
                value={value}
              />
            )}
          />
          {errors.customerName ? (
            <Text style={styles.errorText}>{errors.customerName.message}</Text>
          ) : null}
        </View>

        <View style={styles.rowGroup}>
          <View style={[styles.fieldGroup, styles.halfField]}>
            <Text style={styles.label}>Issue Date</Text>
            <Controller
              control={control}
              name="issueDate"
              render={({field: {onChange, onBlur, value}}) => (
                <TextInput
                  editable={!isSubmitting}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9CA3AF"
                  style={[styles.input, errors.issueDate && styles.inputError]}
                  value={value}
                />
              )}
            />
            {errors.issueDate ? (
              <Text style={styles.errorText}>{errors.issueDate.message}</Text>
            ) : null}
          </View>

          <View style={[styles.fieldGroup, styles.halfField]}>
            <Text style={styles.label}>Due Date</Text>
            <Controller
              control={control}
              name="dueDate"
              render={({field: {onChange, onBlur, value}}) => (
                <TextInput
                  editable={!isSubmitting}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9CA3AF"
                  style={[styles.input, errors.dueDate && styles.inputError]}
                  value={value}
                />
              )}
            />
            {errors.dueDate ? (
              <Text style={styles.errorText}>{errors.dueDate.message}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Amount</Text>
          <Controller
            control={control}
            name="amount"
            render={({field: {onChange, onBlur, value}}) => (
              <TextInput
                editable={!isSubmitting}
                keyboardType="numeric"
                onBlur={onBlur}
                onChangeText={text => onChange(Number(text))}
                placeholder="Enter amount"
                placeholderTextColor="#9CA3AF"
                style={[styles.input, errors.amount && styles.inputError]}
                value={value ? String(value) : ''}
              />
            )}
          />
          {errors.amount ? <Text style={styles.errorText}>{errors.amount.message}</Text> : null}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Description</Text>
          <Controller
            control={control}
            name="description"
            render={({field: {onChange, onBlur, value}}) => (
              <TextInput
                editable={!isSubmitting}
                multiline
                numberOfLines={4}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Optional notes"
                placeholderTextColor="#9CA3AF"
                style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                value={value}
              />
            )}
          />
          {errors.description ? (
            <Text style={styles.errorText}>{errors.description.message}</Text>
          ) : null}
        </View>

        {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

        <Pressable
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={onSubmit}
          style={({pressed}) => [
            styles.button,
            (isSubmitting || pressed) && styles.buttonPressed,
          ]}>
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Create Invoice</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  card: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  rowGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfField: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#DC2626',
  },
  errorText: {
    marginTop: 6,
    color: '#DC2626',
    fontSize: 13,
  },
  submitError: {
    marginBottom: 12,
    color: '#DC2626',
    fontSize: 14,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
