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
        {artwork.map(image => (
          <View key={image.id}>
            {ImageView(image, {}, false, () => {}, (showAvatar = true))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
