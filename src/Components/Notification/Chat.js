import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  scrollView,
  Alert,
  Modal,
  Keyboard,
} from 'react-native';
import {Neomorph, NeomorphFlex} from 'react-native-neomorph-shadows';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faChevronLeft, faUserCircle} from '@fortawesome/free-solid-svg-icons';
import {useSelector} from 'react-redux';
import {COLORS, SIZES, defaultAvatar, serverURL} from '../common/globalValues';
import {ScrollView} from 'react-native-gesture-handler';
import realtime from '@react-native-firebase/database';
import {Avatar} from '@rneui/themed';
import {CachedImage} from '@georstat/react-native-image-cache';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import uuid from 'react-native-uuid';
import storage from '@react-native-firebase/storage';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {
  faBolt,
  faCopy,
  faDownload,
  faShare,
  faTimes,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import ImageOperator from './ImageOperator';
import ShareModal from './ShareModal';

const ChatUI = ({route, navigation}) => {
  const {name, avatar, id, type} = route.params;
  const messages = useSelector(state => state.user?.data?.messages)?.[id];
  const myAvatar = useSelector(state => state.user?.data?.avatar);
  const [inputText, setInputText] = useState(''); //initial text of TextInput
  const scrollViewRef = useRef();

  useEffect(() => {
    scrollViewRef.current.scrollToEnd({animated: true});
  }, []);

  const sendMessage = () => {
    realtime()
      .ref(
        `/users/${id}/messages/${
          auth().currentUser.uid
        }/${new Date().getTime()}/`,
      )
      .set({
        message: inputText,
        timestamp: new Date().getTime(),
        read: false,
        send: false,
      });
    realtime()
      .ref(
        `/users/${
          auth().currentUser.uid
        }/messages/${id}/${new Date().getTime()}/`,
      )
      .set({
        message: inputText,
        timestamp: new Date().getTime(),
        read: true,
        send: true,
      });
    setInputText('');
  };

  const [latestImage, setLatestImage] = useState(null);

  const spendCharge = () => {
    realtime()
      .ref('/users/' + auth().currentUser.uid)
      .update({
        charge: realtime.ServerValue.increment(-1),
      });
  };

  const generateArtWork = artistName => {
    const currentTime = new Date().getTime();

    realtime()
      .ref(
        `/users/${
          auth().currentUser.uid
        }/messages/${artistName}/${currentTime}/`,
      )
      .set({
        message: inputText,
        timestamp: currentTime,
        type: 'new art work request',
        read: true,
        send: true,
      });

    scrollViewRef.current.scrollToEnd({animated: true});

    realtime()
      .ref(
        `/users/${auth().currentUser.uid}/messages/${artistName}/${
          currentTime + 1
        }/`,
      )
      .set({
        message: 'generating art work...',
        timestamp: currentTime + 1,
        type: 'new art work',
        read: true,
        send: false,
      });

    const seed = Math.floor(Math.random() * 1e8);
    const imageId = uuid.v1();

    scrollViewRef.current.scrollToEnd({animated: true});

    // generate art work
    axios
      .post(serverURL + 'txt2img', {
        prompt: inputText + `, ${artistName} art style`,
        steps: 20,
        width: 768,
        height: 768,
        cfg_scale: 7,
        seed: seed,
      })
      .then(function (response) {
        console.log('send');
        scrollViewRef.current.scrollToEnd({animated: true});

        const image_file = `data:image/png;base64,${response.data.images[0]}`;

        setInputText('');

        // show the image in the latest message
        setLatestImage(image_file);
        spendCharge();
        // send the image to the user database
        storage()
          .ref()
          .child(`images/${imageId}.png`)
          .putString(image_file, 'data_url')
          .then(() => {
            storage()
              .ref(`images/${imageId}.png`)
              .getDownloadURL()
              .then(url => {
                realtime()
                  .ref(
                    `/users/${auth().currentUser.uid}/messages/${artistName}/${
                      currentTime + 1
                    }/`,
                  )
                  .set({
                    timestamp: currentTime + 1,
                    type: 'new art work',
                    messages: inputText,
                    read: true,
                    send: false,
                    image: {
                      imageURL: url,
                      artist: artistName,
                    },
                  });
              });
          });
      });
  };

  // image view

  const [pickedImage, setPickedImage] = useState(null); // pickedImage = image object when user pick an image from the gallery
  const [shareModalVisible, setShareModalVisible] = useState(false);

  return (
    <View
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: COLORS.primary,
      }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        style={{
          backgroundColor: COLORS.primary,
          flex: 1,
        }}>
        <TouchableOpacity
          onPress={() => {
            // go back to previous page
            navigation.goBack();
          }}
          style={{
            marginRight: 10,
            position: 'absolute',
            left: 40,
            top: 60,
          }}>
          <FontAwesomeIcon icon={faChevronLeft} size={20} color={'gray'} />
        </TouchableOpacity>
        <Text
          style={{
            color: 'black',
            marginRight: 10,
            position: 'absolute',
            left: 140,
            top: 50,
            fontSize: 20,
            fontWeight: 'bold',
          }}>
          {name}
        </Text>

        <ScrollView
          style={{
            marginTop: 100,
          }}
          ref={scrollViewRef}
          onLayout={() => scrollViewRef.current.scrollToEnd({animated: true})}>
          {Object.keys(messages)
            .sort((a, b) => a - b)
            .map(time => {
              return (
                <View
                  key={time}
                  style={{
                    margin: 8,
                  }}>
                  <NeomorphFlex
                    inner={false}
                    style={{
                      alignSelf: messages[time].send
                        ? 'flex-end'
                        : 'flex-start',
                      shadowRadius: 3,
                      borderRadius: 15,
                      backgroundColor: COLORS.primary,
                    }}>
                    <View
                      style={{
                        maxWidth: 300,
                        alignSelf: 'flex-start',
                        borderRadius: 15,
                        backgroundColor: messages[time].send
                          ? COLORS.blue
                          : COLORS.primary,
                      }}>
                      {type == 'private club request' ||
                        (messages[time]?.type === 'new art work request' && (
                          <View
                            style={{
                              padding: 2,
                              flexDirection: messages[time].send
                                ? 'row-reverse'
                                : 'row',
                            }}>
                            <View
                              style={{
                                justifyContent: 'center',
                              }}>
                              <CachedImage
                                style={{
                                  height: 30,
                                  width: 30,
                                  borderRadius: 15,
                                  overflow: 'hidden',
                                }}
                                resizeMode="cover"
                                source={
                                  messages[time].send ? myAvatar : defaultAvatar
                                }
                              />
                            </View>
                            <Text
                              style={{
                                color: 'black',
                                margin: 10,
                                maxWidth: 270,
                                fontSize: 18,
                                textAlign: messages[time].send
                                  ? 'right'
                                  : 'left',
                              }}>
                              {messages[time].message}
                            </Text>
                          </View>
                        ))}
                      {messages[time]?.type === 'new art work' && (
                        <View>
                          {/* <Text
                            style={{
                              color: 'black',
                              fontWeight: 'bold',
                              fontSize: 18,
                              margin: 10,
                            }}>
                            {name}:
                          </Text> */}
                          {messages[time].image ? (
                            ImageOperator(
                              time,
                              messages[time].image.imageURL,
                              messages[time].prompt,
                              latestImage,
                              pickedImage,
                              setPickedImage,
                              setShareModalVisible,
                            )
                          ) : (
                            // <CachedImage
                            //   style={{
                            //     height: 300,
                            //     width: 300,
                            //     borderRadius: 15,
                            //     overflow: 'hidden',
                            //   }}
                            //   resizeMode="cover"
                            //   source={
                            //     messages[time].image
                            //       ? messages[time].image.imageURL
                            //       : latestImage
                            //   }
                            // />
                            <Text>{messages[time]?.message}</Text>
                          )}
                        </View>
                      )}
                    </View>
                  </NeomorphFlex>
                </View>
              );
            })}
        </ScrollView>
        <View
          style={{
            width: '100%',
            bottom: 0,
            marginBottom: 5,
            alignItems: 'center',
          }}>
          <NeomorphFlex
            inner={true}
            style={{
              shadowRadius: 3,
              borderRadius: 15,
              backgroundColor: COLORS.primary,
              width: 400,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <TextInput
              returnKeyType="send"
              placeholder="Type your message"
              multiline={true}
              numberOfLines={1}
              blurOnSubmit={true}
              onBlur={Keyboard.dismiss}
              style={{
                width: '100%',
                maxHeight: 200,
                color: 'black',
                padding: 10,
                margin: 5,
                fontSize: 18,
              }}
              onChangeText={text => setInputText(text)}
              value={inputText}
              onSubmitEditing={() => {
                console.log('send');
                if (type == 'private club request') {
                  sendMessage();
                }
                if (type == 'new art work') {
                  generateArtWork(id); // for artist id is the artist name
                }
              }}
            />
          </NeomorphFlex>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatUI;
