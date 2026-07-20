import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { createInvoice } from '../../services/invoiceService';
import {
  createInvoiceSchema,
  type CreateInvoiceFormValues,
} from '../../validation/invoiceSchema';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { styles } from './styles';
import { InvoiceDatePicker } from './components/InvoiceDatePicker';
import { ItemExtensions } from './components/ItemExtension';
import { CustomerAddresses } from './components/CustomerAddress';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateInvoice'>;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to create invoice. Please try again.';
}

export function CreateInvoiceScreen({ navigation }: Props) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showInvoiceDatePicker, setShowInvoiceDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<CreateInvoiceFormValues>({
    defaultValues: {
      bankAccount: {
        bankId: '',
        sortCode: '09-01-01',
        accountNumber: '12345678',
        accountName: 'John Terry',
      },
      customer: {
        firstName: 'Nguyen',
        lastName: 'Dung 2',
        contact: {
          email: 'nguyendung2@101digital.io',
          mobileNumber: '+6597594971',
        },
        addresses: [
          {
            premise: 'CT11',
            countryCode: 'VN',
            postcode: '1000',
            county: 'hoangmai',
            city: 'hanoi',
            addressType: 'BILLING',
          },
        ],
      },
      invoiceReference: '#123456789',
      invoiceNumber: '',
      currency: 'GBP',
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      description: 'Invoice is issued to tester',
      items: [
        {
          itemReference: 'itemRef',
          description: 'Honda RC150',
          quantity: 1,
          rate: 1000,
          itemName: 'Honda Motor',
          itemUOM: 'KG',
          extensions: [],
        },
      ],
    },
    resolver: yupResolver(createInvoiceSchema) as any,
    mode: 'onSubmit',
  });

  const {
    fields: itemFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'items',
  });

  const onSubmit = handleSubmit(async (values: CreateInvoiceFormValues) => {
    setSubmitError(null);

    try {
      // createInvoice expects the invoice payload; our API client will post this shape
      await createInvoice({ invoices: [values] });
      Alert.alert(
        'Invoice created',
        'The invoice has been created successfully.',
      );
      navigation.navigate('Home');
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.card}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Invoice</Text>
        <Text style={styles.subtitle}>Fill in the invoice details below.</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bank Account</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Sort Code</Text>
            <Controller
              control={control}
              name="bankAccount.sortCode"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  editable={!isSubmitting}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="09-01-01"
                  placeholderTextColor="#9CA3AF"
                  style={[styles.input]}
                  value={value as string}
                />
              )}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Account Number</Text>
            <Controller
              control={control}
              name="bankAccount.accountNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  keyboardType="numeric"
                  editable={!isSubmitting}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="12345678"
                  placeholderTextColor="#9CA3AF"
                  style={[styles.input]}
                  value={value as string}
                />
              )}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Account Name</Text>
            <Controller
              control={control}
              name="bankAccount.accountName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  autoCapitalize="words"
                  editable={!isSubmitting}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="John Terry"
                  placeholderTextColor="#9CA3AF"
                  style={[styles.input]}
                  value={value as string}
                />
              )}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Bank ID</Text>
            <Controller
              control={control}
              name="bankAccount.bankId"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  editable={!isSubmitting}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Optional bank ID"
                  placeholderTextColor="#9CA3AF"
                  style={[styles.input]}
                  value={value as string}
                />
              )}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>First Name</Text>
            <Controller
              control={control}
              name="customer.firstName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  autoCapitalize="words"
                  editable={!isSubmitting}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="First name"
                  placeholderTextColor="#9CA3AF"
                  style={[
                    styles.input,
                    errors.customer?.firstName && styles.inputError,
                  ]}
                  value={value as string}
                />
              )}
            />
            {errors.customer?.firstName ? (
              <Text style={styles.errorText}>
                {(errors.customer.firstName as any).message}
              </Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Last Name</Text>
            <Controller
              control={control}
              name="customer.lastName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  autoCapitalize="words"
                  editable={!isSubmitting}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Last name"
                  placeholderTextColor="#9CA3AF"
                  style={[styles.input]}
                  value={value as string}
                />
              )}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <Controller
              control={control}
              name="customer.contact.email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  keyboardType="email-address"
                  editable={!isSubmitting}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Email"
                  placeholderTextColor="#9CA3AF"
                  style={[
                    styles.input,
                    errors.customer?.contact?.email && styles.inputError,
                  ]}
                  value={value as string}
                />
              )}
            />
            {errors.customer?.contact?.email ? (
              <Text style={styles.errorText}>
                {(errors.customer.contact.email as any).message}
              </Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Mobile Number</Text>
            <Controller
              control={control}
              name="customer.contact.mobileNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  keyboardType="phone-pad"
                  editable={!isSubmitting}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Mobile"
                  placeholderTextColor="#9CA3AF"
                  style={[styles.input]}
                  value={value as string}
                />
              )}
            />
          </View>

          <CustomerAddresses control={control} isSubmitting={isSubmitting} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoice</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Invoice Reference</Text>
            <Controller
              control={control}
              name="invoiceReference"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  editable={!isSubmitting}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="#123456"
                  placeholderTextColor="#9CA3AF"
                  style={[styles.input]}
                  value={value as string}
                />
              )}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Invoice Number</Text>
            <Controller
              control={control}
              name="invoiceNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  editable={!isSubmitting}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="INV123"
                  placeholderTextColor="#9CA3AF"
                  style={[
                    styles.input,
                    errors.invoiceNumber && styles.inputError,
                  ]}
                  value={value as string}
                />
              )}
            />
            {errors.invoiceNumber ? (
              <Text style={styles.errorText}>
                {errors.invoiceNumber.message}
              </Text>
            ) : null}
          </View>

          <View style={styles.rowGroup}>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Issue Date</Text>
              <Controller
                control={control}
                name="invoiceDate"
                render={({ field: { value } }) => (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setShowInvoiceDatePicker(true)}
                    style={[
                      styles.input,
                      errors.invoiceDate && styles.inputError,
                      styles.dateInputButton,
                    ]}>
                    <Text
                      style={[
                        styles.dateInputText,
                        (value as string)
                          ? styles.dateInputValue
                          : styles.dateInputPlaceholder,
                      ]}>
                      {(value as string) || 'Select date'}
                    </Text>
                  </Pressable>
                )}
              />
              {errors.invoiceDate ? (
                <Text style={styles.errorText}>
                  {errors.invoiceDate.message}
                </Text>
              ) : null}
            </View>

            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Due Date</Text>
              <Controller
                control={control}
                name="dueDate"
                render={({ field: { value } }) => (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setShowDueDatePicker(true)}
                    style={[
                      styles.input,
                      errors.dueDate && styles.inputError,
                      styles.dateInputButton,
                    ]}>
                    <Text
                      style={[
                        styles.dateInputText,
                        (value as string)
                          ? styles.dateInputValue
                          : styles.dateInputPlaceholder,
                      ]}>
                      {(value as string) || 'Select date'}
                    </Text>
                  </Pressable>
                )}
              />
              {errors.dueDate ? (
                <Text style={styles.errorText}>{errors.dueDate.message}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Currency</Text>
            <Controller
              control={control}
              name="currency"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  editable={!isSubmitting}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="GBP"
                  placeholderTextColor="#9CA3AF"
                  style={[styles.input, errors.currency && styles.inputError]}
                  value={value as string}
                />
              )}
            />
            {errors.currency ? (
              <Text style={styles.errorText}>{errors.currency.message}</Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Description</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  editable={!isSubmitting}
                  multiline
                  numberOfLines={3}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Description"
                  placeholderTextColor="#9CA3AF"
                  style={[styles.input, styles.textArea]}
                  value={value as string}
                />
              )}
            />
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {itemFields.map((item, index) => (
            <View style={styles.itemCard} key={item.id}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>Item {index + 1}</Text>
                {itemFields.length > 1 ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => remove(index)}
                    style={styles.removeButton}>
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </Pressable>
                ) : null}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Item Description</Text>
                <Controller
                  control={control}
                  name={('items.' + index + '.description') as any}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      editable={!isSubmitting}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      placeholder="Item description"
                      placeholderTextColor="#9CA3AF"
                      style={[
                        styles.input,
                        errors.items?.[index]?.description && styles.inputError,
                      ]}
                      value={value as string}
                    />
                  )}
                />
                {errors.items?.[index]?.description ? (
                  <Text style={styles.errorText}>
                    {(errors.items[index].description as any).message}
                  </Text>
                ) : null}
              </View>

              <View style={styles.rowGroup}>
                <View style={[styles.fieldGroup, styles.halfField]}>
                  <Text style={styles.label}>Quantity</Text>
                  <Controller
                    control={control}
                    name={('items.' + index + '.quantity') as any}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        keyboardType="numeric"
                        editable={!isSubmitting}
                        onBlur={onBlur}
                        onChangeText={text => onChange(Number(text))}
                        placeholder="1"
                        placeholderTextColor="#9CA3AF"
                        style={[
                          styles.input,
                          errors.items?.[index]?.quantity && styles.inputError,
                        ]}
                        value={value !== undefined ? String(value) : ''}
                      />
                    )}
                  />
                  {errors.items?.[index]?.quantity ? (
                    <Text style={styles.errorText}>
                      {(errors.items[index].quantity as any).message}
                    </Text>
                  ) : null}
                </View>

                <View style={[styles.fieldGroup, styles.halfField]}>
                  <Text style={styles.label}>Rate</Text>
                  <Controller
                    control={control}
                    name={('items.' + index + '.rate') as any}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        keyboardType="numeric"
                        editable={!isSubmitting}
                        onBlur={onBlur}
                        onChangeText={text => onChange(Number(text))}
                        placeholder="1000"
                        placeholderTextColor="#9CA3AF"
                        style={[
                          styles.input,
                          errors.items?.[index]?.rate && styles.inputError,
                        ]}
                        value={value !== undefined ? String(value) : ''}
                      />
                    )}
                  />
                  {errors.items?.[index]?.rate ? (
                    <Text style={styles.errorText}>
                      {(errors.items[index].rate as any).message}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Item reference</Text>
                <Controller
                  control={control}
                  name={('items.' + index + '.itemReference') as any}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      editable={!isSubmitting}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      placeholder="Item reference"
                      placeholderTextColor="#9CA3AF"
                      style={[
                        styles.input,
                        errors.items?.[index]?.description && styles.inputError,
                      ]}
                      value={value as string}
                    />
                  )}
                />
                {errors.items?.[index]?.description ? (
                  <Text style={styles.errorText}>
                    {(errors.items[index].description as any).message}
                  </Text>
                ) : null}
              </View>

              <ItemExtensions
                control={control}
                itemIndex={index}
                isSubmitting={isSubmitting}
              />
            </View>
          ))}

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              append({
                itemReference: '',
                description: '',
                quantity: 1,
                rate: 0,
                itemName: '',
                itemUOM: '',
                extensions: [],
              })
            }
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.button,
              (pressed || isSubmitting) && styles.buttonPressed,
            ]}>
            <Text style={styles.buttonText}>Add Item</Text>
          </Pressable>
        </View>

        {submitError ? (
          <Text style={styles.submitError}>{submitError}</Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={onSubmit}
          style={({ pressed }) => [
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
      <InvoiceDatePicker
        visible={showInvoiceDatePicker}
        value={new Date()}
        onChange={(date: Date) => {
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          setValue('invoiceDate', `${yyyy}-${mm}-${dd}`);
          setShowInvoiceDatePicker(false);
        }}
      />
      <InvoiceDatePicker
        visible={showDueDatePicker}
        value={new Date()}
        onChange={(date: Date) => {
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          setValue('dueDate', `${yyyy}-${mm}-${dd}`);
          setShowDueDatePicker(false);
        }}
      />
    </KeyboardAvoidingView>
  );
}
