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

export default Follower = () => {
  const followers = useSelector(state => state.user.data?.followers);
  const [hosts, setHosts] = useState({});

  useState(() => {
    // get follower host avatar and artName
    if (!followers) return;
    Object.keys(followers).map((key, index) => {
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
  }, [followers]);

  const followButton = () => {
    return (
      <Neomorph
        style={{
          shadowRadius: 5,
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

  const followerButton = () => {
    return (
      <Neomorph
        style={{
          shadowRadius: 5,
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
          following
        </Text>
      </Neomorph>
    );
  };

  const handleFollow = hostId => {
    if (followers && followers[hostId]) {
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
      {followers && Object.keys(followers).length > 0 ? (
        <View>
          {Object.keys(followers).map((key, index) => (
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
              {/* <View
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
                  {followers && followers[key]
                    ? followerButton()
                    : followButton()}
                </TouchableWithoutFeedback>
              </View> */}
            </View>
          ))}
        </View>
      ) : (
        <View></View>
      )}
    </ScrollView>
  );
};
