import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  scrollView,
} from 'react-native';
import {Neomorph} from 'react-native-neomorph-shadows';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faChevronLeft, faUserCircle} from '@fortawesome/free-solid-svg-icons';
import {useSelector} from 'react-redux';
import {COLORS, defaultAvatar} from '../common/globalValues';
import {ScrollView} from 'react-native-gesture-handler';

const ChatUI = ({route, navigation}) => {
  const {name, avatar, id} = route.params;
  const messages = useSelector(state => state.user?.data?.messages)?.[id];
  const [neomorphHeight, setNeomorphHeight] = useState(40); //initial height of Neomorph

  const handleInputChange = text => {
    //set the height of Neomorph based on the length of input text
    setNeomorphHeight(text.length === 0 ? 40 : Math.max(40, text.length / 2));
  };

  console.log(messages);

  return (
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
                  alignItems: messages[key].send ? 'flex-end' : 'flex-start',
                  margin: 10,
                }}>
                <Neomorph
                  // lightShadowColor="white"
                  // darkShadowColor="gray"
                  inner={false}
                  style={{
                    width: messages[key].message.length * 8,
                    height: 40,
                    shadowRadius: 3,
                    borderRadius: 15,
                    backgroundColor: COLORS.primary,
                  }}>
                  <View
                    style={{
                      width: messages[key].message.length * 8,
                      height: 40,
                      shadowRadius: 3,
                      borderRadius: 15,
                      backgroundColor: messages[key].send
                        ? COLORS.green
                        : COLORS.primary,
                    }}>
                    <Text
                      style={{
                        color: 'black',
                        margin: 10,
                        textAlign: messages[key].send ? 'right' : 'left',
                      }}>
                      {messages[key].message}
                      {'test'}
                    </Text>
                  </View>
                </Neomorph>
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
            width: 340,
            height: neomorphHeight, //dynamic height based on input text length
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <TextInput
            placeholder="Type your message"
            onChangeText={handleInputChange}
            multiline={true} //allow multiple lines of text
            style={{width: '100%', color: 'black', padding: 10}}
          />
        </Neomorph>
      </View>
    </View>
  );
};
export default ChatUI;
