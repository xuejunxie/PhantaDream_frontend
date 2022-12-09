import React, {useEffect, useState} from 'react';
import {
  View,
  ScrollView,
  Keyboard,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {TextInput} from 'react-native-paper';

import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {Neomorph} from 'react-native-neomorph-shadows';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import COLORS from '../GlobalValues/Colors';
import axios from 'axios';
import {Buffer} from 'buffer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getStatusBarHeight} from 'react-native-status-bar-height';
const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const loading_image = 'https://i.gifer.com/1amw.gif';

const canvasSize = 350;
const tabBarHeight = 29;

export default function Dream() {
  const [prompt, setPrompt] = React.useState('');
  const [imageURI, setImageURI] = useState(
    'https://www.canvaschamp.com/static/images/landingpage/blankprestretchedcanvas/streach-choice.jpg',
  );
  const [loading, setLoading] = useState(false);

  const navBarHeight =
    getStatusBarHeight(Platform.OS === 'ios' ? false : true) + tabBarHeight;
  const [verticalOffest, setVerticalOffset] = useState(navBarHeight);

  // load the image from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem('01').then(value => {
      if (value !== null) {
        setImageURI(`data:image/png;base64,${value}`);
      }
    });
  }, []);

  // dynamically adjust vertical offset of keyboard avoiding view
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setVerticalOffset(0);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setVerticalOffset(navBarHeight);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // send prompt to server
  const dreamButton = async () => {
    axios
      .post(
        'http://phantaspace.ddns.net:7863/txt2img',
        {prompt: prompt},
        {responseType: 'arraybuffer'},
      )
      .then(function (response) {
        const image_data = Buffer.from(response.data, 'binary').toString(
          'base64',
        );
        setImageURI(`data:image/png;base64,${image_data}`);
        setLoading(false);
        setPrompt('');
        // save the image locally with AsyncStorage
        AsyncStorage.setItem('01', image_data);
      });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={verticalOffest}
      style={{
        backgroundColor: COLORS.primary,
        flex: 1,
      }}>
      <View
        style={{
          height: '100%',
          justifyContent: 'flex-end',
        }}>
        <ScrollView style={{}}>
          <View
            style={{
              backgroundColor: 'rgba(0,0,0,0)',
              marginTop: 30,

              // make it center
              alignItems: 'center',
            }}>
            <Neomorph
              style={{
                shadowRadius: 10,
                borderRadius: 25,
                backgroundColor: COLORS.primary,
                width: canvasSize,
                height: canvasSize,
                marginTop: 20,
              }}>
              <Image
                source={{
                  uri: loading ? loading_image : imageURI,
                }}
                style={{
                  width: canvasSize,
                  height: canvasSize,

                  borderRadius: 25,
                }}></Image>
            </Neomorph>
          </View>
        </ScrollView>
        <View>
          <TextInput
            multiline={true}
            onChangeText={text => setPrompt(text)}
            value={prompt}
            style={{
              backgroundColor: 'rgba(0,0,0,0)',
              // align text to center
              textAlign: 'center',
            }}
            placeholder="🤯 Tap here to write down your dream "
            returnKeyType="send"
            numberOfLines={1}
            blurOnSubmit={true}
            onSubmitEditing={() => {
              setPressed(true);
              setLoading(true);
              //haptic feedback
              ReactNativeHapticFeedback.trigger('impactMedium', options);
              dreamButton();
            }}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
