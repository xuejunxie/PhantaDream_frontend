import React from 'react';
import {
  Button as RNButton,
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';

import {borderRadius, colors} from '../utils';
import {Neomorph} from 'react-native-neomorph-shadows';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {COLORS} from '../../common/globalValues';
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};
interface ButtonProps {
  title: string;

  onPress(): void;
}

export const Button = ({title, onPress}: ButtonProps) => {
  const [press, setPress] = React.useState(false);

  return (
    <View
      style={{
        margin: 10,
      }}>
      <TouchableWithoutFeedback
        onPressIn={() => {
          setPress(true);
          ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
          onPress();
        }}
        onPressOut={() => setPress(false)}>
        <Neomorph
          inner={press}
          style={{
            shadowRadius: 5,
            borderRadius: 25,
            backgroundColor: COLORS.primary,
            width: 100,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text>{title}</Text>
        </Neomorph>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.gray100,
    borderRadius: borderRadius - 2,
    width: '20%',
  },
});
