import {View, Image} from 'react-native';
import React, {useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import {Neomorph} from 'react-native-neomorph-shadows';
import COLORS from '../GlobalValues/Colors';

const size = 280;

export default function Leaderboard() {
  // load all images from firestore images
  // sort them by likes
  // display them in a list
  const [images, setImages] = React.useState([]);

  useEffect(() => {
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

  return (
    <View>
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
                uri: image.image,
              }}
              style={{
                width: size,
                height: size,

                borderRadius: 25,
              }}></Image>
          </Neomorph>
        </View>
      ))}
    </View>
  );
}
