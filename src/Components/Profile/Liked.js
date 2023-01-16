import {View, Image, ScrollView, Text} from 'react-native';
import React, {useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import realtime from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import {Neomorph} from 'react-native-neomorph-shadows';
import {COLORS, SIZES} from '../common/globalValues';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faHeart} from '@fortawesome/free-solid-svg-icons';
import {faHeart as faHeartO} from '@fortawesome/free-regular-svg-icons';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {useDispatch, useSelector} from 'react-redux';
import like from '../common/like';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export default function Liked() {
  // Get user liked images
  const likedImages = useSelector(state => state.like.likedImages);
  const dispatch = useDispatch();

  const imageView = image => {
    const liked = likedImages.find(likedImage => likedImage.id === image.id);
    return (
      <View
        key={image.id}
        style={{
          backgroundColor: 'rgba(0,0,0,0)',
          marginTop: 30,
          // make it center
          alignItems: 'center',
        }}>
        <TouchableWithoutFeedback
          onPress={() => {
            like(image, liked, dispatch);
            ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
          }}>
          <Neomorph
            style={{
              shadowRadius: 10,
              borderRadius: 25,
              backgroundColor: COLORS.primary,
              width: SIZES.canvas,
              height: SIZES.canvas,
              marginTop: 20,
            }}>
            <Image
              source={{
                uri: image.url,
              }}
              style={{
                width: SIZES.canvas,
                height: SIZES.canvas,

                borderRadius: 25,
              }}></Image>
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 50,
                height: 50,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}>
              {liked ? (
                <FontAwesomeIcon icon={faHeart} size={25} color={COLORS.red} />
              ) : (
                <FontAwesomeIcon icon={faHeartO} size={25} color={'gray'} />
              )}
            </View>
          </Neomorph>
        </TouchableWithoutFeedback>
        <View
          style={{
            width: SIZES.canvas,
          }}>
          <Text
            style={{
              color: COLORS.red,
              fontSize: 15,
              marginTop: 10,
            }}>
            Likes: {image.likes}
          </Text>
          <Text style={{color: 'gray', fontSize: 15, marginTop: 10}}>
            Prompt: {image.prompt}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View>
      <ScrollView>{likedImages.map(image => imageView(image))}</ScrollView>
    </View>
  );
}
