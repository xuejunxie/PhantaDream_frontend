import React from 'react';
import {ListItem} from '@rneui/themed';
import {Alert, StyleSheet, TouchableOpacity, View} from 'react-native';
import {COLORS} from '../../common/globalValues';
import {
  faChevronRight,
  faSignOut,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import * as RootNavigation from '../../common/RootNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import realtime from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
const styles = StyleSheet.create({
  listItemContainer: {
    borderWidth: 0.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
});

export default Setting = () => {
  const list = [
    {
      title: 'Sign out',
      icon: faSignOut,
      onPress: () => signOutConfirmation(),
      color: 'gray',
    },
    {
      title: 'Deactivate and delete account',
      icon: faTrash,
      onPress: () => deactivateConfirmation(),
      color: COLORS.red,
    },
  ];

  const signOutConfirmation = () => {
    // sign out confirmation
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: signOut,
        },
      ],
      {cancelable: false},
    );
  };

  const signOut = () => {
    auth()
      .signOut()
      .then(() => {
        console.log('sign out');
        RootNavigation.navigate('Auth');
      });
  };

  const deactivateConfirmation = () => {
    // deactivate confirmation
    Alert.alert(
      'Deactivate and delete account',
      'Are you sure you want to deactivate and delete your account?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: deactivate,
        },
      ],
      {cancelable: false},
    );
  };

  const deactivate = () => {
    const user = auth().currentUser;
    // set user to inactive
    console.log(user.uid);
    realtime().ref(`/users/${user.uid}`).update({
      active: false,
    });

    signOut();
  };

  function listItem(key, onPress, title, icon, color) {
    return (
      <TouchableOpacity key={key} onPress={onPress}>
        <ListItem bottomDivider style={styles.listItemContainer}>
          <FontAwesomeIcon icon={icon} color={color} />
          <ListItem.Content>
            <ListItem.Title
              style={{
                color: color,
              }}>
              {title}
            </ListItem.Title>
          </ListItem.Content>
          <FontAwesomeIcon icon={faChevronRight} color={'gray'} />
        </ListItem>
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: COLORS.primary,
      }}>
      {list.map((item, i) => {
        return listItem(i, item.onPress, item.title, item.icon, item.color);
      })}
    </View>
  );
};
