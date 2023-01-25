import React from 'react';
import {View, Text, Image} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {Neomorph} from 'react-native-neomorph-shadows';
import {COLORS, SIZES} from '../common/globalValues';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};
import {faHeart} from '@fortawesome/free-solid-svg-icons';
import {faHeart as faHeartO} from '@fortawesome/free-regular-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import like from '../common/like';
import {useDispatch} from 'react-redux';

const ImageView = (image, likes, liked, avatars, artNames, dispatch) => {
  // get owner avatar url

  return (
    <View
      key={image.id}
      style={{
        backgroundColor: 'rgba(0,0,0,0)',
        marginTop: 30,
        // make it center
        alignItems: 'center',
      }}>
      <TouchableWithoutFeedback
        onPress={() => {
          like(image, liked, dispatch);
          ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
        }}>
        <Neomorph
          key={image.id}
          style={{
            shadowRadius: 5,
            borderRadius: 10,
            backgroundColor: COLORS.primary,
            width: SIZES.canvas,
            height: SIZES.canvas,
            margin: 10,
          }}>
          <Image
            source={{uri: image.url}}
            style={{
              width: SIZES.canvas,
              height: SIZES.canvas,
              borderRadius: 10,
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 50,
              height: 50,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
            {liked ? (
              <FontAwesomeIcon icon={faHeart} size={25} color={COLORS.red} />
            ) : (
              <FontAwesomeIcon icon={faHeartO} size={25} color={'gray'} />
            )}
          </View>
        </Neomorph>
      </TouchableWithoutFeedback>
      <View
        style={{
          width: SIZES.canvas,
        }}>
        <View style={{flexDirection: 'row'}}>
          <View
            style={{
              color: COLORS.red,
              fontSize: 15,
              marginTop: 10,
              flex: 1,
              alignSelf: 'flex-start',
              flexDirection: 'row',
            }}>
            <Image
              source={{
                uri: avatars[image.owner],
              }}
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
              }}
            />
            <Text
              style={{
                color: 'gray',
                fontSize: 15,
                marginLeft: 10,
                textAlign: 'center',
                alignSelf: 'center',
              }}>
              {artNames[image.owner]}
            </Text>
            <Text
              style={{
                color: COLORS.red,
                fontSize: 15,
                marginTop: 10,
                flex: 1,
                textAlign: 'right',
                alignSelf: 'center',
              }}>
              Likes: {likes[image.id] ? likes[image.id] : image.likes}
            </Text>
          </View>
        </View>
        <Text style={{color: 'gray', fontSize: 15, marginTop: 10}}>
          Prompt: {image.prompt}
        </Text>
      </View>
    </View>
  );
};

export default ImageView;
