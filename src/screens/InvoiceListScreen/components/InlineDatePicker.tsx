import React from 'react';
import DatePicker from 'react-native-date-picker';

export function InlineDatePicker({
  visible,
  value,
  onChange,
}: {
  visible: boolean;
  value: Date;
  onChange: (event: any, date?: Date) => void;
}) {
  if (!visible) return null;
  return (
    <DatePicker
      modal
      open={visible}
      date={value}
      mode="date"
      onConfirm={d => onChange({}, d)}
      onCancel={() => onChange({}, undefined)}
    />
  );
}
