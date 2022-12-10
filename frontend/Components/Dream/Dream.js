import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
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

import uuid from 'react-native-uuid';

const loading_image = 'https://i.gifer.com/1amw.gif';
const empty_image =
  'https://www.canvaschamp.com/static/images/landingpage/blankprestretchedcanvas/streach-choice.jpg';

const canvasSize = 300;
const tabBarHeight = 29;

export default function Dream() {
  const [prompt, setPrompt] = React.useState('');

  const [TweakButtonPressed, setTweakButtonPressed] = useState(false);
  const [saveButtonPressed, setSaveButtonPressed] = useState(false);
  const [shareButtonPressed, setShareButtonPressed] = useState(false);
  const [showActionButtons, setShowActionButtons] = useState(false);
  const scrollViewRef = useRef();

  const navBarHeight =
    getStatusBarHeight(Platform.OS === 'ios' ? false : true) + tabBarHeight;
  const [verticalOffest, setVerticalOffset] = useState(navBarHeight);

  // load all the image from AsyncStorage
  const [images, setImages] = useState([]);

  // image object fields:
  // id: imageId same as the key
  // image: image_file (base64) in string
  // prompt: prompt
  // date: date
  // loading: boolean
  //

  const loadImages = async () => {
    const keys = await AsyncStorage.getAllKeys();
    if (keys.length === 0) {
      setImages([
        {
          id: 'empty',
          image: empty_image,
          prompt: '',
          date: new Date(),
          loading: false,
        },
      ]);
    } else {
      const result = await AsyncStorage.multiGet(keys);
      const parsedResult = result.map((item, index) => {
        const imageId = item[0];
        const image = JSON.parse(item[1]);
        return image;
      });
      const sourtedResult = parsedResult.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });
      setImages(sourtedResult);
    }
  };

  useEffect(() => {
    loadImages();
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

  const beforeDreamButton = () => {
    // check if the first image is empty
    if (images[0].id === 'empty') {
      // set the first image to loading
      const newImages = images;
      newImages[0].loading = true;
      setImages(newImages);
      // force update the view
    } else {
      // add a new image with loading
      const newImages = images;
      newImages.push({
        id: 'loading',
        image: loading_image,
        prompt: '',
        date: new Date(),
        loading: true,
      });
      setImages(newImages);
    }
  };

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
        const image_file = `data:image/png;base64,${image_data}`;
        setShowActionButtons(true);
        setPrompt('');
        // save the image locally with AsyncStorage
        const imageId = uuid.v1();
        const image_entry = {
          id: imageId,
          image: image_file,
          prompt: prompt,
          date: new Date(),
          loading: false,
        };
        AsyncStorage.setItem(imageId, JSON.stringify(image_entry));
        // replace the last image with the new image
        const newImages = images;
        newImages.pop();
        newImages.push(image_entry);
        setImages(newImages);
      });
  };
  // buttom press components
  const operations = (press, setPress, name) => {
    return (
      <View>
        <TouchableWithoutFeedback
          onPressIn={() => {
            setPress(true);
            ReactNativeHapticFeedback.trigger('impactMedium', options);
          }}
          onPressOut={() => setPress(false)}>
          <Neomorph
            inner={press}
            style={{
              shadowRadius: 10,
              borderRadius: 25,
              backgroundColor: COLORS.primary,
              width: 100,
              height: 40,
            }}>
            <Text
              style={{
                fontSize: 20,
                color: 'gray',
                textAlign: 'center',
                marginTop: 7,
              }}>
              {name}
            </Text>
          </Neomorph>
        </TouchableWithoutFeedback>
      </View>
    );
  };

  const actions = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          marginTop: 20,
        }}>
        {operations(TweakButtonPressed, setTweakButtonPressed, 'Tweak')}
        {operations(saveButtonPressed, setSaveButtonPressed, 'Save')}
        {operations(shareButtonPressed, setShareButtonPressed, 'Share')}
      </View>
    );
  };

  const imageView = (isLoading, URI, index) => {
    return (
      <View
        key={index}
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
              uri: isLoading ? loading_image : URI,
            }}
            style={{
              width: canvasSize,
              height: canvasSize,

              borderRadius: 25,
            }}></Image>
        </Neomorph>
      </View>
    );
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
        <ScrollView
          ref={scrollViewRef}
          onContentSizeChange={() =>
            scrollViewRef.current.scrollToEnd({animated: true})
          }>
          {images.map((item, index) => {
            return imageView(item.loading, item.image, item.id);
          })}

          {showActionButtons ? actions() : null}
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
              setShowActionButtons(false);
              //haptic feedback
              ReactNativeHapticFeedback.trigger('impactMedium', options);
              beforeDreamButton();
              dreamButton();
            }}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
