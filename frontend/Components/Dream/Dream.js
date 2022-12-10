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
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faEdit,
  faDownload,
  faShare,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';

const loading_image = 'https://i.gifer.com/1amw.gif';
const empty_image =
  'https://www.canvaschamp.com/static/images/landingpage/blankprestretchedcanvas/streach-choice.jpg';

const canvasSize = 300;
const tabBarHeight = 29;

export default function Dream() {
  const [prompt, setPrompt] = React.useState('');

  const [editButtonPressed, setEditButtonPressed] = useState(false);
  const [saveButtonPressed, setSaveButtonPressed] = useState(false);
  const [shareButtonPressed, setShareButtonPressed] = useState(false);
  const [deleteButtonPressed, setDeleteButtonPressed] = useState(false);
  const [pickedImage, setPickedImage] = useState(null); // pickedImage = image object when user pick an image from the gallery

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
          selected: false,
        },
      ]);
    } else {
      const result = await AsyncStorage.multiGet(keys);
      const parsedResult = result.map((item, index) => {
        const imageId = item[0];
        const image = JSON.parse(item[1]);
        image.loading = false;
        image.selected = false;
        return image;
      });
      const sourtedResult = parsedResult.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });
      setImages(sourtedResult);
    }
  };

  useEffect(() => {
    // AsyncStorage.clear();
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

  const send = async () => {
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
        setPrompt('');
        // save the image locally with AsyncStorage
        if (pickedImage === null) {
          const imageId = uuid.v1();
          const image_entry = {
            id: imageId,
            image: image_file,
            prompt: prompt,
            date: new Date(),
          };
          AsyncStorage.setItem(imageId, JSON.stringify(image_entry));
          // replace the last image with the new image
          image_entry.loading = false;
          image_entry.selected = true;
          if (images[0].id === 'empty') {
            setImages([image_entry]);
          } else {
            setImages([...images, image_entry]);
          }
        } else {
          const image_entry = {
            id: pickedImage.id,
            image: image_file,
            prompt: prompt,
            date: pickedImage.date,
          };
          AsyncStorage.setItem(pickedImage.id, JSON.stringify(image_entry));
          // replace the last image with the new image
          image_entry.loading = false;
          image_entry.selected = true;

          setImages(
            images.map(image => {
              if (image.id === pickedImage.id) {
                return image_entry;
              } else {
                return image;
              }
            }),
          );
        }
      });
  };
  // buttom press components
  const operations = (press, setPress, icon) => {
    return (
      <View
        style={{
          margin: 10,
        }}>
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
              width: 60,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {icon}
          </Neomorph>
        </TouchableWithoutFeedback>
      </View>
    );
  };

  const renderIcon = name => {
    return <FontAwesomeIcon icon={name} size={20} color={'gray'} />;
  };

  const actions = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-evenly',
        }}>
        {operations(
          editButtonPressed,
          setEditButtonPressed,
          renderIcon(faEdit),
        )}
        {operations(
          saveButtonPressed,
          setSaveButtonPressed,
          renderIcon(faDownload),
        )}
        {operations(
          shareButtonPressed,
          setShareButtonPressed,
          renderIcon(faShare),
        )}
        {operations(
          deleteButtonPressed,
          setDeleteButtonPressed,
          renderIcon(faTrash),
        )}
      </View>
    );
  };

  useEffect(() => {
    if (editButtonPressed) {
      if (pickedImage) {
        setPrompt(pickedImage.prompt);
      }
    }
  }, [editButtonPressed]);

  const imageView = item => {
    return (
      <View
        key={item.id}
        style={{
          backgroundColor: 'rgba(0,0,0,0)',
          marginTop: 30,

          // make it center
          alignItems: 'center',
        }}>
        <TouchableWithoutFeedback
          onPress={() => {
            ReactNativeHapticFeedback.trigger('impactMedium', options);

            setImages(
              images.map(image => {
                if (image.id === item.id) {
                  image.selected = !image.selected;
                  if (image.selected) {
                    setPickedImage(image);
                  } else {
                    setPickedImage(null);
                  }
                } else {
                  image.selected = false;
                }
                return image;
              }),
            );
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
                uri: item.loading ? loading_image : item.image,
              }}
              style={{
                width: canvasSize,
                height: canvasSize,

                borderRadius: 25,
              }}></Image>
          </Neomorph>
        </TouchableWithoutFeedback>

        {item.selected ? (
          <Text style={{color: 'gray', fontSize: 15, marginTop: 10}}>
            {item.prompt}
          </Text>
        ) : null}
        {item.selected ? actions() : null}
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
          onContentSizeChange={() => {
            if (pickedImage === null) {
              scrollViewRef.current.scrollToEnd({animated: true});
            } else {
              if (pickedImage.id === images[images.length - 1].id) {
                scrollViewRef.current.scrollToEnd({animated: true});
              }
            }
          }}>
          {images.map((item, index) => {
            return imageView(item);
          })}
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
              //haptic feedback
              ReactNativeHapticFeedback.trigger('impactMedium', options);

              if (images[0].id === 'empty') {
                // set the first image to loading
                setImages([
                  {
                    id: 'empty',
                    image: loading_image,
                    prompt: '',
                    date: new Date(),
                    loading: true,
                    selected: false,
                  },
                ]);
                // force update the view
              } else {
                // add a new image with loading

                if (pickedImage === null) {
                  setImages([
                    ...images.map(item => {
                      item.selected = false;
                      return item;
                    }),
                    {
                      id: 'loading',
                      image: loading_image,
                      prompt: '',
                      date: new Date(),
                      loading: true,
                      selected: false,
                    },
                  ]);
                } else {
                  setImages([
                    images.map(image => {
                      if (image.id === pickedImage.id) {
                        image.image = loading_image;
                        return image;
                      } else {
                        return image;
                      }
                    }),
                  ]);
                }
              }

              send();
            }}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
