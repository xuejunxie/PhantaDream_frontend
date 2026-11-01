// Plays a chain's clips back to back, with the 接龙 / like overlay.
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Video from 'react-native-video';
import {useSelector} from 'react-redux';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faHeart, faPlus, faPlay} from '@fortawesome/free-solid-svg-icons';
import {COLORS} from '../common/globalValues';
import {addClip, toggleLike} from './api';

export default function ChainPlayer({chain, active, height}) {
  const user = useSelector(state => state.user.data);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [uploading, setUploading] = useState(false);
  const clips = chain.clips || [];
  const clip = clips[idx % clips.length];
  const liked = chain.likedBy?.includes(auth().currentUser?.uid);

  // Restart from the first 棒 whenever the chain scrolls back into view.
  useEffect(() => {
    if (active) {
      setIdx(0);
      setPaused(false);
    }
  }, [active]);

  const relay = async () => {
    setPaused(true);
    setUploading(true);
    try {
      await addClip(user, {chainId: chain.id});
    } catch (e) {
      console.log(e);
    }
    setUploading(false);
    setPaused(false);
  };

  if (!clip) {
    return <View style={{height}} />;
  }

  return (
    <View style={{height, backgroundColor: 'black'}}>
      <TouchableWithoutFeedback onPress={() => setPaused(!paused)}>
        <View style={StyleSheet.absoluteFill}>
          <Video
            key={clip.url}
            source={{uri: clip.url}}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            paused={!active || paused}
            repeat={clips.length === 1}
            onEnd={() => setIdx((idx + 1) % clips.length)}
          />
          {paused && active && (
            <View style={styles.center}>
              <FontAwesomeIcon icon={faPlay} size={50} color="white" />
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>

      {/* progress: one segment per 棒 */}
      <View style={styles.progress}>
        {clips.map((c, i) => (
          <View
            key={c.url}
            style={[
              styles.segment,
              {opacity: i === idx % clips.length ? 1 : 0.35},
            ]}
          />
        ))}
      </View>

      <View style={styles.side}>
        <TouchableOpacity onPress={() => toggleLike(chain)} style={styles.btn}>
          <FontAwesomeIcon
            icon={faHeart}
            size={30}
            color={liked ? COLORS.red : 'white'}
          />
          <Text style={styles.btnText}>{chain.likedBy?.length || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={relay}
          disabled={uploading}
          style={styles.btn}>
          {uploading ? (
            <ActivityIndicator color="white" />
          ) : (
            <FontAwesomeIcon icon={faPlus} size={30} color="white" />
          )}
          <Text style={styles.btnText}>接龙</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.title}># {chain.title}</Text>
        <Text style={styles.meta}>
          第 {(idx % clips.length) + 1}/{clips.length} 棒 · @
          {clip.owner?.artName}
        </Text>
      </View>
    </View>
  );
}

// Stack screen: a single chain opened from Me.
export function ChainScreen({route}) {
  const {height} = useWindowDimensions();
  const [chain, setChain] = useState(null);
  useEffect(
    () =>
      firestore()
        .collection('chains')
        .doc(route.params.id)
        .onSnapshot(doc => setChain(doc?.data())),
    [route.params.id],
  );
  if (!chain) {
    return <View style={{flex: 1, backgroundColor: 'black'}} />;
  }
  return <ChainPlayer chain={chain} active height={height} />;
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progress: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    flexDirection: 'row',
  },
  segment: {
    flex: 1,
    height: 3,
    marginHorizontal: 1,
    backgroundColor: 'white',
    borderRadius: 2,
  },
  side: {position: 'absolute', right: 12, bottom: 120, alignItems: 'center'},
  btn: {alignItems: 'center', marginTop: 24},
  btnText: {color: 'white', marginTop: 4, fontSize: 13},
  info: {position: 'absolute', left: 14, right: 80, bottom: 30},
  title: {color: 'white', fontSize: 18, fontWeight: 'bold'},
  meta: {color: 'white', fontSize: 14, marginTop: 6},
});
