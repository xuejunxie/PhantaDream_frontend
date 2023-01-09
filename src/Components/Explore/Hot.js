import {View, Image, ScrollView, Text} from 'react-native';
import React, {useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import realtime from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import {Neomorph} from 'react-native-neomorph-shadows';
import COLORS from '../GlobalValues/Colors';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faHeart} from '@fortawesome/free-solid-svg-icons';
import {faHeart as faHeartO} from '@fortawesome/free-regular-svg-icons';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

const size = 280;

export default function Hot() {
  // load all images from firestore images
  // sort them by likes
  // display them in a list
  const [images, setImages] = React.useState([]);

  useEffect(() => {
    // load all images from firestore images
    const subscriber = firestore()
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
      });

    // Unsubscribe from events when no longer in use
    return () => subscriber();
  }, []);

  // Sync user hearts number
  const [hearts, setHearts] = React.useState(0);
  realtime()
    .ref('users/' + auth().currentUser.uid + '/heart')
    .on('value', snapshot => {
      setHearts(snapshot.val());
    });

  // // Sync user liked images
  const [likedImages, setLikedImages] = React.useState([]);
  // realtime()
  //   .ref('users/' + auth().currentUser.uid + '/liked_images')
  //   .on('value', snapshot => {
  //     const likedImages = [];
  //     snapshot.forEach(childSnapshot => {
  //       likedImages.push(childSnapshot.val());
  //     });
  //     setLikedImages(likedImages);
  //   });

  // Get user liked images
  useEffect(() => {
    realtime()
      .ref('users/' + auth().currentUser.uid + '/liked_images')
      .once('value', snapshot => {
        const likedImages = [];
        snapshot.forEach(childSnapshot => {
          likedImages.push(childSnapshot.val());
        });
        setLikedImages(likedImages);
      });
    console.log(likedImages);
  }, []);

  // like a image
  const like = image => {
    // check if the image is liked by user
    // if it is liked, unlike it
    // if it is not liked, like it
    if (likedImages.find(likedImage => likedImage.id === image.key)) {
      // unlike the image
      // remove the image from the user's liked images

      realtime()
        .ref('users/' + auth().currentUser.uid + '/liked_images/' + image.key)
        .remove();

      // remove the user from the image's like collection
      firestore().collection(image.key).doc(auth().currentUser.uid).delete();

      // decrease the image's likes by 1
      firestore()
        .collection('images')
        .doc(image.key)
        .update({
          likes: image.likes - 1,
        });

      // update likedImages state
      setLikedImages(
        likedImages.filter(likedImage => likedImage.id !== image.key),
      );
    } else {
      // like the image
      // increase the image's likes by 1
      firestore()
        .collection('images')
        .doc(image.key)
        .update({
          likes: image.likes + 1,
        });

      // store the user information in the image's like collection
      firestore().collection(image.key).doc(auth().currentUser.uid).set({
        time: new Date(),
      });

      // save the image to the user's liked images
      realtime()
        .ref('users/' + auth().currentUser.uid + '/liked_images')
        .child(image.key)
        .set({
          liked: true,
          id: image.key,
        });

      // reduce user hearts by 1
      realtime()
        .ref('users/' + auth().currentUser.uid + '/heart')
        .once('value')
        .then(snapshot => {
          realtime()
            .ref('users/' + auth().currentUser.uid + '/heart')
            .set(snapshot.val() - 1);
        });

      // update likedImages state
      setLikedImages([
        ...likedImages,
        {
          liked: true,
          id: image.key,
        },
      ]);
    }
  };

  return (
    <View>
      <ScrollView>
        {images.map(image => (
          <View
            key={image.key}
            style={{
              backgroundColor: 'rgba(0,0,0,0)',
              marginTop: 30,
              // make it center
              alignItems: 'center',
            }}>
            <TouchableWithoutFeedback
              onPress={() => {
                like(image);
              }}>
              <Neomorph
                style={{
                  shadowRadius: 10,
                  borderRadius: 25,
                  backgroundColor: COLORS.primary,
                  width: size,
                  height: size,
                  marginTop: 20,
                }}>
                <Image
                  source={{
                    uri: image.url,
                  }}
                  style={{
                    width: size,
                    height: size,

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
                    likedImage => likedImage.id === image.key,
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
