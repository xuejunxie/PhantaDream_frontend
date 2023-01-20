import {View, Text, Alert} from 'react-native';
import React from 'react';
import auth from '@react-native-firebase/auth';
import realtime from '@react-native-firebase/database';
import firestore from '@react-native-firebase/firestore';
import {REMOVE_LIKED_IMAGES, ADD_LIKED_IMAGES} from '../../redux/types';
import {useSelector} from 'react-redux';

export default function like(image, isLiked, dispatch) {
  // check if the image is liked by user
  // if it is liked, unlike it
  // if it is not liked, like it
  // get user like count
  realtime()
    .ref('users/' + auth().currentUser.uid + '/heart')
    .once('value')
    .then(snapshot => {
      if (snapshot.val() <= 0) {
        Alert.alert('You have no more hearts');
        return;
      } else {
        if (isLiked) {
          // unlike the image
          // remove the image from the user's liked images

          dispatch({type: REMOVE_LIKED_IMAGES, payload: image});
          realtime()
            .ref(
              'users/' + auth().currentUser.uid + '/liked_images/' + image.id,
            )
            .remove();

          // remove the user from the image's like collection
          // firestore().collection(image.id).doc(auth().currentUser.uid).delete();
          firestore()
            .collection('images')
            .doc(image.id)
            .collection('likeUsers')
            .doc(auth().currentUser.uid)
            .delete();

          // decrease the image's likes by 1
          firestore()
            .collection('images')
            .doc(image.id)
            .update({
              likes: firestore.FieldValue.increment(-1),
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
          // image.likes = image.likes + 1;
          dispatch({type: ADD_LIKED_IMAGES, payload: image});
          firestore()
            .collection('images')
            .doc(image.id)
            .update({
              likes: firestore.FieldValue.increment(1),
            });

          // // store the user information in the image's like collection
          // firestore().collection(image.id).doc(auth().currentUser.uid).set({
          //   time: new Date().getTime(),
          // });
          // change the image's date format
          firestore().collection('images').doc(image.id).update({
            date: new Date().getTime(),
          });

          // save the like to image's like collection
          firestore()
            .collection('images')
            .doc(image.id)
            .collection('likeUsers')
            .doc(auth().currentUser.uid)
            .set({
              time: new Date().getTime(),
              id: auth().currentUser.uid,
            });

          // save the image to the user's liked images
          realtime()
            .ref('users/' + auth().currentUser.uid + '/liked_images')
            .child(image.id)
            .set({
              ...image,
              likedTime: new Date().getTime(),
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
          // setLikedImages([
          //   ...likedImages,
          //   {
          //     liked: true,
          //     id: image.id,
          //   },
          // ]);
        }
      }
    });
}
