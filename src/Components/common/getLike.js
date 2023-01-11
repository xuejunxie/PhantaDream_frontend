import React from 'react';
import firestore from '@react-native-firebase/firestore';

export default function getLike(imageId) {
  firestore()
    .collection('images')
    .doc(imageId)
    .get()
    .then(documentSnapshot => {
      return documentSnapshot.data().likes;
    });
}
