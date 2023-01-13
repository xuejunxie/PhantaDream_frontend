import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';

// import { useMoralis, useMoralisWeb3Api, useMoralisWeb3ApiCall } from "react-moralis";
import {COLORS} from '../common/globalValues';
import {Avatar, ListItem} from '@rneui/themed';

import InfoText from './InfoText';

import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';

import auth from '@react-native-firebase/auth';
import realtime from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import {launchImageLibrary} from 'react-native-image-picker';

import {
  faBitcoinSign,
  faBolt,
  faChevronRight,
  faDollar,
  faExclamation,
  faGear,
  faHeart,
  faMailBulk,
  faNewspaper,
  faStar,
  faThumbsUp,
  faUserFriends,
  faWarning,
} from '@fortawesome/free-solid-svg-icons';
import {useEffect} from 'react';
import {StackActions} from '@react-navigation/native';
import {faEnvelope, faMessage} from '@fortawesome/free-regular-svg-icons';

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

const list = [
  {
    title: 'Billing',
    icon: faDollar,
  },
  {
    title: 'Messages',
    icon: faEnvelope,
  },
  {
    title: 'Notifications',
    icon: faExclamation,
  },
];

const Settings = () => {
  // set user name

  const [name, setName] = React.useState('');
  const [avatar, setAvatar] = React.useState(
    'https://i0.wp.com/bangla.indiarag.com/wp-content/uploads/2019/01/dummy-snapcode-avatar@2x.png?ssl=1',
  );
  const [bills, setBills] = React.useState({});

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

    // get user bills
    realtime()
      .ref(`/users/${auth().currentUser.uid}/bills`)
      .once('value')
      .then(snapshot => {
        setBills(snapshot.val());
      });
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

  function SettingView({navigation}) {
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
            <Text style={{fontSize: 25, color: 'gray'}}>{name}</Text>
          </View>
        </View>
        <InfoText text="Account" />

        <View>
          {list.map((item, i) => (
            <TouchableOpacity onPress={() => navigation.navigate(item.title)}>
              <ListItem key={i} bottomDivider style={styles.listItemContainer}>
                <FontAwesomeIcon icon={item.icon} color={'gray'} />
                <ListItem.Content>
                  <ListItem.Title
                    style={{
                      color: 'gray',
                    }}>
                    {item.title}
                  </ListItem.Title>
                </ListItem.Content>
                <FontAwesomeIcon icon={faChevronRight} color={'gray'} />
              </ListItem>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  }

  const BillingView = () => {
    return (
      <ScrollView
        style={{
          height: '100%',
          width: '100%',
          backgroundColor: COLORS.primary,
        }}>
        {bills ? (
          <View>
            {Object.keys(bills).map((key, index) => (
              <ListItem
                key={index}
                bottomDivider
                style={styles.listItemContainer}>
                <ListItem.Content
                  style={{
                    flexDirection: 'row',
                  }}>
                  <ListItem.Title
                    style={{
                      flex: 1,
                    }}>
                    {bills[key].date}
                  </ListItem.Title>
                  <ListItem.Subtitle
                    style={{
                      flex: 1,
                    }}>
                    <FontAwesomeIcon icon={faDollar} />
                    {bills[key].amount}
                    {' for '}
                    {bills[key].chargeOrder}
                    <FontAwesomeIcon icon={faBolt} color={'gray'} />
                    +
                    <FontAwesomeIcon icon={faHeart} color={COLORS.red} />
                  </ListItem.Subtitle>
                </ListItem.Content>
              </ListItem>
            ))}
          </View>
        ) : (
          <View>
            <Text>No bills</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const SettingStack = createStackNavigator();

  return (
    <SettingStack.Navigator
      initialRouteName="Settings"
      screenOptions={({route}) => {
        return {
          headerShown: route.name !== 'Settings',
        };
      }}>
      <SettingStack.Screen name="Settings" component={SettingView} />
      <SettingStack.Screen name="Billing" component={BillingView} />
    </SettingStack.Navigator>
  );
};

export default Settings;
