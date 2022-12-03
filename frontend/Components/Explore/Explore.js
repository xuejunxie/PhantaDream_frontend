import * as React from "react";
import { View, useWindowDimensions } from "react-native";
import { TabView, TabBar, SceneMap } from "react-native-tab-view";
import { getDefaultHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaFrame, useSafeAreaInsets } from "react-native-safe-area-context";
import COLORS from "../GlobalValues/Colors";

const FirstRoute = () => <View style={{ flex: 1, backgroundColor: COLORS.primary }} />;

const SecondRoute = () => <View style={{ flex: 1, backgroundColor: "gray" }} />;

const ThirdRoute = () => <View style={{ flex: 1, backgroundColor: "black" }} />;

const renderScene = SceneMap({
  first: FirstRoute,
  second: SecondRoute,
  third: ThirdRoute,
});

export default function Explore() {
  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "first", title: "Artist" },
    { key: "second", title: "Creator" },
    { key: "third", title: "For you" },
  ]);

  const frame = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const headerHeight = getDefaultHeaderHeight(frame, false, insets.top);

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: "gray" }}
      style={{ backgroundColor: COLORS.primary }}
      activeColor="black"
      inactiveColor="gray"
    />
  );

  return (
    <TabView
      navigationState={{ index, routes }}
      tabBarPosition="bottom"
      renderTabBar={renderTabBar}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
    />
  );
}
