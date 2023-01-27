import React, {useState} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  Image,
} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';

// import { useMoralis, useMoralisWeb3Api, useMoralisWeb3ApiCall } from "react-moralis";
import {COLORS} from '../../common/globalValues';
import {Avatar, ListItem} from '@rneui/themed';

import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';

import auth from '@react-native-firebase/auth';
import realtime from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import {launchImageLibrary} from 'react-native-image-picker';
import {Neomorph} from 'react-native-neomorph-shadows';
import * as RootNavigation from '../../common/RootNavigation';

import {
  faBolt,
  faChevronRight,
  faDollar,
  faExclamation,
  faHeart,
  faUserFriends,
} from '@fortawesome/free-solid-svg-icons';
import {useEffect} from 'react';
import {faEnvelope} from '@fortawesome/free-regular-svg-icons';
import {useSelector} from 'react-redux';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

export default Following = () => {
  const followings = useSelector(state => state.user.data.followings);
  const [hosts, setHosts] = useState({});

  useState(() => {
    // get following host avatar and artName
    if (!followings) return;
    Object.keys(followings).map((key, index) => {
      const hostId = key;
      realtime()
        .ref(`/users/${hostId}`)
        .once('value')
        .then(snapshot => {
          setHosts(prevState => ({
            ...prevState,
            [hostId]: snapshot.val(),
          }));
        });
    });
  }, [followings]);

  const followButton = () => {
    return (
      <Neomorph
        style={{
          shadowRadius: 10,
          borderRadius: 25,
          backgroundColor: COLORS.primary,
          width: 100,
          height: 40,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text
          style={{
            color: 'gray',
            fontSize: 15,
          }}>
          Follow
        </Text>
      </Neomorph>
    );
  };

  const followingButton = () => {
    return (
      <Neomorph
        style={{
          shadowRadius: 10,
          borderRadius: 25,
          backgroundColor: COLORS.primary,
          width: 100,
          height: 40,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text
          style={{
            color: COLORS.red,
            fontSize: 15,
          }}>
          Following
        </Text>
      </Neomorph>
    );
  };

  const handleFollow = hostId => {
    if (followings && followings[hostId]) {
      // unfollow
      realtime()
        .ref(`/users/${hostId}/followers/${auth().currentUser.uid}`)
        .remove();
      realtime()
        .ref(`/users/${auth().currentUser.uid}/followings/${hostId}`)
        .remove();
    } else {
      // follow
      realtime()
        .ref(`/users/${hostId}/followers/${auth().currentUser.uid}`)
        .set(true);
      realtime()
        .ref(`/users/${auth().currentUser.uid}/followings/${hostId}`)
        .set(true);
    }
  };

  return (
    <ScrollView
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: COLORS.primary,
      }}>
      {followings && Object.keys(followings).length > 0 ? (
        <View>
          {Object.keys(followings).map((key, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                margin: 10,
              }}>
              <View style={{flex: 1}}>
                <TouchableWithoutFeedback
                  onPress={() => {
                    RootNavigation.navigate('UserPage', {
                      id: key,
                    });
                  }}>
                  <View style={{flexDirection: 'row'}}>
                    <Image
                      source={{uri: hosts[key]?.avatar}}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 50,
                      }}
                    />
                    <Text
                      style={{
                        color: 'gray',
                        alignSelf: 'center',
                        marginLeft: 10,
                        fontSize: 20,
                      }}>
                      {hosts[key]?.artName}
                    </Text>
                  </View>
                </TouchableWithoutFeedback>
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: 'flex-end',
                }}>
                <TouchableWithoutFeedback
                  style={{
                    backgroundColor: COLORS.primary,
                    borderRadius: 5,
                    padding: 5,
                  }}
                  onPress={() => handleFollow(key)}>
                  {followings && followings[key]
                    ? followingButton()
                    : followButton()}
                </TouchableWithoutFeedback>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View></View>
      )}
    </ScrollView>
  );
};
