import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  ScrollView,
  Keyboard,
  Image,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';

import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {Neomorph, NeomorphFlex} from 'react-native-neomorph-shadows';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

import {COLORS, productID, SIZES} from '../common/globalValues';
import axios from 'axios';
import {Buffer} from 'buffer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getStatusBarHeight} from 'react-native-status-bar-height';

import uuid from 'react-native-uuid';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faBolt,
  faCopy,
  faDownload,
  faShare,
  faTimes,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';

import {CameraRoll} from '@react-native-camera-roll/camera-roll';

// firebase things
import realtime from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

import artists from '../Dream/artists.json';

import RadioButtonRN from 'radio-buttons-react-native';
import ImageMarker from 'react-native-image-marker';
import {useDispatch, useSelector} from 'react-redux';
import {IAP} from '../Dream/PaymentIAP';
import {
  BUY_CHARGE_LOADING,
  FILL_CHARGE,
  SET_CHARGE_ORDER,
  SET_PRODUCT_ID,
} from '../../redux/types';

export default function ShareModal(
  pickedImage,
  shareModalVisible,
  setShareModalVisible,
) {
  const excuteShare = place => {
    // upload image to firebase storage create an entry on firestore

    const imageId = pickedImage.id;
    const image = pickedImage.image;
    const prompt = pickedImage.prompt;
    const date = pickedImage.date;
    const artist = pickedImage.artist;
    const seed = pickedImage.seed;
    const url = pickedImage.imageURL;

    const imageMeta = {
      url: url,
      id: imageId,
      prompt: prompt,
      date: date,
      artist: artist,
      creator: auth().currentUser.uid,
      owner: {
        id: auth().currentUser.uid,
        avatar: avatar,
        artName: artName,
      },
      likes: 0,
      seed: seed,
      model: 1,
      public: true,
    };
    // store image meta on firestore
    firestore()
      .collection('images')
      .doc(imageId)
      .set(imageMeta)
      .then(() => {
        Alert.alert('Image Shared!');
      });

    // store published image on user's published images
    realtime()
      .ref('users/' + auth().currentUser.uid + '/' + place)
      .child(imageId)
      .set(imageMeta);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={shareModalVisible}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
        <View
          style={{
            width: '80%',
            height: '30%',
            backgroundColor: COLORS.primary,
            borderRadius: 20,
            justifyContent: 'space-evenly',
            alignItems: 'center',
          }}>
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
            }}>
            <TouchableOpacity
              style={{
                alignItems: 'flex-end',
              }}
              onPress={() => {
                setShareModalVisible(!shareModalVisible);
              }}>
              <FontAwesomeIcon
                icon={faTimes}
                size={20}
                color={'gray'}
                style={{marginRight: 20, marginTop: 20}}
              />
            </TouchableOpacity>
          </View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: 'gray',
            }}>
            Share to?
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              width: '100%',
            }}>
            <TouchableOpacity
              onPress={() => {
                excuteShare('published');
                setShareModalVisible(false);
              }}>
              <Neomorph
                inner={false}
                style={{
                  shadowRadius: 5,
                  borderRadius: 25,
                  backgroundColor: COLORS.primary,
                  width: 120,
                  height: 40,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: 'gray',
                  }}>
                  Public
                </Text>
              </Neomorph>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                excuteShare('private');
                setShareModalVisible(false);
              }}>
              <Neomorph
                inner={false}
                style={{
                  shadowRadius: 5,
                  borderRadius: 25,
                  backgroundColor: COLORS.primary,
                  width: 140,
                  height: 40,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: 'gray',
                  }}>
                  Private club
                </Text>
              </Neomorph>
            </TouchableOpacity>
          </View>
          <Text
            style={{
              fontSize: 15,
              color: 'gray',
              margin: 10,
            }}>
            All your generated art works will be saved on your device only by
            default. Only shared art works will be saved on our server. Only
            your approved friends can see your private club art works.
          </Text>
        </View>
      </View>
    </Modal>
  );
}
