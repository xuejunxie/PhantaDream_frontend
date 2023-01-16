// get 10 results from the database and load more when the user scrolls down

import {View, Text, Image} from 'react-native';
import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import realtime from '@react-native-firebase/database';
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

import like from './like';
import {useDispatch, useSelector} from 'react-redux';
import {LOAD_LIKED_IMAGES} from '../../redux/types';
import getLike from '../common/getLike';

const loadSize = 1;

function useForceUpdate() {
  const [value, setValue] = useState(0); // integer state
  return () => setValue(value => value + 1); // update state to force render
  // A function that increment 👆🏻 the previous state like here
  // is better than directly setting `setValue(value + 1)`
}

export default function ForYou() {
  const [images, setImages] = useState([]);
  const [likes, setLikes] = useState({});
  const forceUpdate = useForceUpdate();

  const loadForYou = () => {
    // load 10 random images from firestore images
    console.log('load for you');
    firestore()
      .collection('images')
      // .where('public', '==', true)
      .orderBy('id', 'desc')
      .limit(loadSize + 2)
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
  };

  const loadLike = images => {
    // get likes
    console.log('load like');
    images.map(image => {
      firestore()
        .collection('images')
        .doc(image.id)
        .onSnapshot(documentSnapshot => {
          const newLikes = {};
          if (documentSnapshot.data()) {
            const newLikes = likes;
            newLikes[image.id] = documentSnapshot.data().likes;
            setLikes(newLikes);
          }
        });
    });
  };

  useEffect(() => {
    loadForYou();
  }, []);

  useEffect(() => {
    // loadLike(images);
  }, [images]);

  // load more images when the user scrolls down
  const loadMore = () => {
    const unsubscriber = firestore()
      .collection('images')
      .where('public', '==', true)
      .orderBy('id', 'desc')
      .startAfter(images[images.length - 1].id)
      .limit(loadSize)
      .onSnapshot(querySnapshot => {
        // if the query is less then 10, then there are no more images to load
        if (querySnapshot) {
          querySnapshot.forEach(documentSnapshot => {
            setImages([...images, documentSnapshot.data()]);
          });
        }

        // Unsubscribe from events after load once
      });
  };

  const [hearts, setHearts] = useState(0);
  realtime()
    .ref('users/' + auth().currentUser.uid + '/heart')
    .on('value', snapshot => {
      setHearts(snapshot.val());
    });

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
            key={image.id}
            style={{
              shadowRadius: 5,
              borderRadius: 10,
              backgroundColor: COLORS.primary,
              width: SIZES.canvas,
              height: SIZES.canvas,
              margin: 10,
            }}>
            <Image
              source={{uri: image.url}}
              style={{
                width: SIZES.canvas,
                height: SIZES.canvas,
                borderRadius: 10,
              }}
            />
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
            Likes: {likes[image.id] ? likes[image.id] : image.likes}
          </Text>
          <Text style={{color: 'gray', fontSize: 15, marginTop: 10}}>
            Prompt: {image.prompt}
          </Text>
        </View>
      </View>
    );
  };

  // load more when the user scrolls down to the bottom of the page
  return (
    <View>
      <ScrollView onScrollBeginDrag={loadMore}>
        {images.map(image => imageView(image))}
      </ScrollView>
      <HeartIcon />
    </View>
  );
}
