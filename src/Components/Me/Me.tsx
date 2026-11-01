import * as React from 'react';
import {useWindowDimensions} from 'react-native';
import {TabView, TabBar, SceneMap} from 'react-native-tab-view';
import {getDefaultHeaderHeight} from '@react-navigation/elements';
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {COLORS} from '../common/globalValues';

import ChainList from '../Chain/ChainList';
import Liked from './Liked';
import Account from './Account';

const FirstRoute = () => <ChainList field="participants" />;

const SecondRoute = () => <ChainList field="likedBy" />;

const ThirdRoute = () => <Liked />;

const ForthRoute = () => <Account />;

const renderScene = SceneMap({
  first: FirstRoute,
  second: SecondRoute,
  third: ThirdRoute,
  forth: ForthRoute,
});

export default function Me() {
  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: 'first', title: '我的接龙'},
    {key: 'second', title: '赞过'},
    // {key: 'third', title: 'Messages'},
    {key: 'forth', title: '账号'},
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
