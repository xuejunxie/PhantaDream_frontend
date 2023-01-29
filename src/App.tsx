import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {LogBox} from 'react-native';

import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import Explore from './Components/Explore/Explore';
import Dream from './Components/Dream/Dream';
import Profile from './Components/Profile/Profile';
import {COLORS} from './Components/common/globalValues';
import Market from './Components/Market/Market';
import DeviceInfo from 'react-native-device-info';

import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faUser,
  faPaperPlane,
  faMagic,
  faGlobe,
  faExchangeAlt,
} from '@fortawesome/free-solid-svg-icons';

import SignIn from './Components/Auth/SignIn';
import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {UPDATE_USER} from './redux/types';
import realtime from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {navigationRef} from './Components/common/RootNavigation';
import UserPage from './Components/Explore/UserPage';
import editData from './editData';

LogBox.ignoreAllLogs();

// const Activecolor =
function Home(): JSX.Element {
  // Get user liked images

  const dispatch = useDispatch();

  useEffect(() => {
    editData();
  }, []);

  useEffect(() => {
    realtime()
      .ref('users/' + auth().currentUser.uid)
      .on('value', snapshot => {
        var user = snapshot.val();
        dispatch({type: UPDATE_USER, payload: user});
      });
  }, []);

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
        component={Market}
      /> */}
      {/* <Tab.Screen
        name="PhantaSpace"
        options={{
          tabBarLabel: 'PhantaSpace',
          tabBarIcon: ({color}) => (
            <FontAwesomeIcon icon={faGlobe} color={color} size={20} />
          ),
        }}
        component={Market}
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
  useEffect(() => {
    console.log(DeviceInfo.getDeviceId());
  }, []);

  const userData = useSelector(state => state.user?.data);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={auth().currentUser && userData ? 'Home' : 'Auth'}
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Auth" component={SignIn} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="UserPage" component={UserPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
