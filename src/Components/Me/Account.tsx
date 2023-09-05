import React, {useRef} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';

// import { useMoralis, useMoralisWeb3Api, useMoralisWeb3ApiCall } from "react-moralis";
import {COLORS, defaultAvatar} from '../common/globalValues';

import {Avatar, ListItem} from '@rneui/themed';

import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';

import auth from '@react-native-firebase/auth';
import realtime from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import {launchImageLibrary} from 'react-native-image-picker';
import * as RootNavigation from '../common/RootNavigation';
import {TextInput} from 'react-native-gesture-handler';
import {useSelector} from 'react-redux';

import {
  faBolt,
  faChevronRight,
  faDollar,
  faDoorOpen,
  faEdit,
  faExclamation,
  faFan,
  faHeart,
  faHome,
  faPaintBrush,
  faSignOut,
  faSignOutAlt,
  faBell,
  faUser,
  faUserFriends,
  faUsers,
  faCloudBolt,
  faCloud,
  faShip,
  faSkull,
  faSkullCrossbones,
  faGear,
} from '@fortawesome/free-solid-svg-icons';
import {useEffect} from 'react';
import {
  faEnvelope,
  faLightbulb,
  faStar,
} from '@fortawesome/free-regular-svg-icons';
import Billing from './Account/Billing';
import Following from './Account/Following';
import Follower from './Account/Follower';
import Setting from './Account/Setting';
import {CachedImage} from '@georstat/react-native-image-cache';

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
    marginRight: 30,
  },
  listItemContainer: {
    borderWidth: 0.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
});

const Account = () => {
  // set user name

  // const [name, setName] = React.useState('');
  // const [avatar, setAvatar] = React.useState(defaultAvatar);

  const avatar = useSelector(state => state.user.data?.avatar);
  const artName = useSelector(state => state.user.data?.artName);
  const familyName = useSelector(
    state => state.user.data?.fullName?.familyName,
  );
  const givenName = useSelector(state => state.user.data?.fullName?.givenName);
  const name = artName ? artName : givenName + ' ' + familyName;
  const handleNameObject = useSelector(state => state.user.data?.handleName);
  // console.log(useSelector(state => state.user.data));

  // select an avatar from photo and upload the picture to the database
  const uploadAvatar = () => {
    // select a photo from the photo library
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 400,
        maxWidth: 400,
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
              reference.getDownloadURL().then(url => {
                realtime()
                  .ref(`/users/${auth().currentUser.uid}/avatar`)
                  .set(url)
                  .catch(e => console.log(e));
              });
            })
            .catch(e => {
              console.log(e);
            });
          // set the avatar to the new avatar
          // save uri to user database
        }
      },
    );
  };

  const [editName, setEditName] = React.useState(false);

  const updateName = newName => {
    // update the name in the database
    realtime()
      .ref(`/users/${auth().currentUser.uid}/artName`)
      .set(newName)
      .catch(e => console.log(e));

    // update artName in the published images
    realtime()
      .ref(`/users/${auth().currentUser.uid}/published`)
      .once('value')
      .then(snapshot => {
        snapshot.forEach(child => {
          firestore()
            .collection('images')
            .doc(child.key)
            .update({
              owner: {
                artName: newName,
                avatar: avatar,
                id: auth().currentUser.uid,
              },
            })
            .catch(e => console.log(e));
        });
      })
      .catch(e => console.log(e));

    // update the name in the app
    setEditName(false);
  };

  const [editHandleName, setEditHandleName] = React.useState(false);

  const updateHandleName = newHandleName => {
    // check if the handle name is already taken
    firestore()
      .collection('handles')
      .doc(newHandleName)
      .get()
      .then(doc => {
        if (doc.exists) {
          Alert.alert(
            'Handle name already taken',
            'Please choose a different handle name',
          );

          return;
        } else {
          // delete the old handle name from handle database
          firestore()
            .collection('handles')
            .doc(handleNameObject.name)
            .delete()
            .catch(e => console.log(e));

          // update the handle name in handle database
          firestore()
            .collection('handles')
            .doc(newHandleName)
            .set({
              id: auth().currentUser.uid,
            })
            .catch(e => console.log(e));

          // update the handle name in user database
          const newHandleNameObject = {
            name: newHandleName,
            time: new Date().getTime(),
          };
          realtime()
            .ref(`/users/${auth().currentUser.uid}/handleName`)
            .set(newHandleNameObject)
            .catch(e => console.log(e));
          // update the handle name in the app
          setEditHandleName(false);
        }
      });
  };

  function AccountView({navigation}) {
    const simpleNavigate = title => {
      return () => navigation.navigate(title);
    };

    const list = [
      {
        title: 'Profile page',
        icon: faHome,
        onPress: ProfileFunction,
      },

      {
        title: 'Following',
        icon: faStar,
        onPress: simpleNavigate('Following'),
      },
      {
        title: 'Follower',
        icon: faUserFriends,
        onPress: simpleNavigate('Follower'),
      },
      // {
      //   title: 'Private Clubs',
      //   icon: faSkullCrossbones,
      //   onPress: simpleNavigate('PrivateClubs'),
      // },
      // {
      //   title: 'Private Club members',
      //   icon: faUsers,
      //   onPress: simpleNavigate('PrivateClubMembers'),
      // },
      {
        title: 'Notifications',
        icon: faBell,
      },
      {
        title: 'Payment history',
        icon: faDollar,
        onPress: simpleNavigate('Billing'),
      },
      {
        title: 'Setting',
        icon: faGear,
        onPress: simpleNavigate('Setting'),
      },
    ];

    return (
      <View
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
              {avatar == '' ? (
                <Image
                  style={{
                    height: 80,
                    width: 80,
                    borderRadius: 40,
                    overflow: 'hidden',
                  }}
                  resizeMode="cover"
                  source={{uri: defaultAvatar}}
                />
              ) : (
                <CachedImage
                  style={{
                    height: 80,
                    width: 80,
                    borderRadius: 40,
                    overflow: 'hidden',
                  }}
                  resizeMode="cover"
                  source={avatar}
                />
              )}
            </View>
          </TouchableOpacity>
          <View
            style={{
              flexDirection: 'column',
            }}>
            <View
              style={{
                flexDirection: 'row',
              }}>
              <TextInput
                editable={editName}
                autoFocus={true}
                onSubmitEditing={e => {
                  updateName(e.nativeEvent.text);
                }}
                style={{fontSize: 20, color: 'gray'}}>
                {name}
              </TextInput>
              <TouchableOpacity
                style={{
                  justifyContent: 'center',
                }}
                onPress={() => {
                  setEditName(true);
                }}>
                <FontAwesomeIcon
                  style={{
                    marginLeft: 20,
                  }}
                  icon={faEdit}
                  size={16}
                  color={'gray'}
                />
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
              }}>
              <Text style={{fontSize: 15, color: 'gray'}}>@</Text>
              <TextInput
                editable={editHandleName}
                autoFocus={true}
                onSubmitEditing={e => {
                  updateHandleName(e.nativeEvent.text.replace(/\s/g, ''));
                  Alert.alert(
                    'Note that: you can change your handle name once a day.',
                  );
                }}
                style={{fontSize: 15, color: 'gray'}}>
                {handleNameObject?.name}
              </TextInput>
              {new Date().getTime() - handleNameObject?.time >
                1000 * 60 * 60 * 24 && (
                <TouchableOpacity
                  onPress={() => {
                    setEditHandleName(true);
                  }}>
                  <FontAwesomeIcon
                    style={{
                      marginLeft: 20,
                    }}
                    icon={faEdit}
                    size={16}
                    color={'gray'}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <ScrollView>
          {list.map((item, i) => {
            return listItem(i, item.onPress, item.title, item.icon);
          })}
        </ScrollView>
      </View>
    );
  }

  const ProfileFunction = () => {
    RootNavigation.navigate('UserPage', {id: auth().currentUser.uid});
  };

  function listItem(key, onPress, title, icon) {
    return (
      <TouchableOpacity key={key} onPress={onPress}>
        <ListItem bottomDivider style={styles.listItemContainer}>
          <FontAwesomeIcon icon={icon} color={'gray'} />
          <ListItem.Content>
            <ListItem.Title
              style={{
                color: 'gray',
              }}>
              {title}
            </ListItem.Title>
          </ListItem.Content>
          <FontAwesomeIcon icon={faChevronRight} color={'gray'} />
        </ListItem>
      </TouchableOpacity>
    );
  }

  const AccountStack = createStackNavigator();

  return (
    <AccountStack.Navigator
      initialRouteName="Accounts"
      screenOptions={({route}) => {
        return {
          headerShown: route.name !== 'Accounts',
        };
      }}>
      <AccountStack.Screen name="Accounts" component={AccountView} />
      <AccountStack.Screen
        name="Billing"
        component={Billing}
        options={{
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
        }}
      />
      <AccountStack.Screen
        name="Following"
        component={Following}
        options={{
          headerStyle: {
            backgroundColor: COLORS.primary,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
        }}
      />
      <AccountStack.Screen
        name="Follower"
        component={Follower}
        options={{
          headerStyle: {
            backgroundColor: COLORS.primary,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
        }}
      />
      <AccountStack.Screen
        name="Setting"
        component={Setting}
        options={{
          headerStyle: {
            backgroundColor: COLORS.primary,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
        }}
      />
    </AccountStack.Navigator>
  );
};

export default Account;
