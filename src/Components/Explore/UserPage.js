import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Alert} from 'react-native';
import {COLORS, defaultAvatar} from '../common/globalValues';
import {Avatar, ListItem} from '@rneui/themed';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import {faChevronLeft, faChevronRight} from '@fortawesome/free-solid-svg-icons';
import ImageView from './ImageView';
import {useDispatch, useSelector} from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import realtime from '@react-native-firebase/database';

import {Neomorph} from 'react-native-neomorph-shadows';

export default UserPage = ({route, navigation}) => {
  const hostId = route.params.id;

  const [host, setHost] = useState({});
  const dispatch = useDispatch();
  const [likes, setLikes] = useState({});
  const likedImages = useSelector(state => state.user.data?.liked_images) || {};
  const isLiked = image => {
    return likedImages[image.id] ? true : false;
  };

  useEffect(() => {
    realtime()
      .ref(`/users/${hostId}`)
      .on('value', snapshot => {
        setHost(snapshot.val());
      });
  }, []);
  // instgram like user page
  // show user artName, avatar picture, published images
  // show follow button
  // show ask to join private club button

  const followings = useSelector(state => state.user.data?.followings);

  const handleFollow = () => {
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

  const handleAskToJoin = () => {
    // ask to join private club
    // send message to host
    realtime()
      .ref(
        `/users/${hostId}/messages/${
          auth().currentUser.uid
        }/${new Date().getTime()}/`,
      )
      .set({
        message: 'I want to join your private club',
        type: 'private club request',
        timestamp: new Date().getTime(),
        read: false,
        approved: false,
        send: false,
      });

    realtime()
      .ref(
        `/users/${
          auth().currentUser.uid
        }/messages/${hostId}/${new Date().getTime()}/`,
      )
      .set({
        message: 'Private club request sent',
        type: 'private club request sent',
        timestamp: new Date().getTime(),
        read: true,
        send: true,
      });
  };

  const loadLike = images => {
    // get likes

    Object.keys(images).map(key => {
      firestore()
        .collection('images')
        .doc(key)
        .onSnapshot(documentSnapshot => {
          setLikes(likes => {
            return {
              ...likes,
              [key]: documentSnapshot.data()?.likes,
            };
          });
        });
    });
  };

  const NeoButton = ({text, width}) => {
    return (
      <Neomorph
        style={{
          shadowRadius: 5,
          borderRadius: 25,
          backgroundColor: COLORS.primary,
          width: width,
          height: 40,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text
          style={{
            color: 'gray',
            fontSize: 15,
          }}>
          {text}
        </Text>
      </Neomorph>
    );
  };

  const followButton = () => NeoButton({text: 'Follow', width: 100});

  const followingButton = () => NeoButton({text: 'Following', width: 100});

  const joinPrivateClubButton = () =>
    NeoButton({text: 'Join my private Club', width: 170});

  const requestSentButton = () => NeoButton({text: 'Request Sent', width: 170});

  const inPrivateClubButton = () =>
    NeoButton({text: 'In Private Club', width: 170});

  useEffect(() => {
    host.published && loadLike(host.published);
  }, [host.published]);

  const header = () => {
    return (
      <View
        style={{
          alignItems: 'center',
          height: 300,
          width: '100%',
          marginBottom: 40,
        }}>
        <TouchableOpacity
          onPress={() => {
            // go back to previous page
            navigation.goBack();
          }}
          style={{
            marginRight: 10,
            position: 'absolute',
            left: 40,
            top: 60,
          }}>
          <FontAwesomeIcon icon={faChevronLeft} size={20} color={'gray'} />
        </TouchableOpacity>
        <View
          style={{
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 80,
          }}>
          <View
            style={{
              flex: 1,
            }}>
            <Avatar
              rounded
              size="xlarge"
              source={{uri: host?.avatar ? host.avatar : defaultAvatar}}
            />
          </View>

          <View
            style={{
              flex: 1,
              marginTop: 100,
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: 'gray',
                fontSize: 20,
              }}>
              {host?.artName ? host.artName : 'Anonymous'}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 10,
              }}>
              <Text
                style={{
                  color: 'gray',
                  fontSize: 15,
                }}>
                {host?.followers ? Object.keys(host.followers).length : 0}
              </Text>

              <Text
                style={{
                  color: 'gray',
                  fontSize: 15,
                  marginLeft: 5,
                }}>
                followers
              </Text>
              <Text
                style={{
                  color: 'gray',
                  fontSize: 15,
                  marginLeft: 30,
                }}>
                10
              </Text>
              <Text
                style={{
                  color: 'gray',
                  fontSize: 15,
                  marginLeft: 5,
                }}>
                in private club
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <TouchableWithoutFeedback
            style={{
              backgroundColor: COLORS.primary,
              borderRadius: 5,
              padding: 10,
            }}
            onPress={handleFollow}>
            {followings && followings[hostId]
              ? followingButton()
              : followButton()}
          </TouchableWithoutFeedback>
          {host?.messages?.privateClubRequest?.[auth().currentUser.uid] ? (
            host?.messages?.privateClubRequest?.[auth().currentUser.uid]
              .approved ? (
              <TouchableWithoutFeedback
                style={{
                  backgroundColor: COLORS.primary,
                  borderRadius: 5,
                  padding: 10,
                }}>
                {inPrivateClubButton()}
              </TouchableWithoutFeedback>
            ) : (
              <TouchableWithoutFeedback
                style={{
                  backgroundColor: COLORS.primary,
                  borderRadius: 5,
                  padding: 10,
                }}>
                {requestSentButton()}
              </TouchableWithoutFeedback>
            )
          ) : (
            <TouchableWithoutFeedback
              style={{
                backgroundColor: COLORS.primary,
                borderRadius: 5,
                padding: 10,
              }}
              onPress={handleAskToJoin}>
              {joinPrivateClubButton()}
            </TouchableWithoutFeedback>
          )}
        </View>
      </View>
    );
  };

  return (
    <View
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: COLORS.primary,
      }}>
      {host.active === false ? (
        <View
          style={{
            alignItems: 'center',
            height: 300,
            width: '100%',
            marginBottom: 40,
          }}>
          <TouchableOpacity
            onPress={() => {
              // go back to previous page
              navigation.goBack();
            }}
            style={{
              marginRight: 10,
              position: 'absolute',
              left: 40,
              top: 60,
            }}>
            <FontAwesomeIcon icon={faChevronLeft} size={20} color={'gray'} />
          </TouchableOpacity>
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{color: 'gray', fontSize: 20}}>
              This account is deactivated
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView>
          {header()}

          {host &&
            host?.published &&
            Object.keys(host.published).map((key, index) => {
              const image = host.published[key];
              return ImageView(
                image,
                likes,
                isLiked(image),
                dispatch,
                (showAvatar = false),
              );
            })}
          <View
            style={{
              height: 100,
              width: '100%',
            }}
          />
        </ScrollView>
      )}
    </View>
  );
};
