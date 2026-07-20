import React from 'react';
import DatePicker from 'react-native-date-picker';

export function InvoiceDatePicker({
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
