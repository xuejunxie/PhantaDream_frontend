// Full-screen vertical feed of chains, newest first.
import React, {useEffect, useRef, useState} from 'react';
import {View, Text, FlatList} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {useIsFocused} from '@react-navigation/native';
import ChainPlayer from './ChainPlayer';

const PAGE = 10;

export default function Feed() {
  const [chains, setChains] = useState([]);
  const [limit, setLimit] = useState(PAGE);
  const [height, setHeight] = useState(0);
  const [activeId, setActiveId] = useState(null);
  const focused = useIsFocused();

  // ponytail: grows one live query by PAGE; switch to cursor pagination if feeds get long.
  useEffect(
    () =>
      firestore()
        .collection('chains')
        .orderBy('date', 'desc')
        .limit(limit)
        .onSnapshot(snap =>
          setChains(snap ? snap.docs.map(d => d.data()) : []),
        ),
    [limit],
  );

  const onViewable = useRef(({viewableItems}) => {
    if (viewableItems[0]) {
      setActiveId(viewableItems[0].item.id);
    }
  }).current;

  return (
    <View
      style={{flex: 1, backgroundColor: 'black'}}
      onLayout={e => setHeight(e.nativeEvent.layout.height)}>
      {height > 0 && (
        <FlatList
          data={chains}
          keyExtractor={c => c.id}
          renderItem={({item}) => (
            <ChainPlayer
              chain={item}
              height={height}
              active={focused && (activeId ?? chains[0]?.id) === item.id}
            />
          )}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          getItemLayout={(_, i) => ({
            length: height,
            offset: height * i,
            index: i,
          })}
          windowSize={3}
          onViewableItemsChanged={onViewable}
          viewabilityConfig={{itemVisiblePercentThreshold: 80}}
          onEndReached={() => chains.length >= limit && setLimit(limit + PAGE)}
          ListEmptyComponent={
            <Text
              style={{
                color: 'white',
                textAlign: 'center',
                marginTop: height / 2,
              }}>
              还没有接龙，去「发起」开第一条吧
            </Text>
          }
        />
      )}
    </View>
  );
}
