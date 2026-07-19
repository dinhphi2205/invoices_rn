import React from 'react';
import {Text} from 'react-native';

interface LogoutIconProps {
  size?: number;
  color?: string;
}

export function LogoutIcon({size = 24, color = '#111827'}: LogoutIconProps) {
  return (
    <Text
      style={{
        fontSize: size,
        color,
        fontWeight: '600',
      }}>
      ↪
    </Text>
  );
}
