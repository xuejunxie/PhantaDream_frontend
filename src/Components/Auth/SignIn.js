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
  Alert,
} from 'react-native';
import {COLORS, defaultAvatar} from '../common/globalValues';

import auth from '@react-native-firebase/auth';
import {
  appleAuth,
  AppleButton,
} from '@invertase/react-native-apple-authentication';
import firestore from '@react-native-firebase/firestore';
import realtime from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';
import {UPDATE_USER} from '../../redux/types';

const newUserCharge = 20;
const newUserHeart = 20;

export default function SignIn({navigation}) {
  const [pressed, setPressed] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const dispatch = useDispatch();
  // const storeTokens = async (identityToken, nonce) => {
  //   try {
  //     await AsyncStorage.setItem('auth_identityToken', identityToken);
  //     await AsyncStorage.setItem('auth_nonce', nonce);
  //   } catch (e) {
  //     console.log('Error storing tokens:', e);
  //   }
  // };

  // // sign in with stored tokens
  // const signInWithStoredTokens = async () => {
  //   try {
  //     const identityToken = await AsyncStorage.getItem('auth_identityToken');
  //     const nonce = await AsyncStorage.getItem('auth_nonce');
  //     if (identityToken && nonce) {
  //       const appleCredential = auth.AppleAuthProvider.credential(
  //         identityToken,
  //         nonce,
  //       );
  //       // Sign in with stored tokens
  //       auth()
  //         .signInWithCredential(appleCredential)
  //         .then(res => {
  //           navigation.navigate('Home');
  //         });
  //     }
  //   } catch (e) {
  //     console.log('Error signing in with stored tokens:', e);
  //   }
  // };
  // useEffect(() => {
  //   // check if user is already signed in
  //   const user = auth().currentUser;
  //   if (user) {
  //     navigation.navigate('Home');
  //   } else {
  //     signInWithStoredTokens();
  //   }
  // }, []);

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
    // storeTokens(identityToken, nonce);
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
          var userName = appleAuthRequestResponse.fullName;
          if (userName == null) {
            userName = {
              familyName: 'Joe',
              givenName: 'Average',
            };
          }
          // check the user name is Chinese
          const inChinese = /[\u4e00-\u9fa5]/.test(userName.givenName);

          const userData = {
            email: appleAuthRequestResponse.email,
            fullName: userName,
            charge: newUserCharge,
            heart: newUserHeart,
            avatar: defaultAvatar,
            artName: inChinese
              ? userName.familyName + ' ' + userName.givenName
              : userName.givenName + ' ' + userName.familyName,
            handleName: {
              name: inChinese
                ? userName.familyName + userName.givenName
                : userName.givenName +
                  userName.familyName +
                  Math.floor(Math.random() * 10000),
              time: 0,
            },
          };

          dispatch({type: UPDATE_USER, payload: userData});

          realtime()
            .ref('/users/' + user.uid)
            .set(userData);
        } else {
          // get the user data from the database
          realtime()
            .ref('/users/' + user.uid)
            .once('value')
            .then(snapshot => {
              const userData = snapshot.val();
              dispatch({type: UPDATE_USER, payload: userData});
              if (userData.active == false) {
                Alert.alert(
                  'Your account has been deactivated',
                  'Do you want to reactivate your account?',
                  [
                    {
                      text: 'Cancel',
                      onPress: () => {
                        auth().signOut();
                      },
                    },
                    {
                      text: 'OK',
                      onPress: () => {
                        realtime()
                          .ref('users/' + user.uid)
                          .update({active: true});
                      },
                    },
                  ],
                  {cancelable: false},
                );
              }
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
        {/* <TouchableWithoutFeedback
          onPressIn={() => {
            setPressed(true);
            ReactNativeHapticFeedback.trigger('impactMedium', options);
            signInButton();
          }}
          onPressOut={() => setPressed(false)}>
          <Neomorph
            inner={pressed}
            style={{
              shadowRadius: 5,
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
          </Neomorph> */}
        {/* </TouchableWithoutFeedback> */}

        <AppleButton
          buttonStyle={AppleButton.Style.WHITE}
          buttonType={AppleButton.Type.SIGN_IN}
          style={{
            width: 200, // You must specify a width
            height: 45, // You must specify a height
            marginTop: 20,
          }}
          onPress={() => {
            ReactNativeHapticFeedback.trigger('impactMedium', options);
            signInButton();
          }}
        />
      </View>
      <View
        style={{
          height: 100,
        }}
      />
    </View>
  );
}
