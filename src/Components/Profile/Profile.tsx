import * as React from 'react';
import {useWindowDimensions} from 'react-native';
import {TabView, TabBar, SceneMap} from 'react-native-tab-view';
import {getDefaultHeaderHeight} from '@react-navigation/elements';
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {COLORS} from '../common/globalValues';

import Published from './Published';
import Liked from './Liked';
import Settings from './Settings';

const FirstRoute = () => <Published />;

const SecondRoute = () => <Liked />;

const ThirdRoute = () => null;

const ForthRoute = () => null;

const FifthRoute = () => <Settings />;

const renderScene = SceneMap({
  first: FirstRoute,
  second: SecondRoute,
  third: ThirdRoute,
  fourth: ForthRoute,
  fifth: FifthRoute,
});

export default function Profile() {
  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: 'first', title: 'Published'},
    {key: 'second', title: 'Liked'},
    // {key: 'third', title: 'Minted'},
    // {key: 'fourth', title: 'Private club'},
    // {key: 'fifth', title: 'Settings'},
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
