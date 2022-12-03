import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {LogBox} from 'react-native';

import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import Explore from './Components/Explore/Explore';
import Dream from './Components/Dream/Dream';
import Profile from './Components/Profile/Profile';
import COLORS from './Components/GlobalValues/Colors';

import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faUser,
  faPaperPlane,
  faMagic,
  faGlobe,
  faExchangeAlt,
} from '@fortawesome/free-solid-svg-icons';

LogBox.ignoreAllLogs();

// const Activecolor =
function Home(): JSX.Element {
  return (
    <Tab.Navigator
      shifting={false}
      activeColor="#315399"
      // inactiveColor="#3e2465"
      barStyle={{backgroundColor: COLORS.primary}}>
      <Tab.Screen
        name="Dream"
        options={{
          tabBarLabel: 'Dream',
          tabBarIcon: ({color, focused}) => {
            return <FontAwesomeIcon icon={faMagic} color={color} size={20} />;
          },
        }}
        component={Dream}
      />
      <Tab.Screen
        name="Explorer"
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({color}) => (
            <FontAwesomeIcon icon={faPaperPlane} color={color} size={20} />
          ),
        }}
        component={Explore}
      />
      {/* <Tab.Screen
        name="Market"
        options={{
          tabBarLabel: 'Market',
          tabBarIcon: ({color, focused}) => {
            return (
              <FontAwesomeIcon icon={faExchangeAlt} color={color} size={20} />
            );
          },
        }}
        component={NFTAssets}
      /> */}
      {/* <Tab.Screen
        name="PhantaSpace"
        options={{
          tabBarLabel: 'PhantaSpace',
          tabBarIcon: ({color}) => (
            <FontAwesomeIcon icon={faGlobe} color={color} size={20} />
          ),
        }}
        component={Transfer}
      /> */}

      <Tab.Screen
        name="Profile"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({color}) => (
            <FontAwesomeIcon icon={faUser} color={color} size={20} />
          ),
        }}
        component={Profile}
      />
    </Tab.Navigator>
  );
}

const Tab = createMaterialBottomTabNavigator();
const Stack = createStackNavigator();

function App(): JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Auth"
        screenOptions={{
          headerShown: false,
        }}>
        {/* Auth Navigator: Include Login and Signup */}
        {/* <Stack.Screen
          name="Auth"
          component={CryptoAuth}
          options={{headerShown: false}}
        /> */}
        {/* Navigation Drawer as a landing page */}
        <Stack.Screen
          name="DrawerNavigationRoutes"
          component={Home}
          // Hiding header for Navigation Drawer
          // options={{headerTitle: props => <Header />}}
          // options={({route}) => ({
          //   headerTitle: getHeaderTitle(route),
          // })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
