import {View, Image, ScrollView, Text} from 'react-native';
import React, {useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import realtime from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import {Neomorph} from 'react-native-neomorph-shadows';
import {COLORS, SIZES} from '../GlobalValues/Colors';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faHeart} from '@fortawesome/free-solid-svg-icons';
import {faHeart as faHeartO} from '@fortawesome/free-regular-svg-icons';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import like from './Like';
import {useDispatch, useSelector} from 'react-redux';

export default function Hot() {
  // load all images from firestore images
  // sort them by likes
  // display them in a list
  const [images, setImages] = React.useState([]);

  useEffect(() => {
    // load all images from firestore images
    const unsubscriber = firestore()
      .collection('images')
      .orderBy('likes', 'desc')
      .onSnapshot(querySnapshot => {
        const images = [];

        querySnapshot.forEach(documentSnapshot => {
          images.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id,
          });
        });

        setImages(images);

        unsubscriber();
      });

    // Unsubscribe from events when no longer in use
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

  return (
    <View>
      <ScrollView>
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
                  Likes: {image.likes}
                </Text>
                <Text style={{color: 'gray', fontSize: 15, marginTop: 10}}>
                  Prompt: {image.prompt}
                </Text>
              </View>
            ) : null}
          </View>
        ))}
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
