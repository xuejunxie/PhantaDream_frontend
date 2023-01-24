import React, {useRef} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  Alert,
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
  faBolt,
  faChevronRight,
  faDollar,
  faDoorOpen,
  faEdit,
  faExclamation,
  faHeart,
  faPaintBrush,
  faSignOut,
  faUserFriends,
} from '@fortawesome/free-solid-svg-icons';
import {useEffect} from 'react';
import {faEnvelope, faStar} from '@fortawesome/free-regular-svg-icons';
import Billing from './Settings/Billing';
import * as RootNavigation from '../common/RootNavigation';
import {TextInput} from 'react-native-gesture-handler';

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

const list = [
  {
    title: 'Billing',
    icon: faDollar,
  },
  {
    title: 'Private club friends',
    icon: faUserFriends,
  },
  {
    title: 'Followeing',
    icon: faStar,
  },
  {
    title: 'Messages',
    icon: faEnvelope,
  },
  // {
  //   title: 'Notifications',
  //   icon: faExclamation,
  // },
  //   {
  //     title: 'Apply to be a regsitered artist',
  //     icon: faPaintBrush,
  //   },
];

const Settings = () => {
  // set user name

  const [name, setName] = React.useState('');
  const [handleNameObject, setHandleNameObject] = React.useState({});
  const [avatar, setAvatar] = React.useState(
    'https://i0.wp.com/bangla.indiarag.com/wp-content/uploads/2019/01/dummy-snapcode-avatar@2x.png?ssl=1',
  );

  useEffect(() => {
    // get user name
    realtime()
      .ref(`/users/${auth().currentUser.uid}`)
      .once('value')
      .then(snapshot => {
        if (snapshot.val().artName) {
          setName(snapshot.val().artName);
        } else {
          setName(
            snapshot.val().fullName.givenName +
              ' ' +
              snapshot.val().fullName.familyName,
          );
        }
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

  useEffect(() => {
    if (name) {
      // get user handle name, if it exists. If not, set it to the user's name with a random number
      realtime()
        .ref(`/users/${auth().currentUser.uid}/handleName`)
        .once('value')
        .then(snapshot => {
          if (snapshot.val()) {
            setHandleNameObject(snapshot.val());
          } else {
            let random = Math.floor(Math.random() * 100000);
            let newHandleName = name.replace(/\s/g, '') + random;
            let handleNameObject = {
              name: newHandleName,
              time: new Date().getTime(),
            };
            realtime()
              .ref(`/users/${auth().currentUser.uid}/handleNamObjecte`)
              .set(handleNameObject)
              .catch(e => console.log(e));
            setHandleNameObject(handleNameObject);

            // update the handle name in handle database
            firestore()
              .collection('handles')
              .doc(newHandleName)
              .set({
                id: auth().currentUser.uid,
              })
              .catch(e => console.log(e));
          }
        });
    }
  }, [name]);

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

  const [editName, setEditName] = React.useState(false);

  const updateName = newName => {
    // update the name in the database
    realtime()
      .ref(`/users/${auth().currentUser.uid}/artName`)
      .set(newName)
      .catch(e => console.log(e));
    // update the name in the app
    setName(newName);
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
          setHandleNameObject(newHandleNameObject);
          setEditHandleName(false);
        }
      });
  };

  function SettingView({navigation}) {
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
              <Avatar rounded size="large" source={{uri: avatar}} />
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
                  updateHandleName(e.nativeEvent.text);
                  Alert.alert(
                    'Note that: you can change your handle name once a month.',
                  );
                }}
                style={{fontSize: 15, color: 'gray'}}>
                {handleNameObject.name}
              </TextInput>
              {new Date().getTime() - handleNameObject.time >
                1000 * 60 * 60 * 24 * 30 && (
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

        <View>
          {list.map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => navigation.navigate(item.title)}>
              <ListItem bottomDivider style={styles.listItemContainer}>
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
          <TouchableOpacity
            key={'logout'}
            onPress={() => {
              RootNavigation.navigate('Auth');
              auth()
                .signOut()
                .then(() => console.log('User signed out!'));
            }}>
            <ListItem bottomDivider style={styles.listItemContainer}>
              <FontAwesomeIcon icon={faSignOut} color={'gray'} />
              <ListItem.Content>
                <ListItem.Title
                  style={{
                    color: 'gray',
                  }}>
                  {'Sign out'}
                </ListItem.Title>
              </ListItem.Content>
              <FontAwesomeIcon icon={faChevronRight} color={'gray'} />
            </ListItem>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
      <SettingStack.Screen name="Billing" component={Billing} />
    </SettingStack.Navigator>
  );
};

export default Settings;
