import React, {useEffect, useState} from 'react';

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
import {COLORS} from '../common/globalValues';

import auth from '@react-native-firebase/auth';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import firestore from '@react-native-firebase/firestore';
import realtime from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const newUserCharge = 20;
const newUserHeart = 20;

export default function SignIn({navigation}) {
  const [pressed, setPressed] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const storeTokens = async (identityToken, nonce) => {
    try {
      await AsyncStorage.setItem('auth_identityToken', identityToken);
      await AsyncStorage.setItem('auth_nonce', nonce);
    } catch (e) {
      console.log('Error storing tokens:', e);
    }
  };

  // sign in with stored tokens
  const signInWithStoredTokens = async () => {
    try {
      const identityToken = await AsyncStorage.getItem('auth_identityToken');
      const nonce = await AsyncStorage.getItem('auth_nonce');
      console.log(identityToken, nonce);
      if (identityToken && nonce) {
        const appleCredential = auth.AppleAuthProvider.credential(
          identityToken,
          nonce,
        );
        // Sign in with stored tokens
        auth()
          .signInWithCredential(appleCredential)
          .then(res => {
            navigation.navigate('Home');
          });
      }
    } catch (e) {
      console.log('Error signing in with stored tokens:', e);
    }
  };
  useEffect(() => {
    // check if user is already signed in
    const user = auth().currentUser;
    if (user) {
      navigation.navigate('Home');
    } else {
      signInWithStoredTokens();
    }
  }, []);

  async function signInButton() {
    // Start the sign-in request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    // Ensure Apple returned a user identityToken
    if (!appleAuthRequestResponse.identityToken) {
      throw new Error('Apple Sign-In failed - no identify token returned');
    }

    // Create a Firebase credential from the response
    const {identityToken, nonce} = appleAuthRequestResponse;
    storeTokens(identityToken, nonce);
    const appleCredential = auth.AppleAuthProvider.credential(
      identityToken,
      nonce,
    );

    // Sign the user in with the credential
    auth()
      .signInWithCredential(appleCredential)
      .then(res => {
        const user = res.user;
        if (res.additionalUserInfo.isNewUser) {
          // create a new user data entry in the database
          realtime()
            .ref('/users/' + user.uid)
            .set({
              email: appleAuthRequestResponse.email,
              fullName: appleAuthRequestResponse.fullName,
              charge: newUserCharge,
              heart: newUserHeart,
            });
        }
        navigation.navigate('Home');
      });
  }

  return (
    <View
      style={{
        backgroundColor: COLORS.primary,
        justifyContent: 'flex-end',
        width: '100%',
        height: '100%',
      }}>
      <View
        style={{
          backgroundColor: 'rgba(0,0,0,0)',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 100,
        }}>
        <Image
          source={require('./logo.png')}
          style={{
            width: 200,
            height: 200,
          }}
        />
        <Text
          style={{
            fontSize: 30,
            color: 'gray',
            textAlign: 'center',
            marginTop: 20,
          }}>
          Welcome to
        </Text>
        <Text
          style={{
            fontSize: 30,
            color: 'gray',
            textAlign: 'center',
            marginTop: 10,
          }}>
          PhantaDream
        </Text>
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
                color: 'gray',
                textAlign: 'center',
                marginTop: 10,
              }}>
              Sign In with Apple
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
