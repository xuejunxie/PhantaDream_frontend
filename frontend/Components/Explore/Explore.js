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

const dummy = require('./dummy.json');
const size = 280;
const render_dummy = (start, end) =>
  dummy.slice(start, end).map((item, index) => (
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

const FirstRoute = () => <ScrollView>{render_dummy(0, 4)}</ScrollView>;

const SecondRoute = () => <ScrollView>{render_dummy(4, 8)}</ScrollView>;

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
    {key: 'first', title: 'Leaderboard'},
    {key: 'second', title: 'Following'},
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
