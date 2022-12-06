import React from 'react';
import {StyleSheet, Switch, View, Text, ScrollView} from 'react-native';
// import { useMoralis, useMoralisWeb3Api, useMoralisWeb3ApiCall } from "react-moralis";
import COLORS from '../GlobalValues/Colors';
import {Avatar, ListItem} from '@rneui/themed';

import BaseIcon from './Icon';
import Chevron from './Chevron';
import InfoText from './InfoText';

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: 'white',
  },
  userRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: 8,
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 50,
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

const Profile = ({navigation}) => {
  // const { authenticate, authError, isAuthenticating, isAuthenticated, logout, Moralis } = useMoralis();

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
        <ListItem
          // chevron
          title="Currency"
          rightTitle="USD"
          rightTitleStyle={{fontSize: 15}}
          onPress={() => {}}
          containerStyle={styles.listItemContainer}
          leftIcon={
            <BaseIcon
              containerStyle={{backgroundColor: '#FAD291'}}
              icon={{
                type: 'font-awesome',
                name: 'money',
              }}
            />
          }
          rightIcon={<Chevron />}
        />
        <ListItem
          title="Location"
          rightTitle="New York"
          rightTitleStyle={{fontSize: 15}}
          onPress={() => {}}
          containerStyle={styles.listItemContainer}
          leftIcon={
            <BaseIcon
              containerStyle={{backgroundColor: '#57DCE7'}}
              icon={{
                type: 'material',
                name: 'place',
              }}
            />
          }
          rightIcon={<Chevron />}
        />
        <ListItem
          title="Language"
          rightTitle="English"
          rightTitleStyle={{fontSize: 15}}
          onPress={() => {}}
          containerStyle={styles.listItemContainer}
          leftIcon={
            <BaseIcon
              containerStyle={{backgroundColor: '#FEA8A1'}}
              icon={{
                type: 'material',
                name: 'language',
              }}
            />
          }
          rightIcon={<Chevron />}
        />
      </View>
      <InfoText text="More" />
      <View>
        <ListItem
          title="About US"
          onPress={() => {}}
          containerStyle={styles.listItemContainer}
          leftIcon={
            <BaseIcon
              containerStyle={{backgroundColor: '#A4C8F0'}}
              icon={{
                type: 'ionicon',
                name: 'md-information-circle',
              }}
            />
          }
          rightIcon={<Chevron />}
        />
        <ListItem
          title="Terms and Policies"
          onPress={() => {}}
          containerStyle={styles.listItemContainer}
          leftIcon={
            <BaseIcon
              containerStyle={{backgroundColor: '#C6C7C6'}}
              icon={{
                type: 'entypo',
                name: 'light-bulb',
              }}
            />
          }
          rightIcon={<Chevron />}
        />
        <ListItem
          title="Share our App"
          onPress={() => {}}
          containerStyle={styles.listItemContainer}
          leftIcon={
            <BaseIcon
              containerStyle={{
                backgroundColor: '#C47EFF',
              }}
              icon={{
                type: 'entypo',
                name: 'share',
              }}
            />
          }
          rightIcon={<Chevron />}
        />
        <ListItem
          title="Rate Us"
          onPress={() => {}}
          containerStyle={styles.listItemContainer}
          leftIcon={
            <BaseIcon
              containerStyle={{
                backgroundColor: '#FECE44',
              }}
              icon={{
                type: 'entypo',
                name: 'star',
              }}
            />
          }
          rightIcon={<Chevron />}
        />
        <ListItem
          title="Send FeedBack"
          onPress={() => {}}
          containerStyle={styles.listItemContainer}
          badge={{
            value: 999,
            textStyle: {fontSize: 14, color: 'white'},
          }}
          leftIcon={
            <BaseIcon
              containerStyle={{
                backgroundColor: '#00C001',
              }}
              icon={{
                type: 'materialicon',
                name: 'feedback',
              }}
            />
          }
          rightIcon={<Chevron />}
        />
      </View>
    </ScrollView>
  );
};

export default Profile;
