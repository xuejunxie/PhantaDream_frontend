import React, {useRef, useState} from 'react';
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

const ChatUI = ({route, navigation}) => {
  const {name, avatar, id} = route.params;
  const messages = useSelector(state => state.user?.data?.messages)?.[id];
  const [neomorphHeight, setNeomorphHeight] = useState(40); //initial height of Neomorph

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
      style={{
        backgroundColor: COLORS.primary,
        flex: 1,
      }}>
      <View
        style={{
          height: '100%',
          width: '100%',
          backgroundColor: COLORS.primary,
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
          }}>
          {Object.keys(messages)
            .sort((a, b) => a - b)
            .map(key => {
              return (
                <View
                  key={key}
                  style={{
                    margin: 10,
                  }}>
                  <NeomorphFlex
                    // lightShadowColor="white"
                    // darkShadowColor="gray"
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
                      <Text
                        style={{
                          color: 'black',
                          margin: 10,
                          fontSize: 18,
                          textAlign: messages[key].send ? 'right' : 'left',
                        }}>
                        {messages[key].message}
                        {'test'}
                      </Text>
                    </View>
                  </NeomorphFlex>
                </View>
              );
            })}
        </ScrollView>
        <View
          style={{
            width: '100%',
            position: 'absolute',
            bottom: 0,
            marginBottom: 30,
            alignItems: 'center',
          }}>
          <Neomorph
            inner={true}
            style={{
              shadowRadius: 3,
              borderRadius: 15,
              backgroundColor: COLORS.primary,
              width: 360,
              height: neomorphHeight, //dynamic height based on input text length
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <TextInput
              returnKeyType="send"
              placeholder="Type your message"
              onContentSizeChange={({nativeEvent}) =>
                setNeomorphHeight(Math.max(40, nativeEvent.contentSize.height))
              }
              multiline={true} //allow multiple lines of text
              style={{width: '100%', color: 'black', padding: 10, fontSize: 18}}
            />
          </Neomorph>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
export default ChatUI;
