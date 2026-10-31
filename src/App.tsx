import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {Alert, LogBox} from 'react-native';

import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import Feed from './Components/Chain/Feed';
import Create from './Components/Chain/Create';
import {ChainScreen} from './Components/Chain/ChainPlayer';
import Me from './Components/Me/Me';
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
  faMagnifyingGlass,
  faEnvelope,
  faBrain,
  faMagicWandSparkles,
  faWandMagicSparkles,
  faHandsBubbles,
  faWalkieTalkie,
  faFileWord,
  faSms,
  faComment,
  faComments,
  faCommentAlt,
  faPlay,
  faPlus,
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
import ArtistPage from './Components/Explore/ArtistPage';
import editData from './editData';
import Notification from './Components/Notification/Notification';
import Chat from './Components/Notification/Chat';
import {CacheManager} from '@georstat/react-native-image-cache';
import {Dirs} from 'react-native-file-access';
CacheManager.config = {
  baseDir: `${Dirs.CacheDir}/images_cache/`,
  blurRadius: 15,
  cacheLimit: 0,
  sourceAnimationDuration: 1000,
  thumbnailAnimationDuration: 1000,
};

LogBox.ignoreAllLogs();

// const Activecolor =
function Home(): JSX.Element {
  // Get user liked images

  const dispatch = useDispatch();

  useEffect(() => {
    editData();
  }, []);

  useEffect(() => {
    if (auth().currentUser) {
      realtime()
        .ref('users/' + auth().currentUser.uid)
        .on('value', snapshot => {
          var user = snapshot.val();
          dispatch({type: UPDATE_USER, payload: user});
        });
    }
  }, []);

  return (
    <Tab.Navigator
      shifting={false}
      activeColor="#315399"
      // inactiveColor="#3e2465"
      barStyle={{backgroundColor: COLORS.primary}}>
      <Tab.Screen
        name="Feed"
        options={{
          tabBarLabel: '接龙',
          tabBarIcon: ({color}) => (
            <FontAwesomeIcon icon={faPlay} color={color} size={20} />
          ),
        }}
        component={Feed}
      />
      <Tab.Screen
        name="Create"
        options={{
          tabBarLabel: '发起',
          tabBarIcon: ({color}) => (
            <FontAwesomeIcon icon={faPlus} color={color} size={20} />
          ),
        }}
        component={Create}
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
          tabBarLabel: 'Phanta Space',
          tabBarIcon: ({color}) => (
            <FontAwesomeIcon icon={faGlobe} color={color} size={20} />
          ),
        }}
        component={Market}
      /> */}
      {/* <Tab.Screen
        name="Notification"
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({color}) => (
            <FontAwesomeIcon icon={faCommentAlt} color={color} size={20} />
          ),
        }}
        component={Notification}
      /> */}

      <Tab.Screen
        name="Me"
        options={{
          tabBarLabel: '我',
          tabBarIcon: ({color}) => (
            <FontAwesomeIcon icon={faUser} color={color} size={20} />
          ),
        }}
        component={Me}
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
        <Stack.Screen name="Chat" component={Chat} />
        <Stack.Screen name="ArtistPage" component={ArtistPage} />
        <Stack.Screen name="Chain" component={ChainScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
