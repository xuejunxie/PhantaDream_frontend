import {View, Text, TouchableWithoutFeedback} from 'react-native';
import React from 'react';
import {Neomorph} from 'react-native-neomorph-shadows';
import {COLORS} from './globalValues';

export default function NeomorphicButton({children, style, ...props}) {
  return (
    <TouchableWithoutFeedback {...props}>
      <Neomorph
        inner={false}
        swapShadows
        style={{
          shadowRadius: 3,
          borderRadius: 20,
          backgroundColor: COLORS.primary,
          ...style,
        }}>
        {children}
      </Neomorph>
    </TouchableWithoutFeedback>
  );
}
