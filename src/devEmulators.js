// Dev only: point Firebase at the local emulators so testing never touches production.
// Start them with `firebase emulators:start --only auth,firestore,database,storage`.
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import realtime from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';

export const USE_EMULATORS = __DEV__;

// Local-emulator-only dummy account, used by the dev login button on SignIn.
export const DUMMY_ACCOUNT = {
  email: 'dummy@phantadream.test',
  password: 'emulator-only-6f3k9q',
  artName: '测试用户',
};

if (USE_EMULATORS) {
  auth().useEmulator('http://localhost:9099');
  firestore().useEmulator('localhost', 8080);
  realtime().useEmulator('localhost', 9000);
  storage().useEmulator('localhost', 9199);
}
