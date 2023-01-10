import {View, Text} from 'react-native';
import React from 'react';
import auth from '@react-native-firebase/auth';
import realtime from '@react-native-firebase/database';
import firestore from '@react-native-firebase/firestore';
import {REMOVE_LIKED_IMAGES, ADD_LIKED_IMAGES} from '../../redux/types';

export default function like(image, likedImages, dispatch) {
  // check if the image is liked by user
  // if it is liked, unlike it
  // if it is not liked, like it
  if (likedImages.find(likedImage => likedImage.id === image.id)) {
    // unlike the image
    // remove the image from the user's liked images

    dispatch({type: REMOVE_LIKED_IMAGES, payload: image});
    realtime()
      .ref('users/' + auth().currentUser.uid + '/liked_images/' + image.id)
      .remove();

    // remove the user from the image's like collection
    firestore().collection(image.id).doc(auth().currentUser.uid).delete();

    // decrease the image's likes by 1
    firestore()
      .collection('images')
      .doc(image.id)
      .update({
        likes: image.likes - 1,
      });

    // increase user hearts by 1
    realtime()
      .ref('users/' + auth().currentUser.uid + '/heart')
      .once('value')
      .then(snapshot => {
        realtime()
          .ref('users/' + auth().currentUser.uid + '/heart')
          .set(snapshot.val() + 1);
      });

    // update likedImages state
    // setLikedImages(
    //   likedImages.filter(likedImage => likedImage.id !== image.id),
    // );
  } else {
    // like the image
    // increase the image's likes by 1
    dispatch({type: ADD_LIKED_IMAGES, payload: image});
    firestore()
      .collection('images')
      .doc(image.id)
      .update({
        likes: image.likes + 1,
      });

    // store the user information in the image's like collection
    firestore().collection(image.id).doc(auth().currentUser.uid).set({
      time: new Date(),
    });

    // save the image to the user's liked images
    realtime()
      .ref('users/' + auth().currentUser.uid + '/liked_images')
      .child(image.id)
      .set(image);

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
    // setLikedImages([
    //   ...likedImages,
    //   {
    //     liked: true,
    //     id: image.id,
    //   },
    // ]);
  }
}
