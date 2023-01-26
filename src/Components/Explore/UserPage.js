import React, {useEffect} from 'react';
import realtime from '@react-native-firebase/database';
import {View, Text} from 'react-native';

export default UserPage = ({route}) => {
  useEffect(() => {
    realtime()
      .ref(`/users/${route.params.id}`)
      .once('value')
      .then(snapshot => {
        // console.log(snapshot.val());
      });
  }, []);

  return (
    <View>
      <Text>user page</Text>
      <Text>{route.params.id}</Text>
    </View>
  );
};
