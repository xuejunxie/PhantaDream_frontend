import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
} from 'react-native';
// import { useMoralis, useMoralisWeb3Api, useMoralisWeb3ApiCall } from "react-moralis";
import {COLORS} from '../common/globalValues';
import {Avatar, ListItem} from '@rneui/themed';

import InfoText from './InfoText';

import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';

import auth from '@react-native-firebase/auth';
import realtime from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

import {
  faBitcoinSign,
  faBolt,
  faChevronRight,
  faDollar,
  faGear,
  faHeart,
  faMailBulk,
  faStar,
  faThumbsUp,
  faUserFriends,
  faWarning,
} from '@fortawesome/free-solid-svg-icons';
import {useEffect} from 'react';

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: COLORS.primary,
  },
  userRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: 8,
    paddingLeft: 30,
    paddingRight: 15,
    paddingTop: 60,
  },
  userImage: {
    marginRight: 12,
  },
  listItemContainer: {
    borderWidth: 0.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
});

const firstEmail = {
  email: '',
};

const list = [
  {
    title: 'Billing',
    icon: faDollar,
  },
  {
    title: 'Revenue',
    icon: faBitcoinSign,
  },
  {
    title: 'Settings',
    icon: faGear,
  },
  {
    title: 'Messages',
    icon: faMailBulk,
  },
];

const Settings = () => {
  // set user name

  const [name, setName] = React.useState('');
  const [avatar, setAvatar] = React.useState(
    'https://i0.wp.com/bangla.indiarag.com/wp-content/uploads/2019/01/dummy-snapcode-avatar@2x.png?ssl=1',
  );

  useEffect(() => {
    // get user name
    realtime()
      .ref(`/users/${auth().currentUser.uid}`)
      .once('value')
      .then(snapshot => {
        setName(
          snapshot.val().fullName.givenName +
            ' ' +
            snapshot.val().fullName.familyName,
        );
      });

    // get user avatar
    storage()
      .ref(`/users/${auth().currentUser.uid}/avatar`)
      .getDownloadURL()
      .then(url => {
        setAvatar(url);
      })
      .catch(e => console.log(e));
  }, []);

  // select an avatar from photo and upload the picture to the database
  const uploadAvatar = () => {
    // select a photo from the photo library
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 200,
        maxWidth: 200,
      },
      response => {
        if (response.didCancel) {
          console.log('User cancelled photo picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorCode);
        } else {
          // upload the picture to the database
          const reference = storage().ref(
            `/users/${auth().currentUser.uid}/avatar`,
          );
          const task = reference.putFile(response.assets[0].uri);
          task
            .then(() => {
              console.log('Image uploaded to the bucket!');
            })
            .catch(e => {
              console.log(e);
            });
          // set the avatar to the new avatar
          setAvatar(response.assets[0].uri);
        }
      },
    );
  };

  return (
    <ScrollView
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: COLORS.primary,
      }}>
      <View style={styles.userRow}>
        <TouchableOpacity
          onPress={() => {
            // click the avatar to change the avatar
            uploadAvatar();
          }}>
          <View style={styles.userImage}>
            <Avatar rounded size="large" source={{uri: avatar}} />
          </View>
        </TouchableOpacity>
        <View>
          <Text style={{fontSize: 16}}>{name}</Text>
          <Text
            style={{
              color: 'gray',
              fontSize: 16,
            }}>
            {firstEmail.email}
          </Text>
        </View>
      </View>
      <InfoText text="Account" />

      <View>
        {list.map((item, i) => (
          <ListItem key={i} bottomDivider style={styles.listItemContainer}>
            <FontAwesomeIcon icon={item.icon} />
            <ListItem.Content>
              <ListItem.Title>{item.title}</ListItem.Title>
            </ListItem.Content>
            <FontAwesomeIcon icon={faChevronRight} />
          </ListItem>
        ))}
      </View>
    </ScrollView>
  );
};

export default Settings;
