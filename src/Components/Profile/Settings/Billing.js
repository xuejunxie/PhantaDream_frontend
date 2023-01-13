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
import {COLORS} from '../../common/globalValues';
import {Avatar, ListItem} from '@rneui/themed';

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
  faExclamation,
  faHeart,
  faUserFriends,
} from '@fortawesome/free-solid-svg-icons';
import {useEffect} from 'react';
import {faEnvelope} from '@fortawesome/free-regular-svg-icons';

const styles = StyleSheet.create({
  listItemContainer: {
    borderWidth: 0.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
});

export default Billing = () => {
  const [bills, setBills] = React.useState({});

  useEffect(() => {
    // get user bills
    realtime()
      .ref(`/users/${auth().currentUser.uid}/bills`)
      .once('value')
      .then(snapshot => {
        setBills(snapshot.val());
      });
  }, []);
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
