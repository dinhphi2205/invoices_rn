import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Controller, useFieldArray, type Control } from 'react-hook-form';

import { type CreateInvoiceFormValues } from '../../../validation/invoiceSchema';
import { styles } from '../styles';

export function CustomerAddresses({
  control,
  isSubmitting,
}: {
  control: Control<CreateInvoiceFormValues>;
  isSubmitting: boolean;
}) {
  const {
    fields: addressFields,
    append,
    remove,
  } = useFieldArray({
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
                name={
                  ('customer.addresses.' + addrIndex + '.addressType') as any
                }
                render={({ field: { onChange, onBlur, value } }) => (
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
                name={('customer.addresses.' + addrIndex + '.premise') as any}
                render={({ field: { onChange, onBlur, value } }) => (
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
                name={('customer.addresses.' + addrIndex + '.city') as any}
                render={({ field: { onChange, onBlur, value } }) => (
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
                name={('customer.addresses.' + addrIndex + '.county') as any}
                render={({ field: { onChange, onBlur, value } }) => (
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
                name={('customer.addresses.' + addrIndex + '.postcode') as any}
                render={({ field: { onChange, onBlur, value } }) => (
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
                name={
                  ('customer.addresses.' + addrIndex + '.countryCode') as any
                }
                render={({ field: { onChange, onBlur, value } }) => (
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
            style={({ pressed }) => [
              styles.removeButton,
              pressed && styles.buttonPressed,
            ]}>
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
        style={({ pressed }) => [
          styles.button,
          (pressed || isSubmitting) && styles.buttonPressed,
        ]}>
        <Text style={styles.buttonText}>Add Address</Text>
      </Pressable>
    </View>
  );
}
