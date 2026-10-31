// Start a new chain: a 主题 plus the first clip (龙头).
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useSelector} from 'react-redux';
import {COLORS} from '../common/globalValues';
import * as RootNavigation from '../common/RootNavigation';
import {addClip, MAX_CLIP_SECONDS} from './api';

export default function Create() {
  const user = useSelector(state => state.user.data);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  const start = async () => {
    setUploading(true);
    try {
      const id = await addClip(user, {title: title.trim()});
      if (id) {
        setTitle('');
        RootNavigation.navigate('Chain', {id});
      }
    } catch (e) {
      Alert.alert('上传失败', String(e.message || e));
    }
    setUploading(false);
  };

  const ready = title.trim().length > 0 && !uploading;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.primary,
        padding: 24,
        justifyContent: 'center',
      }}>
      <Text style={{fontSize: 24, fontWeight: 'bold', marginBottom: 8}}>
        发起接龙
      </Text>
      <Text style={{color: 'gray', marginBottom: 24}}>
        定一个主题，拍下第一棒（≤{MAX_CLIP_SECONDS} 秒），其他人接着拍下去。
      </Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="主题，例如：一句话接力讲故事"
        maxLength={40}
        style={{
          backgroundColor: 'white',
          borderRadius: 10,
          padding: 14,
          fontSize: 16,
        }}
      />
      <TouchableOpacity
        onPress={start}
        disabled={!ready}
        style={{
          marginTop: 20,
          borderRadius: 10,
          padding: 16,
          alignItems: 'center',
          backgroundColor: ready ? COLORS.red : 'lightgray',
        }}>
        {uploading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>
            拍第一棒
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
