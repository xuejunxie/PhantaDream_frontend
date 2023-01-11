// get 10 results from the database and load more when the user scrolls down

import {View, Text, Image} from 'react-native';
import React, {useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import realtime from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import {Neomorph} from 'react-native-neomorph-shadows';
import {COLORS, SIZES} from '../GlobalValues/Colors';
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

const loadSize = 1;

export default function ForYou() {
  const [images, setImages] = React.useState([]);
  useEffect(() => {
    // load 10 random images from firestore images
    const unsubscriber = firestore()
      .collection('images')
      .orderBy('id', 'desc')
      .limit(loadSize + 2)
      .onSnapshot(querySnapshot => {
        const images = [];

        querySnapshot.forEach(documentSnapshot => {
          images.push(documentSnapshot.data());
        });

        setImages(images);
        console.log('set images');

        unsubscriber();
      });
  }, []);

  // load more images when the user scrolls down
  const loadMore = () => {
    const unsubscriber = firestore()
      .collection('images')
      .orderBy('id', 'desc')
      .startAfter(images[images.length - 1].id)
      .limit(loadSize)
      .onSnapshot(querySnapshot => {
        // if the query is less then 10, then there are no more images to load
        querySnapshot.forEach(documentSnapshot => {
          setImages([...images, documentSnapshot.data()]);
        });
        // Unsubscribe from events after load once
        unsubscriber();
      });
  };

  const [hearts, setHearts] = React.useState(0);
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

  // load more when the user scrolls down to the bottom of the page
  return (
    <View>
      <ScrollView onScrollBeginDrag={loadMore}>
        {images.map(image => (
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
                like(image, likedImages, dispatch);
                ReactNativeHapticFeedback.trigger(
                  'impactMedium',
                  hapticOptions,
                );
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
                  {likedImages.find(
                    likedImage => likedImage.id === image.id,
                  ) ? (
                    <FontAwesomeIcon
                      icon={faHeart}
                      size={25}
                      color={COLORS.red}
                    />
                  ) : (
                    <FontAwesomeIcon icon={faHeartO} size={25} color={'gray'} />
                  )}
                </View>
              </Neomorph>
            </TouchableWithoutFeedback>
            {likedImages.find(likedImage => likedImage.id === image.id) ? (
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
                  Likes: {image.likes + 1}
                </Text>
                <Text style={{color: 'gray', fontSize: 15, marginTop: 10}}>
                  Prompt: {image.prompt}
                </Text>
              </View>
            ) : null}
          </View>
        ))}
      </ScrollView>
      <HeartIcon />
    </View>
  );
}
