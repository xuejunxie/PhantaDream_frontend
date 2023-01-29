// get 10 results from the database and load more when the user scrolls down

import {View, Text, Image, RefreshControl} from 'react-native';
import React, {useEffect, useState} from 'react';
import firestore, {firebase} from '@react-native-firebase/firestore';
import realtime from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import {Neomorph} from 'react-native-neomorph-shadows';
import {COLORS, SIZES} from '../common/globalValues';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faHeart} from '@fortawesome/free-solid-svg-icons';
import {faHeart as faHeartO} from '@fortawesome/free-regular-svg-icons';
import {
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

import like from '../common/like';
import {useDispatch, useSelector} from 'react-redux';
import ImageView from './ImageView';
import UserPage from './UserPage';

const loadSize = 1;

export default function ForYou() {
  const [images, setImages] = useState([]);

  const loadForYou = () => {
    return new Promise((resolve, reject) => {
      console.log('load for you');
      firestore()
        .collection('images')
        .orderBy('date', 'desc')
        .limit(3)
        .get()
        .then(querySnapshot => {
          const images = [];
          if (querySnapshot) {
            querySnapshot.forEach(documentSnapshot => {
              const image = documentSnapshot.data();
              images.push(image);
              // load owner Avatar URL
              // getAvatarUrlArtName(image);
            });
          }
          setImages(images);
          resolve(images);
        })
        .catch(error => {
          console.log(error);
          reject(error);
        });
    });
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
    loadForYou();
  }, []);

  useEffect(() => {
    loadLike(images);
  }, [images]);

  // load more images when the user scrolls down
  const loadMore = () => {
    firestore()
      .collection('images')
      .orderBy('date', 'desc')
      .startAfter(images[images.length - 1].date)
      .limit(loadSize)
      .get()
      .then(querySnapshot => {
        if (querySnapshot) {
          querySnapshot.forEach(documentSnapshot => {
            image = documentSnapshot.data();
            setImages([...images, image]);
            // load owner Avatar URL
          });
        }
      });
  };

  const hearts = useSelector(state => state.user.data?.heart);

  const HeartIcon = () => {
    return (
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
            color: '#E2725B',
            fontSize: 20,
          }}>
          {hearts}
        </Text>

        <FontAwesomeIcon icon={faHeart} size={25} color={COLORS.red} />
      </View>
    );
  };
  // Get user liked images

  // const likedImages = useSelector(state => state.like.likedImages);

  const likedImages = useSelector(state => state.user.data?.liked_images) || {};
  const dispatch = useDispatch();

  const isLiked = image => {
    return likedImages[image.id] ? true : false;
  };

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadForYou().then(() => setRefreshing(false));
  }, []);

  // load more when the user scrolls down to the bottom of the page

  return (
    <View>
      <ScrollView
        onScrollBeginDrag={loadMore}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {images.map(image => {
          return ImageView(
            image,
            likes,
            isLiked(image),
            dispatch,
            (showAvatar = true),
          );
        })}
      </ScrollView>
      <HeartIcon />
    </View>
  );
}
