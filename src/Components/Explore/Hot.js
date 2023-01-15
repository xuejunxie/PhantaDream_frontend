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
import like from './like';
import {useDispatch, useSelector} from 'react-redux';

import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export default function Hot() {
  // load all images from firestore images
  // sort them by likes
  // display them in a list
  const [images, setImages] = React.useState([]);

  useEffect(() => {
    // load 10 random images from firestore images with published = true
    const unsubscriber = firestore()
      .collection('images')
      // .where('public', '==', true)
      // sort by likes
      .orderBy('likes', 'desc')
      .limit(10)
      .onSnapshot(querySnapshot => {
        const images = [];
        if (querySnapshot) {
          querySnapshot.forEach(documentSnapshot => {
            if (documentSnapshot.data().public == true) {
              images.push(documentSnapshot.data());
            }
          });
        }
        setImages(images);
      });
  }, []);

  // Sync user hearts number
  const [hearts, setHearts] = React.useState(0);
  realtime()
    .ref('users/' + auth().currentUser.uid + '/heart')
    .on('value', snapshot => {
      setHearts(snapshot.val());
    });

  // Get user liked images
  const likedImages = useSelector(state => state.like.likedImages);
  const dispatch = useDispatch();

  const isLiked = image => {
    return likedImages.find(likedImage => likedImage.id === image.id);
  };

  const imageView = image => {
    let liked = isLiked(image);

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
      <ScrollView>{images.map(image => imageView(image))}</ScrollView>
      {/* show a heart overlay on the bottom right of Hots */}
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
        <Text
          style={{
            color: COLORS.red,
            fontSize: 20,
          }}>
          {hearts}
        </Text>

        <FontAwesomeIcon icon={faHeart} size={25} color={COLORS.red} />
      </View>
    </View>
  );
}
