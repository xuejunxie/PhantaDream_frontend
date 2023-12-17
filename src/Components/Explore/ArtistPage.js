import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Avatar } from '@rneui/themed';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import ImageView from './ImageView';
import { useSelector } from 'react-redux';
import firestore from '@react-native-firebase/firestore';

export default ArtistPage = ({ route, navigation }) => {
  const hostId = route.params.id;
  const [host, setHost] = useState({});
  const [artwork, setArtwork] = useState([]);

  useEffect(() => {
    const fetchArtistData = async () => {
      const artistDoc = await firestore().collection('artists').doc(hostId).get();
      if (artistDoc.exists) {
        const artistData = artistDoc.data();
        setHost(artistData);
        if (artistData.published) {
          const artworkKeys = Object.keys(artistData.published);
          const artworkData = await Promise.all(
            artworkKeys.map(async key => {
              const imageDoc = await firestore().collection('images').doc(key).get();
              return imageDoc.data();
            })
          );
          setArtwork(artworkData);
        }
      }
    };
    fetchArtistData();
  }, [hostId]);

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <FontAwesomeIcon icon={faChevronLeft} size={20} color={'gray'} />
      </TouchableOpacity>
      <View style={{ alignItems: 'center' }}>
        <Avatar rounded size="xlarge" source={{ uri: host?.avatar }} />
        <Text>{host?.artName}</Text>
      </View>
      <ScrollView>
        {artwork.map((art, index) => (
          <ImageView key={index} image={art} />
        ))}
      </ScrollView>
    </View>
  );
};