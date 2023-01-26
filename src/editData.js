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
  // get all user from realtime
  //   realtime()
  //     .ref('users')
  //     .once('value', snapshot => {
  //       // add artName and handleName to user
  //       // iterate through snapshot object
  //       Object.keys(snapshot.val()).forEach(key => {
  //         const user = snapshot.val()[key];
  //         const userId = key;
  //         // check if the fullName is Chinese
  //         if (user.fullName) {
  //           const isChinese = /[\u4e00-\u9fa5]/.test(user.fullName.givenName);
  //           realtime()
  //             .ref('users/' + userId + '/artName')
  //             .set(
  //               isChinese
  //                 ? user.fullName.familyName + user.fullName.givenName
  //                 : user.fullName.givenName + ' ' + user.fullName.familyName,
  //             );
  //           realtime()
  //             .ref('users/' + userId + '/handleName')
  //             .set({
  //               name: isChinese
  //                 ? user.fullName.familyName + user.fullName.givenName
  //                 : user.fullName.givenName +
  //                   user.fullName.familyName +
  //                   Math.floor(Math.random() * 10000),
  //               time: 0,
  //             });
  //         } else {
  //           realtime()
  //             .ref('users/' + userId + '/artName')
  //             .set('Anonymous');
  //           realtime()
  //             .ref('users/' + userId + '/handleName')
  //             .set({
  //               name: 'Anonymous' + Math.floor(Math.random() * 10000),
  //               time: 0,
  //             });
  //         }
  //       });
  //   snapshot.forEach(child => {
  //     const user = child.val();
  //     const userId = child.key;
  //     console.log(child);
  //     if (user.fullName) {
  //       realtime()
  //         .ref('users/' + userId + '/artName')
  //         .set(user.fullName.givenName + ' ' + user.fullName.familyName);
  //       realtime()
  //         .ref('users/' + userId + '/handleName')
  //         .set({
  //           name:
  //             user.fullName.givenName +
  //             user.fullName.familyName +
  //             user.id.slice(0, 5),
  //           time: 0,
  //         });
  //     } else {
  //       realtime()
  //         .ref('users/' + userId + '/artName')
  //         .set('Anonymous');
  //       realtime()
  //         .ref('users/' + userId + '/handleName')
  //         .set({
  //           name: 'Anonymous' + userId.slice(0, 5),
  //           time: 0,
  //         });
  //     }
  //   });
  // });
  //
  // recover all images with "KRI65T5XKkXhH399CTdGE2i0yVq1" as owner into "KRI65T5XKkXhH399CTdGE2i0yVq1" published
  //   firestore()
  //     .collection('images')
  //     .where('creator', '==', 'KRI65T5XKkXhH399CTdGE2i0yVq1')
  //     .get()
  //     .then(querySnapshot => {
  //       querySnapshot.forEach(documentSnapshot => {
  //         console.log(documentSnapshot.data());
  //         realtime()
  //           .ref(
  //             'users/KRI65T5XKkXhH399CTdGE2i0yVq1/published/' +
  //               documentSnapshot.data().id,
  //           )
  //           .set(documentSnapshot.data());
  //       });
  //     });
}
