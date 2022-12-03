import React from 'react';
import {
  StyleSheet,
  TextInput,
  StatusBar,
  View,
  Text,
  ScrollView,
  Button,
} from 'react-native';
// import { useMoralis, useMoralisWeb3Api, useMoralisWeb3ApiCall } from "react-moralis";

const Profile = ({navigation}) => {
  // const { authenticate, authError, isAuthenticating, isAuthenticated, logout, Moralis } = useMoralis();

  const logoutUser = () => {
    // if (isAuthenticated) {
    //   // logout();
    //   navigation.replace("Auth");
    // }
  };
  return (
    <View>
      <View>
        {/* <Button title="Logout" color="white" onPress={logoutUser} loadingProps={{ animating: true }}></Button> */}
      </View>
    </View>
  );
};

export default Profile;
