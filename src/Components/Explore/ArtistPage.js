import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import {Avatar} from '@rneui/themed';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faChevronLeft} from '@fortawesome/free-solid-svg-icons';
import ImageView from './ImageView';
import {useSelector} from 'react-redux';
import firestore from '@react-native-firebase/firestore';

export default ArtistPage = ({route, navigation}) => {
  const Artist = route.params.artist;
  const [host, setHost] = useState({});
  const [artwork, setArtwork] = useState([]);

  useEffect(() => {
    //fetch images from firestore and filter the ones that have artist list inlucde Artist
    firestore()
      .collection('images')
      .where('artist', 'array-contains', Artist)
      .onSnapshot(querySnapshot => {
        const images = [];
        if (querySnapshot) {
          querySnapshot.forEach(documentSnapshot => {
            const image = documentSnapshot.data();
            images.push(image);
          });
        }
        setArtwork(images);
      });
  }, []);

  // write a script to get the first google image search reasult as the artist avatar
  const [artistAvatar, setArtistAvatar] = useState('');
  useEffect(() => {
    fetch(
      'https://www.googleapis.com/customsearch/v1?key=' +
        'AIzaSyA-8h6GZ2iXm1zZ1LQ8J7gWY0X3Uy5qG9U' +
        '&cx=' +
        '013036536707430787589:_pqjad5hr1a' +
        '&q=' +
        Artist +
        '&searchType=image',
    )
      .then(response => response.json())
      .then(responseJson => {
        if (responseJson.items) {
          setArtistAvatar(responseJson.items[0].link);
        }
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 10,
        }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            marginRight: 10,
            position: 'absolute',
            left: 20,
            top: 35,
          }}>
          <FontAwesomeIcon icon={faChevronLeft} size={20} />
        </TouchableOpacity>
      </View>
      <ScrollView>
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            marginTop: 30,
            marginBottom: -30,
            textAlign: 'center', // Add this line
          }}>
          {Artist}
        </Text>
        {/* <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 20,
          }}>
          <Avatar
            size={100}
            source={{
              uri: artistAvatar,
            }}
          />
        </View> */}

        {artwork.map(image => (
          <View key={image.id}>
            {ImageView(image, {}, false, () => {}, (showAvatar = true))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
