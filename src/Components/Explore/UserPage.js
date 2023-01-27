import React, {useEffect, useState} from 'react';
import realtime from '@react-native-firebase/database';
import {View, Text, TouchableOpacity} from 'react-native';
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
import {Neomorph} from 'react-native-neomorph-shadows';

export default UserPage = ({route, navigation}) => {
  const [user, setUser] = useState({});
  const dispatch = useDispatch();
  const [likes, setLikes] = useState({});
  const likedImages = useSelector(state => state.user.data.liked_images);
  const isLiked = image => {
    return likedImages[image.id] ? true : false;
  };

  useEffect(() => {
    realtime()
      .ref(`/users/${route.params.id}`)
      .once('value')
      .then(snapshot => {
        setUser(snapshot.val());
        // console.log(snapshot.val());
      });
  }, []);
  // instgram like user page
  // show user artName, avatar picture, published images
  // show follow button
  // show ask to join private club button
  const handleFollow = () => {
    console.log('follow');
  };
  const handleAskToJoin = () => {
    console.log('ask to join');
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
              [key]: documentSnapshot.data().likes,
            };
          });
        });
    });
  };

  useEffect(() => {
    user.published && loadLike(user.published);
  }, [user.published]);

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
              source={{uri: user?.avatar ? user.avatar : defaultAvatar}}
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
              {user?.artName ? user.artName : 'Anonymous'}
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
                10
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
            paddingEnd: 20,
          }}>
          <TouchableOpacity
            style={{
              backgroundColor: COLORS.primary,
              borderRadius: 5,
              marginRight: 10,
              padding: 5,
            }}
            onPress={handleFollow}>
            <Neomorph
              style={{
                shadowRadius: 10,
                borderRadius: 25,
                backgroundColor: COLORS.primary,
                width: 80,
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
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: COLORS.primary,
              borderRadius: 5,
              padding: 5,
            }}
            onPress={handleAskToJoin}>
            <Neomorph
              style={{
                shadowRadius: 10,
                borderRadius: 25,
                backgroundColor: COLORS.primary,
                width: 160,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: 'gray',
                  fontSize: 15,
                }}>
                Join my private club
              </Text>
            </Neomorph>
          </TouchableOpacity>
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
      <ScrollView>
        {header()}

        {user &&
          user?.published &&
          Object.keys(user.published).map((key, index) => {
            const image = user.published[key];
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
    </View>
  );
};
