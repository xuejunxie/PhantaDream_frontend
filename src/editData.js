import React from 'react';

import firestore from '@react-native-firebase/firestore';
import realtime from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

export default function editData() {
  // get all image from firestore
  //   firestore()
  //     .collection('images')
  //     .get()
  //     .then(querySnapshot => {
  //       querySnapshot.forEach(documentSnapshot => {
  //         const image = documentSnapshot.data();
  //         // set the onwer avatar and artName to the image
  //         // realtime()
  //         //   .ref('users/' + image.owner + '/avatar')
  //         //   .once('value', snapshot => {
  //         //     if (snapshot.val()) {
  //         //       const avatar = snapshot.val();
  //         //       realtime()
  //         //         .ref('users/' + image.owner + '/artName')
  //         //         .once('value', snapshot => {
  //         //           if (snapshot.val()) {
  //         //             const artName = snapshot.val();
  //         //             firestore()
  //         //               .collection('images')
  //         //               .doc(image.id)
  //         //               .update({
  //         //                 owner: {
  //         //                   avatar: avatar,
  //         //                   artName: artName,
  //         //                   id: image.owner,
  //         //                 },
  //         //               });
  //         //           }
  //         //         });
  //         //     }
  //         //   });
  //         // remove artName and avatar field in image
  //         // firestore().collection('images').doc(image.id).update({
  //         //   artName: firestore.FieldValue.delete(),
  //         //   avatar: firestore.FieldValue.delete(),
  //         // });
  //       });
  //     });
}
