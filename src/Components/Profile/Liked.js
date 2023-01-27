import {
  View,
  Image,
  ScrollView,
  Text,
  Alert,
  RefreshControl,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import realtime from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import {Neomorph} from 'react-native-neomorph-shadows';
import {COLORS, SIZES} from '../common/globalValues';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faHeart} from '@fortawesome/free-solid-svg-icons';
import {faCopy, faHeart as faHeartO} from '@fortawesome/free-regular-svg-icons';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {useDispatch, useSelector} from 'react-redux';
import like from '../common/like';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {SET_PROMPT} from '../../redux/types';
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export default function Liked() {
  // Get user liked images
  const likedImageObject = useSelector(state => state.user.data.liked_images);
  const likedImagesArray = likedImageObject
    ? Object.values(likedImageObject)
    : [];

  const [likes, setLikes] = useState({});

  const loadLike = images => {
    return new Promise((resolve, reject) => {
      // get likes
      console.log('load like');
      images.map(image => {
        firestore()
          .collection('images')
          .doc(image.id)
          .onSnapshot(documentSnapshot => {
            const newLikes = {};
            if (documentSnapshot?.data()) {
              const newLikes = likes;
              newLikes[image.id] = documentSnapshot.data().likes;
              setLikes(newLikes);
            }
          });
      });
      resolve();
    });
  };

  useEffect(() => {
    console.log('liked images changed');
    loadLike(likedImagesArray);
  }, [likedImageObject]);

  const dispatch = useDispatch();
  const [selectedImage, setSelectedImage] = React.useState(null);

  const [LikeButtonPressed, setLikeButtonPressed] = useState(false);
  const [CopyButtonPressed, setCopyButtonPressed] = useState(false);

  useEffect(() => {
    if (selectedImage) {
      if (LikeButtonPressed) {
        const liked = likedImageObject[selectedImage.id] ? false : true;
        like(selectedImage, liked, dispatch);
        setLikeButtonPressed(false);
      }
    }
  }, [LikeButtonPressed]);

  useEffect(() => {
    if (selectedImage) {
      if (CopyButtonPressed) {
        dispatch({type: SET_PROMPT, payload: selectedImage.prompt});
        setCopyButtonPressed(false);
        Alert.alert('Prompt copied to the Dream input!');
      }
    }
  }, [CopyButtonPressed]);

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
              shadowRadius: 10,
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

  const renderIcon = (name, color) => {
    return <FontAwesomeIcon icon={name} size={20} color={color} />;
  };

  const actionButtons = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-evenly',
        }}>
        {operations(
          LikeButtonPressed,
          setLikeButtonPressed,
          renderIcon(
            faHeart,
            selectedImage && likedImageObject[selectedImage.id]
              ? COLORS.red
              : 'gray',
          ),
        )}
        {operations(
          CopyButtonPressed,
          setCopyButtonPressed,
          renderIcon(faCopy, 'gray'),
        )}
      </View>
    );
  };

  const imageView = image => {
    const liked = likedImageObject[image.id] ? true : false;
    const isSelected = selectedImage && selectedImage.id === image.id;
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
            if (isSelected) {
              setSelectedImage(null);
            } else {
              setSelectedImage(image);
            }

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
            Likes: {likes[image.id] ? likes[image.id] : image.likes}
          </Text>
          <Text style={{color: 'gray', fontSize: 15, marginTop: 10}}>
            Prompt: {image.prompt}
          </Text>
        </View>
        {isSelected && actionButtons()}
      </View>
    );
  };
  const scrollViewRef = useRef();
  let scrollViewHeight = 0;

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadLike(likedImagesArray).then(() => setRefreshing(false));
  }, []);

  return (
    <View>
      <ScrollView
        style={{height: '100%'}}
        ref={scrollViewRef}
        onContentSizeChange={(contentWidth, contentHeight) => {
          if (selectedImage === null) {
            // if user unselected the image, don't scroll
            if (contentHeight > scrollViewHeight) {
              scrollViewRef.current.scrollToEnd({animated: true});
            }
          } else {
            if (
              selectedImage.id ===
              likedImagesArray[likedImagesArray.length - 1].id
            ) {
              scrollViewRef.current.scrollToEnd({animated: true});
            }
          }
          scrollViewHeight = contentHeight;
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {likedImagesArray.map(image => imageView(image))}
      </ScrollView>
    </View>
  );
}
