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

const loadSize = 1;

const defaultAvatar =
  'https://i0.wp.com/bangla.indiarag.com/wp-content/uploads/2019/01/dummy-snapcode-avatar@2x.png?ssl=1';

export default function ForYou() {
  const [images, setImages] = useState([]);
  const [avatars, setAvatars] = useState({});
  const [artNames, setArtNames] = useState({});

  const getAvatarUrlArtName = async image => {
    storage()
      .ref(`users/${image.owner}/avatar`)
      .getDownloadURL()
      .then(url => {
        setAvatars({
          ...avatars,
          [image.owner]: url,
        });
      })
      .catch(error => {
        console.log(error);
        setAvatars({
          ...avatars,
          [image.owner]: defaultAvatar,
        });
      });

    realtime()
      .ref('users/' + image.owner + '/artName')
      .on('value', snapshot => {
        console.log(snapshot.val());
        setArtNames({
          ...artNames,
          [image.owner]: snapshot.val(),
        });
      });
  };

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
              image = documentSnapshot.data();
              images.push(image);
              // load owner Avatar URL
              getAvatarUrlArtName(image);
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
          if (documentSnapshot.data()) {
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
            getAvatarUrlArtName(image);
          });
        }
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
    // get owner avatar url

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
          <View style={{flexDirection: 'row'}}>
            <View
              style={{
                color: COLORS.red,
                fontSize: 15,
                marginTop: 10,
                flex: 1,
                alignSelf: 'flex-start',
                flexDirection: 'row',
              }}>
              <Image
                source={{
                  uri: avatars[image.owner],
                }}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                }}
              />
              <Text
                style={{
                  color: 'gray',
                  fontSize: 15,
                  marginLeft: 10,
                  textAlign: 'center',
                  alignSelf: 'center',
                }}>
                {artNames[image.owner]}
              </Text>
              <Text
                style={{
                  color: COLORS.red,
                  fontSize: 15,
                  marginTop: 10,
                  flex: 1,
                  textAlign: 'right',
                  alignSelf: 'center',
                }}>
                Likes: {likes[image.id] ? likes[image.id] : image.likes}
              </Text>
            </View>
          </View>
          <Text style={{color: 'gray', fontSize: 15, marginTop: 10}}>
            Prompt: {image.prompt}
          </Text>
        </View>
      </View>
    );
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
          return imageView(image);
        })}
      </ScrollView>
      <HeartIcon />
    </View>
  );
}
