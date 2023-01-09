import * as React from 'react';
import {View, useWindowDimensions, Image, ScrollView} from 'react-native';
import {TabView, TabBar, SceneMap} from 'react-native-tab-view';
import {getDefaultHeaderHeight} from '@react-navigation/elements';
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {Neomorph} from 'react-native-neomorph-shadows';

import COLORS from '../GlobalValues/Colors';
import Hot from './Hot';
import Liked from './Liked';
import ForYou from './ForYou';

const dummy = require('./dummy.json');
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
          shadowRadius: 10,
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

const FirstRoute = () => <ForYou />;

const SecondRoute = () => <Hot />;

const ThirdRoute = () => <ScrollView>{render_dummy(8, 12)}</ScrollView>;

const renderScene = SceneMap({
  first: FirstRoute,
  second: SecondRoute,
  third: ThirdRoute,
});

export default function Explore() {
  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: 'first', title: 'For you'},
    {key: 'second', title: 'Hot'},
    {key: 'third', title: 'Private club'},
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
