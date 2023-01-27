import React, {useState} from 'react';
import {View, Text, useWindowDimensions, Image, ScrollView} from 'react-native';
import {TabView, TabBar, SceneMap} from 'react-native-tab-view';
import {getDefaultHeaderHeight} from '@react-navigation/elements';
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {Neomorph} from 'react-native-neomorph-shadows';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import {COLORS} from '../common/globalValues';
import {Button} from 'react-native';

const dummy = require('../Explore/dummy.json');
const size = 280;
const render_dummy = (start, end) =>
  dummy.slice(start, end).map((item, index) => (
    <View
      key={index}
      style={{
        backgroundColor: 'rgba(0,0,0,0)',
        marginTop: 30,

        // make it center
        alignItems: 'center',
      }}>
      <Neomorph
        style={{
          shadowRadius: 5,
          borderRadius: 25,
          backgroundColor: COLORS.primary,
          width: size,
          height: size,
          marginTop: 20,
        }}>
        <Image
          source={{
            uri: item.uri,
          }}
          style={{
            width: size,
            height: size,

            borderRadius: 25,
          }}></Image>
      </Neomorph>
    </View>
  ));

const FirstRoute = () => {
  const [pressed, setPressed] = useState(false);
  const options = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
  };
  return (
    <ScrollView>
      {render_dummy(17, 18)}

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
            //haptic feedback
            ReactNativeHapticFeedback.trigger('impactMedium', options);
          }}
          onPressOut={() => setPressed(false)}>
          <Neomorph
            inner={pressed}
            style={{
              shadowRadius: 5,
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
              Mint
            </Text>
          </Neomorph>
        </TouchableWithoutFeedback>
        <Text
          style={{
            fontSize: 20,
            color: 'black',
            textAlign: 'center',
            marginTop: 20,
          }}>
          Distribution: Artists 10% + ❤️er 10% + Creator 77.5 % + Platform 2.5%
        </Text>
      </View>
    </ScrollView>
  );
};

const SecondRoute = () => <ScrollView>{render_dummy(14, 17)}</ScrollView>;

const ThirdRoute = () => <ScrollView>{render_dummy(12, 14)}</ScrollView>;

const ForthRoute = () => <ScrollView>{render_dummy(18, 20)}</ScrollView>;

const renderScene = SceneMap({
  first: FirstRoute,
  second: SecondRoute,
  third: ThirdRoute,
  forth: ForthRoute,
});

export default function Market() {
  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: 'first', title: 'Mint'},
    {key: 'second', title: 'Auction'},
    {key: 'third', title: 'Owned'},
    {key: 'forth', title: 'Shop'},
  ]);

  const frame = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const headerHeight = getDefaultHeaderHeight(frame, false, insets.top);

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{backgroundColor: 'gray'}}
      style={{backgroundColor: COLORS.primary}}
      activeColor="black"
      inactiveColor="gray"
    />
  );

  return (
    <TabView
      navigationState={{index, routes}}
      tabBarPosition="bottom"
      renderTabBar={renderTabBar}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{width: layout.width}}
      style={{backgroundColor: COLORS.primary}}
    />
  );
}
