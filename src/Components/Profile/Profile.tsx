import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
} from 'react-native';
// import { useMoralis, useMoralisWeb3Api, useMoralisWeb3ApiCall } from "react-moralis";
import COLORS from '../GlobalValues/Colors';
import {Avatar, ListItem} from '@rneui/themed';

import InfoText from './InfoText';

import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';

import ApplePay, {DetailsData, MethodData} from 'react-native-apple-payment';

import auth from '@react-native-firebase/auth';
import realtime from '@react-native-firebase/database';

import {
  faBitcoinSign,
  faBolt,
  faChevronRight,
  faDollar,
  faGear,
  faHeart,
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

const avatar = 'https://cdn-icons-png.flaticon.com/512/847/847969.png';
const firstEmail = {
  email: '',
};

const list = [
  {
    title: 'Private clubs',
    icon: faUserFriends,
  },
  {
    title: 'Following',
    icon: faHeart,
  },
  {
    title: 'Liked',
    icon: faThumbsUp,
  },
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
];

const Profile = ({navigation}) => {
  // set user name

  const [name, setName] = React.useState('');

  useEffect(() => {
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
  }, []);

  return (
    <ScrollView
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: COLORS.primary,
      }}>
      <View style={styles.userRow}>
        <View style={styles.userImage}>
          <Avatar rounded size="large" source={{uri: avatar}} />
        </View>
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

export default Profile;
