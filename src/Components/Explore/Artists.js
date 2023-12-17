import React, {useEffect, useState} from 'react';
import {View, Image, ScrollView, Text, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import ImageView from './ImageView';
import {useDispatch, useSelector} from 'react-redux';

// fetch artists by get images from firebase and get artist from image
export default function Artists() {
  const [artists, setArtists] = useState({});
  const navigation = useNavigation();
  const [likes, setLikes] = useState({});
  const likedImages = useSelector(state => state.user.data?.liked_images) || {};
  const dispatch = useDispatch();

  const isLiked = image => {
    return likedImages[image.id] ? true : false;
  };

  useEffect(() => {
    firestore()
      .collection('images')
      .where('public', '==', true)
      .onSnapshot(querySnapshot => {
        const artists = {};
        if (querySnapshot) {
          querySnapshot.forEach(documentSnapshot => {
            const image = documentSnapshot.data();
            if (image.artist[0]) {
              artists[image.artist[0]] = image;
            }
          });
        }
        setArtists(artists);
      });
  }, []);

  return (
    <View>
      <ScrollView>
        {Object.keys(artists).map(artist => (
          <TouchableOpacity
            key={artist}
            onPress={() =>
              navigation.navigate('ArtistPage', {
                artist: artist,
              })
            }>
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                marginTop: 30,
                marginBottom: -30,
                textAlign: 'center', // Add this line
              }}>
              {artist}
            </Text>
            {ImageView(
              artists[artist],
              likes,
              isLiked(artists[artist]),
              dispatch,
              (showAvatar = false),
              (showPrompt = 0),
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
