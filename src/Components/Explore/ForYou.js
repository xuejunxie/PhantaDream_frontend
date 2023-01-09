// get 10 results from the database and load more when the user scrolls down

import {View, Text, Image} from 'react-native';
import React, {useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import realtime from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import {Neomorph} from 'react-native-neomorph-shadows';
import COLORS from '../GlobalValues/Colors';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faHeart} from '@fortawesome/free-solid-svg-icons';
import {faHeart as faHeartO} from '@fortawesome/free-regular-svg-icons';
import {
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';

const loadSize = 1;

export default function ForYou() {
  const [images, setImages] = React.useState([]);
  useEffect(() => {
    // load 10 random images from firestore images
    const subscriber = firestore()
      .collection('images')
      .orderBy('id', 'desc')
      .limit(loadSize + 2)
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

  // load more images when the user scrolls down
  const loadMore = () => {
    firestore()
      .collection('images')
      .orderBy('id', 'desc')
      .startAfter(images[images.length - 1].id)
      .limit(loadSize)
      .onSnapshot(querySnapshot => {
        // if the query is less then 10, then there are no more images to load
        querySnapshot.forEach(documentSnapshot => {
          setImages([
            ...images,
            {
              ...documentSnapshot.data(),
              key: documentSnapshot.id,
            },
          ]);
        });
      });
  };

  const [hearts, setHearts] = React.useState(0);
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

  // load more when the user scrolls down to the bottom of the page
  return (
    <View>
      <ScrollView onScrollEndDrag={loadMore}>
        {images.map(image => (
          <View
            key={image.key}
            style={{
              backgroundColor: 'rgba(0,0,0,0)',
              marginTop: 30,
              // make it center
              alignItems: 'center',
            }}>
            <Neomorph
              key={image.key}
              style={{
                shadowRadius: 5,
                borderRadius: 10,
                backgroundColor: COLORS.primary,
                width: 280,
                height: 280,
                margin: 10,
              }}>
              <Image
                source={{uri: image.url}}
                style={{width: 280, height: 280, borderRadius: 10}}
              />
            </Neomorph>
          </View>
        ))}
      </ScrollView>
      <HeartIcon />
    </View>
  );
}
