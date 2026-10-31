// 接龙 data model: one Firestore doc per chain, clips appended inline.
// chains/{id}: {id, title, owner, date, clips: [{url, owner, date}], participants: [uid], likedBy: [uid]}
// ponytail: clips live in the chain doc (1MB cap ≈ a few thousand clips); move to a subcollection if chains get that long.
import {Alert} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

export const MAX_CLIP_SECONDS = 15;

const pickerOptions = {
  mediaType: 'video',
  durationLimit: MAX_CLIP_SECONDS,
  videoQuality: 'medium',
};

// Ask camera vs library, resolve with a picked video asset or null.
function pickVideo() {
  return new Promise(resolve => {
    const done = res => {
      const asset = res.assets?.[0];
      if (!asset) {
        return resolve(null);
      }
      // Library picks ignore durationLimit, so enforce it here.
      if (asset.duration > MAX_CLIP_SECONDS + 0.5) {
        Alert.alert(`视频不能超过 ${MAX_CLIP_SECONDS} 秒`);
        return resolve(null);
      }
      resolve(asset);
    };
    Alert.alert('添加视频', null, [
      {text: '拍摄', onPress: () => launchCamera(pickerOptions, done)},
      {
        text: '从相册选择',
        onPress: () => launchImageLibrary(pickerOptions, done),
      },
      {text: '取消', style: 'cancel', onPress: () => resolve(null)},
    ]);
  });
}

// Pick a clip and append it to chain `chainId`, or start a new chain titled `title`.
// Returns the chain id, or null if the user cancelled.
export async function addClip(user, {chainId, title} = {}) {
  const asset = await pickVideo();
  if (!asset) {
    return null;
  }

  const uid = auth().currentUser.uid;
  const owner = {id: uid, artName: user?.artName || ''};
  const ref = chainId
    ? firestore().collection('chains').doc(chainId)
    : firestore().collection('chains').doc();

  const file = storage().ref(`chains/${ref.id}/${Date.now()}_${uid}.mp4`);
  await file.putFile(asset.uri);
  const clip = {url: await file.getDownloadURL(), owner, date: Date.now()};

  if (chainId) {
    await ref.update({
      clips: firestore.FieldValue.arrayUnion(clip),
      participants: firestore.FieldValue.arrayUnion(uid),
    });
  } else {
    await ref.set({
      id: ref.id,
      title,
      owner,
      date: clip.date,
      clips: [clip],
      participants: [uid],
      likedBy: [],
    });
  }
  return ref.id;
}

export function toggleLike(chain) {
  const uid = auth().currentUser.uid;
  const liked = chain.likedBy?.includes(uid);
  return firestore()
    .collection('chains')
    .doc(chain.id)
    .update({
      likedBy: liked
        ? firestore.FieldValue.arrayRemove(uid)
        : firestore.FieldValue.arrayUnion(uid),
    });
}
