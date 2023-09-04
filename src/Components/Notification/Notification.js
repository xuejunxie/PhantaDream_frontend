import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  Image,
  ImageBackground,
  FlatList,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS} from '../common/globalValues';

import {Avatar} from '@rneui/themed';
import realtime from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import * as RootNavigation from '../common/RootNavigation';
import {createStackNavigator} from '@react-navigation/stack';
import {TextInput} from 'react-native-gesture-handler';
import {useSelector} from 'react-redux';
import {CachedImage} from '@georstat/react-native-image-cache';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 10,
    height: '100%',
  },
  searchSection: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  input: {
    flex: 1,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 0,
    backgroundColor: COLORS.primary,
    color: '#424242',
  },
  list: {
    marginTop: 10,
    backgroundColor: COLORS.primary,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: COLORS.primary,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: COLORS.primary,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    color: '#666',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});

function msToTime(ms) {
  let seconds = (ms / 1000).toFixed(0);
  let minutes = (ms / (1000 * 60)).toFixed(0);
  let hours = (ms / (1000 * 60 * 60)).toFixed(0);
  let days = (ms / (1000 * 60 * 60 * 24)).toFixed(0);
  if (seconds < 60) return seconds + ' seconds';
  else if (minutes < 60) return minutes + ' minutes';
  else if (hours < 24) return hours + ' hours';
  else return days + ' Days';
}

export default function Notification() {
  const [search, setSearch] = useState('');
  const [filteredDataSource, setFilteredDataSource] = useState([]);
  const [masterDataSource, setMasterDataSource] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const messagesObject = useSelector(state => state.user?.data?.messages);
  const [messages, setMessages] = useState({});

  const fetchMessages = () => {
    if (messagesObject) {
      const messagePromises = Object.keys(messagesObject).map(senderID => {
        var youLastMessage = Object.values(messagesObject[senderID])[
          Object.keys(messagesObject[senderID]).length - 1
        ].message;
        // Show only limited length of message
        const length = 34;
        youLastMessage =
          youLastMessage.length > length
            ? youLastMessage.slice(0, length) + '...'
            : youLastMessage;

        const youLastMessageTime = Object.keys(messagesObject[senderID])[
          Object.keys(messagesObject[senderID]).length - 1
        ];
        return Promise.all([
          realtime().ref(`/users/${senderID}/artName`).once('value'),
          realtime().ref(`/users/${senderID}/avatar`).once('value'),
        ]).then(([nameSnapshot, avatarSnapshot]) => {
          const youName = nameSnapshot.val();
          const youAvatar = avatarSnapshot.val();
          return {
            id: senderID,
            avatar: youAvatar,
            name: youName,
            lastMessage: youLastMessage,
            time: youLastMessageTime,
            byNow: msToTime(new Date().getTime() - youLastMessageTime) + ' ago',
            type: messagesObject[senderID][youLastMessageTime].type,
            image: messagesObject[senderID][youLastMessageTime].image,
            artistName: senderID,
          };
        });
      });
      Promise.all(messagePromises).then(messages => {
        const messagesObj = {};
        messages.forEach(message => {
          messagesObj[message.id] = message;
        });
        setMessages(messagesObj);
        // setFilteredDataSource(messages);
        // setMasterDataSource(messages);
      });
    }
  };

  // useEffect(() => {
  //   fetchMessages();

  //   // setFilteredDataSource(messages);
  //   // setMasterDataSource(messages);
  // }, []);

  // fetch user information for each message
  useEffect(() => {
    fetchMessages();
  }, [messagesObject]);

  const searchFilterFunction = text => {
    if (text) {
      const newData = masterDataSource.filter(function (item) {
        const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredDataSource(newData);
      setSearch(text);
      setIsSearching(true);
    } else {
      setFilteredDataSource(masterDataSource);
      setSearch(text);
      setIsSearching(false);
    }
  };

  const listItem = ({sender, index}) => {
    // console.log(sender);
    if (sender.type === 'private club request') {
      return (
        <TouchableOpacity
          style={styles.listItem}
          key={index}
          onPress={() =>
            RootNavigation.navigate('Chat', {
              name: sender.artName,
              avatar: sender.avatar,
              id: sender.id,
              type: sender.type,
            })
          }>
          <CachedImage
            style={{
              height: 50,
              width: 50,
              borderRadius: 25,
              overflow: 'hidden',
            }}
            resizeMode="cover"
            source={sender.avatar}
          />
          <View style={styles.listItemContent}>
            <Text style={styles.name}>{sender.name}</Text>
            <Text style={styles.message}>{sender.lastMessage}</Text>
          </View>
          <Text style={styles.time}>{sender.byNow}</Text>
        </TouchableOpacity>
      );
    }

    if ((sender.type = 'new art work')) {
      const imageURL = sender.image.imageURL;
      // console.log(imageURL);
      return (
        <TouchableOpacity
          style={styles.listItem}
          key={index}
          onPress={() =>
            RootNavigation.navigate('Chat', {
              name: sender.artistName,
              avatar: sender.avatar,
              id: sender.id,
              type: sender.type,
            })
          }>
          <CachedImage
            style={{
              height: 50,
              width: 50,
              borderRadius: 25,
              overflow: 'hidden',
            }}
            resizeMode="cover"
            source={imageURL}
          />
          {/* <Image
            style={{
              height: 50,
              width: 50,
              borderRadius: 25,
              overflow: 'hidden',
            }}
            resizeMode="cover"
            source={{uri: imageURL}}
          /> */}
          {/* <ImageBackground
            style={{
              flex: 1, // Make the image take the entire space of the TouchableOpacity
              flexDirection: 'row', // Assuming you want to display the content in a row
              alignItems: 'center', // Align the content vertically
              borderRadius: 25,
              height: '100%',
              overflow: 'hidden',
            }}
            resizeMode="cover"
            source={{uri: imageURL}}
            onError={e => {
              console.log('error', e);
            }}> */}
          <View style={styles.listItemContent}>
            <Text style={styles.name}>{sender.artistName}</Text>
            <Text style={styles.message}>{sender.lastMessage}</Text>
          </View>
          <Text style={styles.time}>{sender.byNow}</Text>

          {/* </ImageBackground> */}
        </TouchableOpacity>
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View
          style={{
            height: 50,
          }}
        />
        <View style={styles.list}>
          {Object.keys(messages).length > 0 &&
            Object.keys(messages)
              .sort((a, b) => messages[b].time - messages[a].time)
              .map((key, index) => {
                return listItem({sender: messages[key], index});
              })}
        </View>
      </ScrollView>
      {/* <View style={styles.searchSection}>
        <TextInput
          style={styles.input}
          onChangeText={text => searchFilterFunction(text)}
          value={search}
          underlineColorAndroid="transparent"
          placeholder="Search Here"
        />
      </View> */}
    </View>
  );
}
