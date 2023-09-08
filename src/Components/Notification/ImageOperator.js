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

export default ImageOperator = (
  imageKey,
  imageURL,
  prompt,
  latestImage,
  pickedImage,
  setPickedImage,
  setShareModalVisible,
) => {
  const [CopyButtonPressed, setCopyButtonPressed] = useState(false);
  const [saveButtonPressed, setSaveButtonPressed] = useState(false);
  const [shareButtonPressed, setShareButtonPressed] = useState(false);
  const [deleteButtonPressed, setDeleteButtonPressed] = useState(false);
  const actionButtons = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-evenly',
        }}>
        {operations(
          CopyButtonPressed,
          setCopyButtonPressed,
          renderIcon(faCopy),
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

  // copy prompt to input box
  useEffect(() => {
    if (pickedImage) {
      if (CopyButtonPressed) {
        setInputText(messages[pickedImage].prompt);
      }
    }
  }, [CopyButtonPressed]);

  // save photo to local cameral roll
  useEffect(() => {
    if (pickedImage) {
      if (saveButtonPressed) {
        // download image from the URL

        CameraRoll.save(imageURL).then(() => {
          Alert.alert('Photo Saved!');
        });
      }
    }
  }, [saveButtonPressed]);

  useEffect(() => {
    if (pickedImage) {
      if (shareButtonPressed) {
        setShareModalVisible(true);
      }
    }
  }, [shareButtonPressed]);

  // delete photo
  useEffect(() => {
    if (pickedImage) {
      if (deleteButtonPressed) {
        Alert.alert(
          'Delete',
          'Are you sure you want to delete?',
          [
            {
              text: 'Cancel',
              onPress: () => {
                setDeleteButtonPressed(false);
              },
              style: 'cancel',
            },
            {
              text: 'OK',
              onPress: () => {
                if (images.length === 1) {
                  setImages([initImage]);
                } else {
                  setImages(
                    images.filter(image => {
                      return image.id !== pickedImage.id;
                    }),
                  );
                }
                AsyncStorage.removeItem(pickedImage.id);
                // remove image on users' generated images and messages
                realtime()
                  .ref('users/' + auth().currentUser.uid + '/generated')
                  .child(pickedImage.id)
                  .remove();
                realtime()
                  .ref('users/' + auth().currentUser.uid + '/messages')
                  .child(pickedImage.artist[0])
                  .child(pickedImage.date.toString())
                  .remove();
                realtime()
                  .ref('users/' + auth().currentUser.uid + '/messages')
                  .child(pickedImage.artist[0])
                  .child((pickedImage.date - 1).toString())
                  .remove();
                // remove image on storage
                storageRef
                  .child('images/' + pickedImage.id + '.png')
                  .delete()
                  .then(() => {
                    console.log('image deleted');
                  });

                setPickedImage(null);
                setDeleteButtonPressed(false);
              },
            },
          ],
          {cancelable: false},
        );
      }
    }
  }, [deleteButtonPressed]);

  const renderIcon = name => {
    return <FontAwesomeIcon icon={name} size={20} color={'gray'} />;
  };

  const operations = (press, setPress, icon) => {
    return (
      <View
        style={{
          margin: 10,
        }}>
        <TouchableWithoutFeedback
          onPressIn={() => {
            setPress(true);
            ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
          }}
          onPressOut={() => setPress(false)}>
          <Neomorph
            inner={press}
            style={{
              shadowRadius: 5,
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

  return (
    <View
      style={{
        backgroundColor: 'rgba(0,0,0,0)',
        borderRadius: 10,

        // make it center
        alignItems: 'center',
      }}>
      <TouchableWithoutFeedback
        onPress={() => {
          ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
          if (imageKey == pickedImage) {
            setPickedImage(null);
          } else {
            setPickedImage(imageKey);
          }
        }}>
        <Neomorph
          style={{
            shadowRadius: 5,
            borderRadius: 10,
            backgroundColor: COLORS.primary,
            width: SIZES.canvas,
            height: SIZES.canvas,
          }}>
          <CachedImage
            source={imageURL}
            style={{
              width: SIZES.canvas,
              height: SIZES.canvas,
              overflow: 'hidden',
              borderRadius: 10,
            }}></CachedImage>
        </Neomorph>
      </TouchableWithoutFeedback>

      {imageKey == pickedImage ? (
        <Text style={{color: 'gray', fontSize: 15, margin: 10}}>{prompt}</Text>
      ) : null}
      {imageKey == pickedImage ? actionButtons() : null}
    </View>
  );
};
