import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import PickerModalView from 'react-native-picker-modal-view';
import { Controller, useFieldArray, type Control } from 'react-hook-form';

import { type CreateInvoiceFormValues } from '../../../validation/invoiceSchema';
import { styles } from '../styles';

export function ItemExtensions({
  control,
  itemIndex,
  isSubmitting,
}: {
  control: Control<CreateInvoiceFormValues>;
  itemIndex: number;
  isSubmitting: boolean;
}) {
  const {
    fields: extensionFields,
    append,
    remove,
  } = useFieldArray({
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
                name={
                  ('items.' +
                    itemIndex +
                    '.extensions.' +
                    extIndex +
                    '.name') as any
                }
                render={({ field: { onChange, onBlur, value } }) => (
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
                name={
                  ('items.' +
                    itemIndex +
                    '.extensions.' +
                    extIndex +
                    '.value') as any
                }
                render={({ field: { onChange, onBlur, value } }) => (
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
                name={
                  ('items.' +
                    itemIndex +
                    '.extensions.' +
                    extIndex +
                    '.type') as any
                }
                render={({ field: { onChange, value } }) => (
                  <PickerModalView
                    renderSelectView={(
                      disabled: boolean,
                      selected: any,
                      showModal: () => void,
                    ) => (
                      <Pressable
                        onPress={showModal}
                        disabled={disabled}
                        style={[styles.input, styles.dateInputButton]}>
                        <Text
                          style={[
                            styles.dateInputText,
                            selected?.Name
                              ? styles.pickerTextColor
                              : styles.pickerTextPlaceholder,
                          ]}>
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
                    items={[
                      {
                        Id: 'PERCENTAGE',
                        Name: 'PERCENTAGE',
                        Value: 'PERCENTAGE',
                      },
                      {
                        Id: 'FIXED_VALUE',
                        Name: 'FIXED_VALUE',
                        Value: 'FIXED_VALUE',
                      },
                    ]}
                    selected={{ Id: value, Name: value, Value: value }}
                  />
                )}
              />
            </View>

            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Add/Deduct</Text>
              <Controller
                control={control}
                name={
                  ('items.' +
                    itemIndex +
                    '.extensions.' +
                    extIndex +
                    '.addDeduct') as any
                }
                render={({ field: { onChange, value } }) => (
                  <PickerModalView
                    renderSelectView={(
                      disabled: boolean,
                      selected: any,
                      showModal: () => void,
                    ) => (
                      <Pressable
                        onPress={showModal}
                        disabled={disabled}
                        style={[styles.input, styles.dateInputButton]}>
                        <Text
                          style={[
                            styles.dateInputText,
                            selected?.Name
                              ? styles.pickerTextColor
                              : styles.pickerTextPlaceholder,
                          ]}>
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
                    items={[
                      { Id: 'ADD', Name: 'ADD', Value: 'ADD' },
                      { Id: 'DEDUCT', Name: 'DEDUCT', Value: 'DEDUCT' },
                    ]}
                    selected={{ Id: value, Name: value, Value: value }}
                  />
                )}
              />
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => remove(extIndex)}
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.removeButton,
              pressed && styles.buttonPressed,
            ]}>
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
        style={({ pressed }) => [
          styles.button,
          (pressed || isSubmitting) && styles.buttonPressed,
        ]}>
        <Text style={styles.buttonText}>Add Extension</Text>
      </Pressable>
    </View>
  );
}
