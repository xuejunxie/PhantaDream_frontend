import {View, Image, ScrollView, Text} from 'react-native';
import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import realtime from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import {Neomorph} from 'react-native-neomorph-shadows';
import {COLORS, SIZES} from '../common/globalValues';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faHeart} from '@fortawesome/free-solid-svg-icons';
import {faHeart as faHeartO} from '@fortawesome/free-regular-svg-icons';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import like from '../common/like';
import {useDispatch, useSelector} from 'react-redux';

import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import ImageView from './ImageView';
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
    firestore()
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
              const image = documentSnapshot.data();
              images.push(image);
            }
          });
        }
        setImages(images);
      });
  }, []);

  const hearts = useSelector(state => state.user.data.heart);

  // Get user liked images
  const likedImages = useSelector(state => state.user.data.liked_images);

  const dispatch = useDispatch();

  const isLiked = image => {
    return likedImages[image.id] ? true : false;
  };

  const [likes, setLikes] = useState({});

  const loadLike = images => {
    // get likes
    images.map(image => {
      firestore()
        .collection('images')
        .doc(image.id)
        .onSnapshot(documentSnapshot => {
          // const newLikes = {};
          if (documentSnapshot?.data()) {
            // const newLikes = likes;
            // newLikes[image.id] = documentSnapshot.data().likes;
            // setLikes(newLikes);
            setLikes({
              ...likes,
              [image.id]: documentSnapshot.data().likes,
            });
          }
        });
    });
  };

  useEffect(() => {
    loadLike(images);
  }, [images]);

  return (
    <View>
      <ScrollView>
        {images.map(
          image => ImageView(image, likes, isLiked(image), dispatch),
          (showAvatar = true),
        )}
      </ScrollView>
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
