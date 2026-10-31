// Chains where the current user is in `field` ('participants' or 'likedBy').
import React, {useEffect, useState} from 'react';
import {Text, FlatList, TouchableOpacity} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {COLORS} from '../common/globalValues';
import * as RootNavigation from '../common/RootNavigation';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export default function ChainList({field}) {
  const [chains, setChains] = useState([]);
  const insets = useSafeAreaInsets();

  useEffect(
    () =>
      firestore()
        .collection('chains')
        .where(field, 'array-contains', auth().currentUser.uid)
        .onSnapshot(snap =>
          // sorted here to avoid needing a composite index
          setChains(
            snap
              ? snap.docs.map(d => d.data()).sort((a, b) => b.date - a.date)
              : [],
          ),
        ),
    [field],
  );

  return (
    <FlatList
      style={{backgroundColor: COLORS.primary}}
      contentContainerStyle={{paddingTop: insets.top}}
      data={chains}
      keyExtractor={c => c.id}
      renderItem={({item}) => (
        <TouchableOpacity
          onPress={() => RootNavigation.navigate('Chain', {id: item.id})}
          style={{
            backgroundColor: 'white',
            margin: 10,
            marginBottom: 0,
            padding: 16,
            borderRadius: 10,
          }}>
          <Text style={{fontSize: 16, fontWeight: 'bold'}}># {item.title}</Text>
          <Text style={{color: 'gray', marginTop: 6}}>
            {item.clips.length} 棒 · {item.likedBy?.length || 0} 赞 · 发起人 @
            {item.owner?.artName}
          </Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <Text style={{textAlign: 'center', color: 'gray', marginTop: 40}}>
          暂无
        </Text>
      }
    />
  );
}
