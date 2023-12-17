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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesomeIcon icon={faChevronLeft} size={20} />
        </TouchableOpacity>
        <Text style={{fontSize: 20, marginLeft: 10}}>{Artist}</Text>
      </View>
      <ScrollView>
        {artwork.map(image => (
          <TouchableOpacity
            key={image.id}
            onPress={() =>
              navigation.navigate('Image', {
                image: image,
              })
            }>
            {ImageView(image, {}, false, () => {}, (showAvatar = false))}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
