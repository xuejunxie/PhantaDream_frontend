import React, {useState} from 'react';
import {View, Text, Image} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {Neomorph} from 'react-native-neomorph-shadows';
import {COLORS, SIZES, defaultAvatar} from '../common/globalValues';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};
import {faHeart} from '@fortawesome/free-solid-svg-icons';
import {faHeart as faHeartO} from '@fortawesome/free-regular-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import like from '../common/like';
import * as RootNavigation from '../common/RootNavigation';
import {useRoute} from '@react-navigation/native';
import {CachedImage} from '@georstat/react-native-image-cache';

const ImageView = (image, likes, liked, dispatch, showAvatar) => {
  const [imageButton, setImageButton] = useState(false);

  var lastTap = null;
  const handleDoubleTap = (image, liked, dispatch) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (lastTap && now - lastTap < DOUBLE_PRESS_DELAY) {
      like(image, liked, dispatch);
    } else {
      setImageButton(true);

      lastTap = now;
    }
  };

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
          handleDoubleTap(image, liked, dispatch);
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
          <CachedImage
            source={image.url}
            style={{
              width: SIZES.canvas,
              height: SIZES.canvas,
              borderRadius: 10,
              overflow: 'hidden',
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
          <TouchableWithoutFeedback
            onPress={() => {
              RootNavigation.navigate('UserPage', {
                id: image.owner.id,
              });
            }}>
            {showAvatar && (
              <View
                style={{
                  color: COLORS.red,
                  fontSize: 15,
                  marginTop: 10,
                  flex: 1,
                  alignSelf: 'flex-start',
                  flexDirection: 'row',
                }}>
                <CachedImage
                  source={
                    image?.owner?.avatar !== ''
                      ? image.owner.avatar
                      : defaultAvatar
                  }
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    overflow: 'hidden',
                  }}
                  resizeMode="cover"
                />
                <Text
                  style={{
                    color: 'gray',
                    fontSize: 15,
                    marginLeft: 10,
                    textAlign: 'center',
                    alignSelf: 'center',
                  }}>
                  {image.owner.artName}
                </Text>
              </View>
            )}
          </TouchableWithoutFeedback>

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
        <Text style={{color: 'gray', fontSize: 15, marginTop: 10}}>
          {image.prompt}
        </Text>
      </View>
    </View>
  );
};

export default ImageView;
