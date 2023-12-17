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
              navigation.navigate('Artist', {
                artist: artist,
              })
            }>
            {ImageView(
              artists[artist],
              likes,
              isLiked(image),
              dispatch,
              (showAvatar = false),
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
