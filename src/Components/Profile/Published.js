import {View, Image, ScrollView, Text} from 'react-native';
import React, {useState, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import realtime from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import {Neomorph} from 'react-native-neomorph-shadows';
import {COLORS, SIZES} from '../common/globalValues';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faHeart} from '@fortawesome/free-solid-svg-icons';
import {faHeart as faHeartO} from '@fortawesome/free-regular-svg-icons';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {useDispatch, useSelector} from 'react-redux';

export default function Published() {
  // Get user published images
  const [publishedImages, setPublishedImages] = useState([]);

  const loadPublished = () => {
    realtime()
      .ref('users/' + auth().currentUser.uid + '/published')
      .once('value', snapshot => {
        if (snapshot.val()) {
          var published = snapshot.val();
          const publishedImages = [];
          for (const key in published) {
            // get latest like count from database
            firestore()
              .collection('images')
              .doc(published[key].id)
              .get()
              .then(documentSnapshot => {
                published[key] = documentSnapshot.data();
              });
            publishedImages.push(published[key]);
          }
          setPublishedImages(publishedImages);
        }
      });
  };
  useEffect(() => {
    loadPublished();
  }, []);

  return (
    <View>
      <ScrollView onScrollBeginDrag={loadPublished}>
        {publishedImages.map(image => (
          <View
            key={image.id}
            style={{
              backgroundColor: 'rgba(0,0,0,0)',
              marginTop: 30,
              // make it center
              alignItems: 'center',
            }}>
            <TouchableWithoutFeedback onPress={() => {}}>
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
                Likes: {image.likes}
              </Text>
              <Text style={{color: 'gray', fontSize: 15, marginTop: 10}}>
                Prompt: {image.prompt}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
