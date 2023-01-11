import * as React from 'react';
import {useWindowDimensions} from 'react-native';
import {TabView, TabBar, SceneMap} from 'react-native-tab-view';
import {getDefaultHeaderHeight} from '@react-navigation/elements';
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {COLORS} from '../common/globalValues';
import Hot from './Hot';
import ForYou from './ForYou';

const FirstRoute = () => <ForYou />;

const SecondRoute = () => <Hot />;

const renderScene = SceneMap({
  first: FirstRoute,
  second: SecondRoute,
});

export default function Explore() {
  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: 'first', title: 'For you'},
    {key: 'second', title: 'Hot'},
    // {key: 'third', title: 'Liked'},
    // {key: 'fourth', title: 'Published'},
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
