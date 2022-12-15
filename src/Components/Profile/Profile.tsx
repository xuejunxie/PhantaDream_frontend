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

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: 'white',
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
    height: 55,
    borderWidth: 0.5,
    borderColor: '#ECECEC',
  },
});

const avatar = 'https://i.pravatar.cc/300';
const name = 'John Doe';
const firstEmail = {
  email: '',
};

const list = [
  {
    title: 'Recharge',
    icon: faBolt,
  },
  // {
  //   title: 'Private clubs',
  //   icon: faUserFriends,
  // },
  // {
  //   title: 'Following',
  //   icon: faHeart,
  // },
  // {
  //   title: 'Liked',
  //   icon: faThumbsUp,
  // },
  // {
  //   title: 'Billing',
  //   icon: faDollar,
  // },
  // {
  //   title: 'Revenue',
  //   icon: faBitcoinSign,
  // },
  // {
  //   title: 'Settings',
  //   icon: faGear,
  // },
];

const Profile = ({navigation}) => {
  const Method: MethodData = {
    countryCode: 'US',
    currencyCode: 'USD',
    merchantIdentifier: 'merchant.phantadream',
    supportedNetworks: ['Visa', 'MasterCard', 'AmEx'],
  };

  const Options: DetailsData = {
    total: {
      label: 'PhantaCharge',
      amount: 10,
    },
  };

  const payment = new ApplePay(Method, Options);

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
          <ListItem key={i} bottomDivider>
            <FontAwesomeIcon icon={item.icon} />
            <ListItem.Content>
              <ListItem.Title>{item.title}</ListItem.Title>
            </ListItem.Content>
            <FontAwesomeIcon icon={faChevronRight} />
          </ListItem>
        ))}
      </View>

      <View>
        <TouchableOpacity
          onPress={() => {
            payment.canMakePayments().then((can: any) => {
              console.log(can);
              if (can) {
                payment.initApplePay().then(console.warn);
              }
            });
          }}>
          <ListItem key={1} bottomDivider>
            <FontAwesomeIcon icon={faBolt} />
            <ListItem.Content>
              <ListItem.Title>Apple pay</ListItem.Title>
            </ListItem.Content>
            <FontAwesomeIcon icon={faChevronRight} />
          </ListItem>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Profile;
