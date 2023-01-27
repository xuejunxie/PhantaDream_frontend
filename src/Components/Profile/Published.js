import {
  View,
  Image,
  ScrollView,
  Text,
  Alert,
  RefreshControl,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import firestore from '@react-native-firebase/firestore';
import realtime from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import {Neomorph} from 'react-native-neomorph-shadows';
import {COLORS, SIZES} from '../common/globalValues';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faHeart, faTrashCan} from '@fortawesome/free-solid-svg-icons';
import {faCopy, faHeart as faHeartO} from '@fortawesome/free-regular-svg-icons';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {useDispatch, useSelector} from 'react-redux';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};
import like from '../common/like';
import {SET_PROMPT} from '../../redux/types';

var scrollViewHeight = 0;

export default function Published() {
  // Get user published images
  const [likes, setLikes] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const scrollViewRef = useRef();

  const publishedImagesObject = useSelector(state => state.user.data.published);
  const publishedImages = publishedImagesObject
    ? Object.values(publishedImagesObject)
    : [];

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
    console.log('published images changed');
    loadLike(publishedImages);
  }, [publishedImagesObject]);

  // unpublish selected image
  const unpublish = () => {
    // remove from published
    realtime()
      .ref('users/' + auth().currentUser.uid + '/published')
      .orderByChild('id')
      .equalTo(selectedImage.id)
      .once('value', snapshot => {
        snapshot.forEach(child => {
          child.ref.remove();
        });
      });

    // delete from images
    firestore().collection('images').doc(selectedImage.id).delete();

    setSelectedImage(null);
  };

  const renderIcon = (name, color) => {
    return <FontAwesomeIcon icon={name} size={20} color={color} />;
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
  const [UnpublishButtonPressed, setUnpublishButtonPressed] = useState(false);
  const [LikeButtonPressed, setLikeButtonPressed] = useState(false);
  const [CopyButtonPressed, setCopyButtonPressed] = useState(false);
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
            selectedImage && likedImages[selectedImage.id]
              ? COLORS.red
              : 'gray',
          ),
        )}
        {operations(
          CopyButtonPressed,
          setCopyButtonPressed,
          renderIcon(faCopy, 'gray'),
        )}
        {operations(
          UnpublishButtonPressed,
          setUnpublishButtonPressed,
          renderIcon(faTrashCan, COLORS.red),
        )}
      </View>
    );
  };

  useEffect(() => {
    if (selectedImage) {
      if (UnpublishButtonPressed) {
        unpublish();
        setUnpublishButtonPressed(false);
      }
    }
  }, [UnpublishButtonPressed]);

  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedImage) {
      if (LikeButtonPressed) {
        const liked = likedImages[selectedImage.id] ? true : false;
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

  const likedImages = useSelector(state => state.user.data.liked_images);

  const imageView = image => {
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
            ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);

            if (isSelected) {
              setSelectedImage(null);
            } else {
              setSelectedImage(image);
            }
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

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadLike(publishedImages).then(() => setRefreshing(false));
  }, []);

  return (
    <View>
      <ScrollView
        style={{
          height: '100%',
        }}
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
              publishedImages[publishedImages.length - 1].id
            ) {
              scrollViewRef.current.scrollToEnd({animated: true});
            }
          }
          scrollViewHeight = contentHeight;
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {publishedImages
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .map(image => imageView(image))}
      </ScrollView>
    </View>
  );
}
