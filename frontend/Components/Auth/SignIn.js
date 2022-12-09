import React, {useState} from 'react';

import {StackScreenProps} from '@react-navigation/stack';
import {Neomorph} from 'react-native-neomorph-shadows';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};
import {
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  Text,
  View,
} from 'react-native';
import COLORS from '../GlobalValues/Colors';

export default function SignIn({navigation}) {
  const [pressed, setPressed] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  async function signInButton() {}

  return (
    <View
      style={{
        backgroundColor: COLORS.primary,
        justifyContent: 'flex-end',
      }}>
      <View
        style={{
          marginTop: 20,
          backgroundColor: 'rgba(0,0,0,0)',
        }}>
        <TextInput
          multiline={true}
          onChangeText={text => setPhoneNumber(text)}
          value={phoneNumber}
          style={{
            backgroundColor: 'rgba(0,0,0,0)',
            // align text to center
            textAlign: 'center',
          }}
          placeholder="Type in your phone Number to sign in"
        />
      </View>

      <View
        style={{
          backgroundColor: 'rgba(0,0,0,0)',
          marginTop: 20,

          // make it center
          alignItems: 'center',
        }}>
        <TouchableWithoutFeedback
          onPressIn={() => {
            setPressed(true);
            ReactNativeHapticFeedback.trigger('impactMedium', options);
            signInButton();
          }}
          onPressOut={() => setPressed(false)}>
          <Neomorph
            inner={pressed}
            style={{
              shadowRadius: 10,
              borderRadius: 25,
              backgroundColor: COLORS.primary,
              width: 200,
              height: 50,
              marginTop: 20,
            }}>
            <Text
              style={{
                fontSize: 20,
                color: 'black',
                textAlign: 'center',
                marginTop: 10,
              }}>
              Sign In
            </Text>
          </Neomorph>
        </TouchableWithoutFeedback>
      </View>
      <View
        style={{
          height: 100,
        }}
      />
    </View>
  );
}
