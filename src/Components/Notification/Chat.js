import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  scrollView,
} from 'react-native';
import {Neomorph, NeomorphFlex} from 'react-native-neomorph-shadows';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faChevronLeft, faUserCircle} from '@fortawesome/free-solid-svg-icons';
import {useSelector} from 'react-redux';
import {COLORS, defaultAvatar} from '../common/globalValues';
import {ScrollView} from 'react-native-gesture-handler';
import realtime from '@react-native-firebase/database';
import {Avatar} from '@rneui/themed';
import {CachedImage} from '@georstat/react-native-image-cache';

const ChatUI = ({route, navigation}) => {
  const {name, avatar, id} = route.params;
  const messages = useSelector(state => state.user?.data?.messages)?.[id];
  const myAvatar = useSelector(state => state.user?.data?.avatar);
  const [inputText, setInputText] = useState(''); //initial text of TextInput
  const scrollViewRef = useRef();

  useEffect(() => {
    scrollViewRef.current.scrollToEnd({animated: true});
  }, []);

  return (
    <View
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: COLORS.primary,
      }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        style={{
          backgroundColor: COLORS.primary,
          flex: 1,
        }}>
        <TouchableOpacity
          onPress={() => {
            // go back to previous page
            navigation.goBack();
          }}
          style={{
            marginRight: 10,
            position: 'absolute',
            left: 40,
            top: 60,
          }}>
          <FontAwesomeIcon icon={faChevronLeft} size={20} color={'gray'} />
        </TouchableOpacity>
        <ScrollView
          style={{
            marginTop: 100,
          }}
          ref={scrollViewRef}
          onLayout={() => scrollViewRef.current.scrollToEnd({animated: true})}>
          {Object.keys(messages)
            .sort((a, b) => a - b)
            .map(key => {
              return (
                <View
                  key={key}
                  style={{
                    margin: 8,
                  }}>
                  <NeomorphFlex
                    inner={false}
                    style={{
                      alignSelf: messages[key].send ? 'flex-end' : 'flex-start',
                      shadowRadius: 3,
                      borderRadius: 15,
                      backgroundColor: COLORS.primary,
                    }}>
                    <View
                      style={{
                        maxWidth: 300,
                        alignSelf: 'flex-start',
                        borderRadius: 15,
                        backgroundColor: messages[key].send
                          ? COLORS.blue
                          : COLORS.primary,
                      }}>
                      <View
                        style={{
                          padding: 2,
                          flexDirection: messages[key].send
                            ? 'row-reverse'
                            : 'row',
                        }}>
                        <View
                          style={{
                            justifyContent: 'center',
                          }}>
                          <CachedImage
                            style={{
                              height: 30,
                              width: 30,
                              borderRadius: 15,
                              overflow: 'hidden',
                            }}
                            resizeMode="cover"
                            source={messages[key].send ? myAvatar : avatar}
                          />
                        </View>
                        <Text
                          style={{
                            color: 'black',
                            margin: 5,
                            maxWidth: 270,
                            fontSize: 18,
                            textAlign: messages[key].send ? 'right' : 'left',
                          }}>
                          {messages[key].message}
                        </Text>
                      </View>
                    </View>
                  </NeomorphFlex>
                </View>
              );
            })}
        </ScrollView>
        <View
          style={{
            width: '100%',
            bottom: 0,
            marginBottom: 30,
            alignItems: 'center',
          }}>
          <NeomorphFlex
            inner={true}
            style={{
              shadowRadius: 3,
              borderRadius: 15,
              backgroundColor: COLORS.primary,
              width: 360,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <TextInput
              returnKeyType="send"
              placeholder="Type your message"
              multiline={true} //allow multiple lines of text
              style={{
                width: '100%',
                maxHeight: 200,
                color: 'black',
                padding: 10,
                margin: 5,
                fontSize: 18,
              }}
              onChangeText={text => setInputText(text)}
              value={inputText}
              onSubmitEditing={() => {
                realtime()
                  .ref(
                    `/users/${id}/messages/${
                      auth().currentUser.uid
                    }/${new Date().getTime()}/`,
                  )
                  .set({
                    message: inputText,
                    timestamp: new Date().getTime(),
                    read: false,
                    send: false,
                  });
                realtime()
                  .ref(
                    `/users/${
                      auth().currentUser.uid
                    }/messages/${id}/${new Date().getTime()}/`,
                  )
                  .set({
                    message: inputText,
                    timestamp: new Date().getTime(),
                    read: true,
                    send: true,
                  });
                setInputText('');
              }}
            />
          </NeomorphFlex>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};
export default ChatUI;
