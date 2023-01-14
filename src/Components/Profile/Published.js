import {View, Image, ScrollView, Text} from 'react-native';
import React, {useState, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import realtime from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import {Neomorph} from 'react-native-neomorph-shadows';
import {COLORS, SIZES} from '../common/globalValues';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faHeart, faTrashCan} from '@fortawesome/free-solid-svg-icons';
import {faHeart as faHeartO} from '@fortawesome/free-regular-svg-icons';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {useDispatch, useSelector} from 'react-redux';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};
export default function Published() {
  // Get user published images
  const [publishedImages, setPublishedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const loadPublished = () => {
    realtime()
      .ref('users/' + auth().currentUser.uid + '/published')
      .on('value', snapshot => {
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

  // unpublish selected image
  const unpublish = () => {
    // remove from published
    realtime()
      .ref('users/' + auth().currentUser.uid + '/published')
      .orderByChild('id')
      .equalTo(selectedImage.id)
      .once('value', snapshot => {
        snapshot.forEach(child => {
          child.ref.remove();
        });
      });

    // set published to false
    firestore().collection('images').doc(selectedImage.id).update({
      public: false,
    });

    setSelectedImage(null);
  };

  const renderIcon = (name, color) => {
    return <FontAwesomeIcon icon={name} size={20} color={color} />;
  };

  const operations = (press, setPress, icon) => {
    return (
      <View
        style={{
          margin: 10,
        }}>
        <TouchableWithoutFeedback
          onPressIn={() => {
            setPress(true);
            ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
          }}
          onPressOut={() => setPress(false)}>
          <Neomorph
            inner={press}
            style={{
              shadowRadius: 10,
              borderRadius: 25,
              backgroundColor: COLORS.primary,
              width: 60,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {icon}
          </Neomorph>
        </TouchableWithoutFeedback>
      </View>
    );
  };
  const [UnpublishButtonPressed, setUnpublishButtonPressed] = useState(false);
  const actionButtons = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-evenly',
        }}>
        {operations(
          UnpublishButtonPressed,
          setUnpublishButtonPressed,
          renderIcon(faTrashCan, COLORS.red),
        )}
      </View>
    );
  };

  useEffect(() => {
    if (selectedImage) {
      if (UnpublishButtonPressed) {
        unpublish();
        setUnpublishButtonPressed(false);
      }
    }
  }, [UnpublishButtonPressed]);

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
            <TouchableWithoutFeedback
              onPress={() => {
                ReactNativeHapticFeedback.trigger(
                  'impactMedium',
                  hapticOptions,
                );

                setPublishedImages(
                  publishedImages.map(Pimage => {
                    if (Pimage.id === image.id) {
                      Pimage.selected = !Pimage.selected;
                      if (Pimage.selected) {
                        setSelectedImage(Pimage);
                      } else {
                        setSelectedImage(null);
                      }
                    } else {
                      Pimage.selected = false;
                    }
                    return Pimage;
                  }),
                );
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
            {image.selected && actionButtons()}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
