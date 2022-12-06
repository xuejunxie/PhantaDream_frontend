import React, {useState} from 'react';
import {View, ScrollView, Text, Image, PixelRatio} from 'react-native';
import {TextInput} from 'react-native-paper';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {Neomorph} from 'react-native-neomorph-shadows';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import COLORS from '../GlobalValues/Colors';
import axios from 'axios';
import {Buffer} from 'buffer';

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const loading_image = 'https://i.gifer.com/1amw.gif';

const size = 350;

export default function Dream() {
  const [value, onChangeText] = React.useState('');
  const [imageURI, setImageURI] = useState(
    'https://cdn.midjourney.com/b4084579-d79e-4533-8825-27642f069c85/grid_0_640_N.webp',
  );
  const [pressed, setPressed] = useState(false);
  const [loading, setLoading] = useState(false);
  // const nativeName = useMemo(() => getNativeByChain(options?.chain || chainId), [options, chainId]);
  return (
    <View
      style={{width: '100%', height: '100%', backgroundColor: COLORS.primary}}>
      <ScrollView>
        <View
          style={{
            backgroundColor: 'rgba(0,0,0,0)',
            marginTop: 30,

            // make it center
            alignItems: 'center',
          }}>
          <Neomorph
            style={{
              shadowRadius: 10,
              borderRadius: 25,
              backgroundColor: COLORS.primary,
              width: size,
              height: size,
              marginTop: 20,
            }}>
            <Image
              source={{
                uri: loading ? loading_image : imageURI,
              }}
              style={{
                width: size,
                height: size,

                borderRadius: 25,
              }}></Image>
          </Neomorph>
        </View>
        <View
          style={{
            marginTop: 20,
            backgroundColor: 'rgba(0,0,0,0)',
          }}>
          <TextInput
            multiline={true}
            onChangeText={text => onChangeText(text)}
            value={value}
            style={{
              backgroundColor: 'rgba(0,0,0,0)',
              // align text to center
              textAlign: 'center',
            }}
            placeholder="🤯 Write down your dream here"
          />
        </View>

        <View
          style={{
            backgroundColor: 'rgba(0,0,0,0)',
            marginTop: 20,

            // make it center
            alignItems: 'center',
          }}>
          <TouchableWithoutFeedback
            onPressIn={() => {
              setPressed(true);
              setLoading(true);
              //haptic feedback
              ReactNativeHapticFeedback.trigger('impactMedium', options);

              // get a image with axios
              // axios
              //   .get('https://phanta.space/favicon.png', {
              //     responseType: 'arraybuffer',
              //   })
              //   .then(response => {
              //     const image_data = Buffer.from(
              //       response.data,
              //       'binary',
              //     ).toString('base64');

              //     const image_uri = `data:image/png;base64,${image_data}`;
              //     setImageURI(image_uri);
              //   });

              axios
                .post(
                  'http://phantaspace.ddns.net:7863/txt2img',
                  {prompt: value},
                  {responseType: 'arraybuffer'},
                )
                .then(function (response) {
                  const image_data = Buffer.from(
                    response.data,
                    'binary',
                  ).toString('base64');
                  setImageURI(`data:image/png;base64,${image_data}`);
                  setLoading(false);
                });
            }}
            onPressOut={() => setPressed(false)}>
            <Neomorph
              inner={pressed}
              style={{
                shadowRadius: 10,
                borderRadius: 25,
                backgroundColor: COLORS.primary,
                width: 200,
                height: 50,
                marginTop: 20,
              }}>
              <Text
                style={{
                  fontSize: 20,
                  color: 'black',
                  textAlign: 'center',
                  marginTop: 10,
                }}>
                Dream
              </Text>
            </Neomorph>
          </TouchableWithoutFeedback>
        </View>
        <View
          style={{
            backgroundColor: 'rgba(0,0,0,0)',
            marginTop: 30,

            // make it center
            alignItems: 'center',
          }}>
          <Neomorph
            style={{
              shadowRadius: 10,
              borderRadius: 25,
              backgroundColor: COLORS.primary,
              width: size,
              height: size,
              marginTop: 20,
            }}>
            <Image
              source={{
                uri: 'https://cdn.midjourney.com/b4084579-d79e-4533-8825-27642f069c85/grid_0_640_N.webp',
              }}
              style={{
                width: size,
                height: size,

                borderRadius: 25,
              }}></Image>
          </Neomorph>
        </View>
      </ScrollView>
    </View>
  );
}
