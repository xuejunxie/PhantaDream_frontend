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
import storage from '@react-native-firebase/storage';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';
import {UPDATE_USER} from '../../redux/types';
import axios from 'axios';

const newUserCharge = 100;
const newUserHeart = 100;
const serverURL = 'http://phantaspace.ddns.net:7865/sdapi/v1/';

const storageRef = storage().ref();

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

  // generate avatar, and store it in the database, add it to the user data
  // const generate_avatar = (username) => {
  //   axios
  //     .post(serverURL + 'txt2img', {
  //       prompt: username,
  //       steps: 20,
  //       width: 768,
  //       height: 768,
  //       cfg_scale: 7,
  //       seed: seed,
  //     })
  //     .then(res => {
  //       const avatar = res.data.image[0];
  //       // upload the avatar to the storage
  //       const storageRef = storage().ref();
  //       const reference = storage().ref(
  //         `/users/${auth().currentUser.uid}/avatar`,
  //       );
  //       const task = reference.putFile(avatar);

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
            avatar: '',
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

          // generate avatar, and store it in the database, add it to the user data
          axios
            .post(serverURL + 'txt2img', {
              prompt: userName.familyName + ' ' + userName.givenName,
              steps: 20,
              width: 768,
              height: 768,
              cfg_scale: 7,
            })
            .then(res => {
              const avatar = `data:image/png;base64,${res.data.images[0]}`;

              const imageRef = storageRef.child(
                'users/' + user.uid + '/avatar',
              );
              imageRef.putString(avatar, 'data_url').then(() => {
                imageRef.getDownloadURL().then(url => {
                  realtime()
                    .ref(`/users/${user.uid}/avatar`)
                    .set(url)
                    .catch(e => console.log(e));
                });
              });
            })
            .catch(e => {
              console.log(e);
            });
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
