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
import DatePicker from 'react-native-date-picker';
import PickerModalView from 'react-native-picker-modal-view';
import {Controller, useFieldArray, useForm, type Control} from 'react-hook-form';
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

function InvoiceDatePicker({
  visible,
  value,
  onChange,
}: {
  visible: boolean;
  value: Date;
  onChange: (date: Date) => void;
}) {
  if (!visible) return null;
  return (
    <DatePicker
      modal
      open={visible}
      date={value}
      mode="date"
      onConfirm={onChange}
      onCancel={() => {}}
    />
  );
}

function ItemExtensions({
  control,
  itemIndex,
  isSubmitting,
}: {
  control: Control<CreateInvoiceFormValues>;
  itemIndex: number;
  isSubmitting: boolean;
}) {
  const {fields: extensionFields, append, remove} = useFieldArray({
    control,
    name: `items.${itemIndex}.extensions` as any,
  });

  return (
    <View style={styles.subSection}>
      <Text style={styles.subSectionTitle}>Extensions</Text>
      {extensionFields.map((extension, extIndex) => (
        <View key={extension.id} style={styles.extensionCard}>
          <View style={styles.rowGroup}>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Name</Text>
              <Controller
                control={control}
                name={"items." + itemIndex + ".extensions." + extIndex + ".name" as any}
                render={({field: {onChange, onBlur, value}}) => (
                  <TextInput
                    editable={!isSubmitting}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="tax"
                    placeholderTextColor="#9CA3AF"
                    style={[styles.input]}
                    value={value as string}
                  />
                )}
              />
            </View>

            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Value</Text>
              <Controller
                control={control}
                name={"items." + itemIndex + ".extensions." + extIndex + ".value" as any}
                render={({field: {onChange, onBlur, value}}) => (
                  <TextInput
                    keyboardType="numeric"
                    editable={!isSubmitting}
                    onBlur={onBlur}
                    onChangeText={text => onChange(Number(text))}
                    placeholder="10"
                    placeholderTextColor="#9CA3AF"
                    style={[styles.input]}
                    value={value !== undefined ? String(value) : ''}
                  />
                )}
              />
            </View>
          </View>

          <View style={styles.rowGroup}>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Type</Text>
              <Controller
                control={control}
                name={"items." + itemIndex + ".extensions." + extIndex + ".type" as any}
                render={({field: {onChange, value}}) => (
                  <PickerModalView
                    renderSelectView={(disabled, selected, showModal) => (
                      <Pressable
                        onPress={showModal}
                        disabled={disabled}
                        style={[styles.input, styles.dateInputButton]}>
                        <Text style={[styles.dateInputText, selected?.Name ? styles.pickerTextColor : styles.pickerTextPlaceholder]}>
                          {selected?.Name || 'Type'}
                        </Text>
                      </Pressable>
                    )}
                    onSelected={(item: any) => {
                      onChange(item.Id);
                      return item;
                    }}
                    onClosed={() => {}}
                    onEndReached={() => {}}
                    items={[{Id: 'PERCENTAGE', Name: 'PERCENTAGE', Value: 'PERCENTAGE'}, {Id: 'FIXED_VALUE', Name: 'FIXED_VALUE', Value: 'FIXED_VALUE'}]}
                    selected={{Id: value, Name: value, Value: value}}
                  />
                )}
              />
            </View>

            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Add/Deduct</Text>
              <Controller
                control={control}
                name={"items." + itemIndex + ".extensions." + extIndex + ".addDeduct" as any}
                render={({field: {onChange, value}}) => (
                  <PickerModalView
                    renderSelectView={(disabled, selected, showModal) => (
                      <Pressable
                        onPress={showModal}
                        disabled={disabled}
                        style={[styles.input, styles.dateInputButton]}>
                        <Text style={[styles.dateInputText, selected?.Name ? styles.pickerTextColor : styles.pickerTextPlaceholder]}>
                          {selected?.Name || 'Add/Deduct'}
                        </Text>
                      </Pressable>
                    )}
                    onSelected={(item: any) => {
                      onChange(item.Id);
                      return item;
                    }}
                    onClosed={() => {}}
                    onEndReached={() => {}}
                    items={[{Id: 'ADD', Name: 'ADD', Value: 'ADD'}, {Id: 'DEDUCT', Name: 'DEDUCT', Value: 'DEDUCT'}]}
                    selected={{Id: value, Name: value, Value: value}}
                  />
                )}
              />
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => remove(extIndex)}
            disabled={isSubmitting}
            style={({pressed}) => [styles.removeButton, pressed && styles.buttonPressed]}>
            <Text style={styles.removeButtonText}>Remove Extension</Text>
          </Pressable>
        </View>
      ))}

      <Pressable
        accessibilityRole="button"
        onPress={() =>
          append({
            addDeduct: 'ADD',
            value: 0,
            type: 'FIXED_VALUE',
            name: '',
          })
        }
        disabled={isSubmitting}
        style={({pressed}) => [styles.button, (pressed || isSubmitting) && styles.buttonPressed]}>
        <Text style={styles.buttonText}>Add Extension</Text>
      </Pressable>
    </View>
  );
}

function CustomerAddresses({
  control,
  isSubmitting,
}: {
  control: Control<CreateInvoiceFormValues>;
  isSubmitting: boolean;
}) {
  const {fields: addressFields, append, remove} = useFieldArray({
    control,
    name: 'customer.addresses' as any,
  });

  return (
    <View style={styles.subSection}>
      <Text style={styles.subSectionTitle}>Addresses</Text>
      {addressFields.map((address, addrIndex) => (
        <View key={address.id} style={styles.extensionCard}>
          <View style={styles.rowGroup}>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Address Type</Text>
              <Controller
                control={control}
                name={"customer.addresses." + addrIndex + ".addressType" as any}
                render={({field: {onChange, onBlur, value}}) => (
                  <TextInput
                    editable={!isSubmitting}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="BILLING"
                    placeholderTextColor="#9CA3AF"
                    style={[styles.input]}
                    value={value as string}
                  />
                )}
              />
            </View>

            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Premise</Text>
              <Controller
                control={control}
                name={"customer.addresses." + addrIndex + ".premise" as any}
                render={({field: {onChange, onBlur, value}}) => (
                  <TextInput
                    editable={!isSubmitting}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="CT11"
                    placeholderTextColor="#9CA3AF"
                    style={[styles.input]}
                    value={value as string}
                  />
                )}
              />
            </View>
          </View>

          <View style={styles.rowGroup}>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>City</Text>
              <Controller
                control={control}
                name={"customer.addresses." + addrIndex + ".city" as any}
                render={({field: {onChange, onBlur, value}}) => (
                  <TextInput
                    editable={!isSubmitting}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="hanoi"
                    placeholderTextColor="#9CA3AF"
                    style={[styles.input]}
                    value={value as string}
                  />
                )}
              />
            </View>

            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>County</Text>
              <Controller
                control={control}
                name={"customer.addresses." + addrIndex + ".county" as any}
                render={({field: {onChange, onBlur, value}}) => (
                  <TextInput
                    editable={!isSubmitting}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="hoangmai"
                    placeholderTextColor="#9CA3AF"
                    style={[styles.input]}
                    value={value as string}
                  />
                )}
              />
            </View>
          </View>

          <View style={styles.rowGroup}>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Postcode</Text>
              <Controller
                control={control}
                name={"customer.addresses." + addrIndex + ".postcode" as any}
                render={({field: {onChange, onBlur, value}}) => (
                  <TextInput
                    editable={!isSubmitting}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="1000"
                    placeholderTextColor="#9CA3AF"
                    style={[styles.input]}
                    value={value as string}
                  />
                )}
              />
            </View>

            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Country Code</Text>
              <Controller
                control={control}
                name={"customer.addresses." + addrIndex + ".countryCode" as any}
                render={({field: {onChange, onBlur, value}}) => (
                  <TextInput
                    editable={!isSubmitting}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="VN"
                    placeholderTextColor="#9CA3AF"
                    style={[styles.input]}
                    value={value as string}
                  />
                )}
              />
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => remove(addrIndex)}
            disabled={isSubmitting}
            style={({pressed}) => [styles.removeButton, pressed && styles.buttonPressed]}>
            <Text style={styles.removeButtonText}>Remove Address</Text>
          </Pressable>
        </View>
      ))}

      <Pressable
        accessibilityRole="button"
        onPress={() =>
          append({
            premise: '',
            city: '',
            county: '',
            postcode: '',
            countryCode: '',
            addressType: 'BILLING',
          })
        }
        disabled={isSubmitting}
        style={({pressed}) => [styles.button, (pressed || isSubmitting) && styles.buttonPressed]}>
        <Text style={styles.buttonText}>Add Address</Text>
      </Pressable>
    </View>
  );
}

export function CreateInvoiceScreen({navigation}: Props) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showInvoiceDatePicker, setShowInvoiceDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    formState: {errors, isSubmitting},
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
        contact: {email: 'nguyendung2@101digital.io', mobileNumber: '+6597594971'},
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
      invoiceNumber: 'INV000000001',
      currency: 'GBP',
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      description: 'Invoice is issued to Akila Jayasinghe',
      extensions: [
        {addDeduct: 'ADD', value: 10, type: 'PERCENTAGE', name: 'tax'},
        {addDeduct: 'DEDUCT', value: 10.0, type: 'FIXED_VALUE', name: 'discount'},
      ],
      items: [
        {
          itemReference: 'itemRef',
          description: 'Honda RC150',
          quantity: 1,
          rate: 1000,
          itemName: 'Honda Motor',
          itemUOM: 'KG',
          extensions: [
            {addDeduct: 'ADD', value: 10, type: 'FIXED_VALUE', name: 'tax'},
            {addDeduct: 'DEDUCT', value: 10, type: 'PERCENTAGE', name: 'tax'},
          ],
        },
      ],
    },
    resolver: yupResolver(createInvoiceSchema) as any,
    mode: 'onSubmit',
  });

  const {fields: itemFields, append, remove} = useFieldArray({
    control,
    name: 'items',
  });

  const onSubmit = handleSubmit(async (values: CreateInvoiceFormValues) => {
    setSubmitError(null);

    try {
      // createInvoice expects the invoice payload; our API client will post this shape
      await createInvoice(values as any);
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

                <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bank Account</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Sort Code</Text>
            <Controller
              control={control}
              name="bankAccount.sortCode"
              render={({field: {onChange, onBlur, value}}) => (
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
              render={({field: {onChange, onBlur, value}}) => (
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
              render={({field: {onChange, onBlur, value}}) => (
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
              render={({field: {onChange, onBlur, value}}) => (
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
              render={({field: {onChange, onBlur, value}}) => (
                <TextInput
                  autoCapitalize="words"
                  editable={!isSubmitting}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="First name"
                  placeholderTextColor="#9CA3AF"
                  style={[styles.input, errors.customer?.firstName && styles.inputError]}
                  value={value as string}
                />
              )}
            />
            {errors.customer?.firstName ? (
              <Text style={styles.errorText}>{(errors.customer.firstName as any).message}</Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Last Name</Text>
            <Controller
              control={control}
              name="customer.lastName"
              render={({field: {onChange, onBlur, value}}) => (
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
              render={({field: {onChange, onBlur, value}}) => (
                <TextInput
                  keyboardType="email-address"
                  editable={!isSubmitting}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Email"
                  placeholderTextColor="#9CA3AF"
                  style={[styles.input, errors.customer?.contact?.email && styles.inputError]}
                  value={value as string}
                />
              )}
            />
            {errors.customer?.contact?.email ? (
              <Text style={styles.errorText}>{(errors.customer.contact.email as any).message}</Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Mobile Number</Text>
            <Controller
              control={control}
              name="customer.contact.mobileNumber"
              render={({field: {onChange, onBlur, value}}) => (
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
              render={({field: {onChange, onBlur, value}}) => (
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
              render={({field: {onChange, onBlur, value}}) => (
                <TextInput
                  editable={!isSubmitting}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="INV123"
                  placeholderTextColor="#9CA3AF"
                  style={[styles.input, errors.invoiceNumber && styles.inputError]}
                  value={value as string}
                />
              )}
            />
            {errors.invoiceNumber ? (
              <Text style={styles.errorText}>{errors.invoiceNumber.message}</Text>
            ) : null}
          </View>

          <View style={styles.rowGroup}>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Issue Date</Text>
              <Controller
                control={control}
                name="invoiceDate"
                render={({field: {value}}) => (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setShowInvoiceDatePicker(true)}
                    style={[styles.input, errors.invoiceDate && styles.inputError, styles.dateInputButton]}>
                    <Text
                      style={[
                        styles.dateInputText,
                        (value as string) ? styles.dateInputValue : styles.dateInputPlaceholder,
                      ]}>
                      {(value as string) || 'Select date'}
                    </Text>
                  </Pressable>
                )}
              />
              {errors.invoiceDate ? (
                <Text style={styles.errorText}>{errors.invoiceDate.message}</Text>
              ) : null}
            </View>

            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Due Date</Text>
              <Controller
                control={control}
                name="dueDate"
                render={({field: {value}}) => (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setShowDueDatePicker(true)}
                    style={[styles.input, errors.dueDate && styles.inputError, styles.dateInputButton]}>
                    <Text
                      style={[
                        styles.dateInputText,
                        (value as string) ? styles.dateInputValue : styles.dateInputPlaceholder,
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
              render={({field: {onChange, onBlur, value}}) => (
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
              render={({field: {onChange, onBlur, value}}) => (
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
                  name={"items." + index + ".description" as any}
                  render={({field: {onChange, onBlur, value}}) => (
                    <TextInput
                      editable={!isSubmitting}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      placeholder="Item description"
                      placeholderTextColor="#9CA3AF"
                      style={[styles.input, errors.items?.[index]?.description && styles.inputError]}
                      value={value as string}
                    />
                  )}
                />
                {errors.items?.[index]?.description ? (
                  <Text style={styles.errorText}>{(errors.items[index].description as any).message}</Text>
                ) : null}
              </View>

              <View style={styles.rowGroup}>
                <View style={[styles.fieldGroup, styles.halfField]}>
                  <Text style={styles.label}>Quantity</Text>
                  <Controller
                    control={control}
                    name={"items." + index + ".quantity" as any}
                    render={({field: {onChange, onBlur, value}}) => (
                      <TextInput
                        keyboardType="numeric"
                        editable={!isSubmitting}
                        onBlur={onBlur}
                        onChangeText={text => onChange(Number(text))}
                        placeholder="1"
                        placeholderTextColor="#9CA3AF"
                        style={[styles.input, errors.items?.[index]?.quantity && styles.inputError]}
                        value={value !== undefined ? String(value) : ''}
                      />
                    )}
                  />
                  {errors.items?.[index]?.quantity ? (
                    <Text style={styles.errorText}>{(errors.items[index].quantity as any).message}</Text>
                  ) : null}
                </View>

                <View style={[styles.fieldGroup, styles.halfField]}>
                  <Text style={styles.label}>Rate</Text>
                  <Controller
                    control={control}
                    name={"items." + index + ".rate" as any}
                    render={({field: {onChange, onBlur, value}}) => (
                      <TextInput
                        keyboardType="numeric"
                        editable={!isSubmitting}
                        onBlur={onBlur}
                        onChangeText={text => onChange(Number(text))}
                        placeholder="1000"
                        placeholderTextColor="#9CA3AF"
                        style={[styles.input, errors.items?.[index]?.rate && styles.inputError]}
                        value={value !== undefined ? String(value) : ''}
                      />
                    )}
                  />
                  {errors.items?.[index]?.rate ? (
                    <Text style={styles.errorText}>{(errors.items[index].rate as any).message}</Text>
                  ) : null}
                </View>
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
            style={({pressed}) => [styles.button, (pressed || isSubmitting) && styles.buttonPressed]}>
            <Text style={styles.buttonText}>Add Item</Text>
          </Pressable>
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
  itemCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  removeButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F87171',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  subSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  extensionCard: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  dateInputButton: {
    justifyContent: 'center',
  },
  dateInputText: {
    fontSize: 16,
    color: '#111827',
  },
  dateInputValue: {
    color: '#111827',
  },
  dateInputPlaceholder: {
    color: '#9CA3AF',
  },
  pickerTextColor: {
    color: '#111827',
  },
  pickerTextPlaceholder: {
    color: '#9CA3AF',
  },
});
