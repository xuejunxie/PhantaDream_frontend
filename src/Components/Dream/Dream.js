import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  ScrollView,
  Keyboard,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import {TextInput} from 'react-native-paper';

import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {Neomorph} from 'react-native-neomorph-shadows';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

import {COLORS, SIZES} from '../common/globalValues';
import axios from 'axios';
import {Buffer} from 'buffer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getStatusBarHeight} from 'react-native-status-bar-height';

import uuid from 'react-native-uuid';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faBolt,
  faCopy,
  faDownload,
  faShare,
  faTimes,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';

import {CameraRoll} from '@react-native-camera-roll/camera-roll';

// firebase things
import realtime from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

import artists from './artists.json';

import RadioButtonRN from 'radio-buttons-react-native';
import Payment from './Payment';

const loading_image = 'https://i.gifer.com/1amw.gif';
const empty_image =
  'https://www.canvaschamp.com/static/images/landingpage/blankprestretchedcanvas/streach-choice.jpg';

const tabBarHeight = 29;

var scrollViewHeight = 0;

export default function Dream() {
  const [prompt, setPrompt] = React.useState('');
  const [loading, setLoading] = useState(false);
  const [Charge, setCharge] = useState(0);
  const [Heart, setHeart] = useState(false);

  const [CopyButtonPressed, setCopyButtonPressed] = useState(false);
  const [saveButtonPressed, setSaveButtonPressed] = useState(false);
  const [shareButtonPressed, setShareButtonPressed] = useState(false);
  const [deleteButtonPressed, setDeleteButtonPressed] = useState(false);
  const [pickedImage, setPickedImage] = useState(null); // pickedImage = image object when user pick an image from the gallery

  const scrollViewRef = useRef();

  const navBarHeight =
    getStatusBarHeight(Platform.OS === 'ios' ? false : true) + tabBarHeight;
  const [verticalOffest, setVerticalOffset] = useState(navBarHeight);

  // load all the image from AsyncStorage
  const [images, setImages] = useState([]);

  // image object fields:
  // id: imageId same as the key
  // image: image_file (base64) in string
  // prompt: prompt
  // date: date
  // loading: boolean
  //

  const loadImages = async () => {
    const keys = await AsyncStorage.getAllKeys();
    if (keys.length === 0) {
      setImages([
        {
          id: 'empty',
          image: empty_image,
          prompt: '',
          date: new Date(),
          loading: false,
          selected: false,
        },
      ]);
    } else {
      const result = await AsyncStorage.multiGet(keys);
      const parsedResult = result.map((item, index) => {
        const imageId = item[0];
        const image = JSON.parse(item[1]);
        image.loading = false;
        image.selected = false;
        return image;
      });
      const sourtedResult = parsedResult.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });
      setImages(sourtedResult);
    }
  };

  useEffect(() => {
    // AsyncStorage.clear();
    loadImages();
  }, []);

  // sync user charge
  realtime()
    .ref('/users/' + auth().currentUser.uid)
    .on('value', snapshot => {
      setCharge(snapshot.val().charge);
      setHeart(snapshot.val().heart);
    });

  const updateCharge = change => {
    realtime()
      .ref('/users/' + auth().currentUser.uid)
      .update({
        charge: Charge + change,
        heart: Heart + change,
      });
  };

  // dynamically adjust vertical offset of keyboard avoiding view
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setVerticalOffset(0);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setVerticalOffset(navBarHeight);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // send prompt to server

  const serverURL = 'http://phantaspace.ddns.net:7863/';

  const send = async () => {
    const imageId = uuid.v1();
    const userId = auth().currentUser.uid;
    const seed = Math.floor(Math.random() * 1e10);
    axios
      .post(serverURL + 'txt2img', {
        prompt: prompt,
        user: userId,
        img_name: imageId,
        seed: seed,
      })
      .then(function (response) {
        const taskID = response.data.task_id;

        const statusURL = serverURL + 'status/' + taskID;
        const imageURL = serverURL + userId + '/' + imageId;

        const getImage = async () => {
          await axios.get(statusURL).then(function (response) {
            if (response.data.state === 'SUCCESS') {
              axios
                .get(imageURL, {responseType: 'arraybuffer'})
                .then(function (response) {
                  const image_data = Buffer.from(
                    response.data,
                    'binary',
                  ).toString('base64');
                  const image_file = `data:image/png;base64,${image_data}`;
                  // const image_file = URL.createObjectURL(response.data);
                  setPrompt('');
                  // save the image locally with AsyncStorage
                  const image_entry = {
                    id: imageId,
                    image: image_file,
                    imageURL: imageURL,
                    prompt: prompt,
                    date: new Date(),
                    artist: artistsUsed,
                    seed: seed,
                  };
                  AsyncStorage.setItem(imageId, JSON.stringify(image_entry));
                  // replace the last image with the new image
                  image_entry.loading = false;
                  image_entry.selected = true;
                  if (images[0].id === 'empty') {
                    setImages([image_entry]);
                  } else {
                    setImages([...images, image_entry]);
                  }
                  setLoading(false);
                  setPickedImage(image_entry);
                  setArtistsUsed([]);
                  updateCharge(-1);
                });
            } else {
              setTimeout(getImage, 5000);
            }
          });
        };
        getImage();
      });
  };
  // buttom press components
  const operations = (press, setPress, icon) => {
    return (
      <View
        style={{
          margin: 10,
        }}>
        <TouchableWithoutFeedback
          onPressIn={() => {
            setPress(true);
            ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
          }}
          onPressOut={() => setPress(false)}>
          <Neomorph
            inner={press}
            style={{
              shadowRadius: 10,
              borderRadius: 25,
              backgroundColor: COLORS.primary,
              width: 60,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {icon}
          </Neomorph>
        </TouchableWithoutFeedback>
      </View>
    );
  };

  const renderIcon = name => {
    return <FontAwesomeIcon icon={name} size={20} color={'gray'} />;
  };

  const actions = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-evenly',
        }}>
        {operations(
          CopyButtonPressed,
          setCopyButtonPressed,
          renderIcon(faCopy),
        )}
        {operations(
          saveButtonPressed,
          setSaveButtonPressed,
          renderIcon(faDownload),
        )}
        {operations(
          shareButtonPressed,
          setShareButtonPressed,
          renderIcon(faShare),
        )}
        {operations(
          deleteButtonPressed,
          setDeleteButtonPressed,
          renderIcon(faTrash),
        )}
      </View>
    );
  };

  // copy prompt to input box
  useEffect(() => {
    if (pickedImage) {
      if (CopyButtonPressed) {
        setPrompt(pickedImage.prompt);
      }
    }
  }, [CopyButtonPressed]);

  // save photo to local cameral roll
  useEffect(() => {
    if (pickedImage) {
      if (saveButtonPressed) {
        CameraRoll.save(pickedImage.image).then(() => {
          Alert.alert('Photo Saved!');
        });
      }
    }
  }, [saveButtonPressed]);

  // modal for sharing to public or private
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareToPbulic, setShareToPublic] = useState(true);
  const ShareModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={shareModalVisible}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
          <View
            style={{
              width: '80%',
              height: '30%',
              backgroundColor: COLORS.primary,
              borderRadius: 20,
              justifyContent: 'space-evenly',
              alignItems: 'center',
            }}>
            <View
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
              }}>
              <TouchableOpacity
                style={{
                  alignItems: 'flex-end',
                }}
                onPress={() => {
                  setShareModalVisible(!shareModalVisible);
                }}>
                <FontAwesomeIcon
                  icon={faTimes}
                  size={20}
                  color={'gray'}
                  style={{marginRight: 20, marginTop: 20}}
                />
              </TouchableOpacity>
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: 'gray',
              }}>
              Share to?
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                width: '100%',
              }}>
              <TouchableOpacity
                onPress={() => {
                  setShareToPublic(true);
                  excuteShare();
                  setShareModalVisible(false);
                }}>
                <Neomorph
                  inner={false}
                  style={{
                    shadowRadius: 10,
                    borderRadius: 25,
                    backgroundColor: COLORS.primary,
                    width: 120,
                    height: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: 'gray',
                    }}>
                    Public
                  </Text>
                </Neomorph>
              </TouchableOpacity>
            </View>
            <Text
              style={{
                fontSize: 15,
                color: 'gray',
                margin: 10,
              }}>
              All your generated art works will be saved on your device only by
              default. Only public art works will be saved on our server.
            </Text>
          </View>
        </View>
      </Modal>
    );
  };

  // header to the image element for sharing progress
  const [shareProgress, setShareProgress] = useState(0);
  const [shareProgressVisible, setShareProgressVisible] = useState(false);
  const ShareProgress = () => {
    // share progress bar on top of the image
  };

  useEffect(() => {
    if (pickedImage) {
      if (shareButtonPressed) {
        setShareModalVisible(true);
      }
    }
  }, [shareButtonPressed]);

  const excuteShare = () => {
    // upload image to firebase storage create an entry on firestore

    const imageId = pickedImage.id;
    const image = pickedImage.image;
    const prompt = pickedImage.prompt;
    const date = pickedImage.date;
    const artist = pickedImage.artist;
    const storageRef = storage().ref();
    const seed = pickedImage.seed;
    const imageRef = storageRef.child('images/' + imageId + '.png');
    imageRef
      .putString(image, 'data_url')
      .then(() => {
        imageRef.getDownloadURL().then(url => {
          const imageMeta = {
            url: url,
            id: imageId,
            prompt: prompt,
            date: date,
            artist: artist,
            creator: auth().currentUser.uid,
            owner: auth().currentUser.uid,
            likes: 1,
            seed: seed,
          };
          // store image meta on firestore
          firestore()
            .collection('images')
            .doc(imageId)
            .set(imageMeta)
            .then(() => {
              Alert.alert('Image Shared!');
              console.log('imageRef: ', imageRef);
            });
          // store published image on user's published images
          realtime()
            .ref('users/' + auth().currentUser.uid + '/published')
            .child(imageId)
            .set(imageMeta);
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  // delete photo
  useEffect(() => {
    if (pickedImage) {
      if (deleteButtonPressed) {
        setImages(
          images.filter(image => {
            return image.id !== pickedImage.id;
          }),
        );
        AsyncStorage.removeItem(pickedImage.id);
        setPickedImage(null);
        setDeleteButtonPressed(false);
      }
    }
  }, [deleteButtonPressed]);

  const imageView = item => {
    return (
      <View
        key={item.id}
        style={{
          backgroundColor: 'rgba(0,0,0,0)',
          marginTop: 30,

          // make it center
          alignItems: 'center',
        }}>
        <TouchableWithoutFeedback
          onPress={() => {
            ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);

            setImages(
              images.map(image => {
                if (image.id === item.id) {
                  image.selected = !image.selected;
                  if (image.selected) {
                    setPickedImage(image);
                  } else {
                    setPickedImage(null);
                  }
                } else {
                  image.selected = false;
                }
                return image;
              }),
            );
          }}>
          <Neomorph
            style={{
              shadowRadius: 10,
              borderRadius: 25,
              backgroundColor: COLORS.primary,
              width: SIZES.canvas,
              height: SIZES.canvas,
              marginTop: 20,
            }}>
            <Image
              source={{
                uri: item.loading ? loading_image : item.image,
              }}
              style={{
                width: SIZES.canvas,
                height: SIZES.canvas,

                borderRadius: 25,
              }}></Image>
          </Neomorph>
        </TouchableWithoutFeedback>

        {item.selected ? (
          <Text style={{color: 'gray', fontSize: 15, margin: 10}}>
            {item.prompt}
          </Text>
        ) : null}
        {item.selected ? actions() : null}
      </View>
    );
  };

  // show charge left with lighting symbol
  const ChargeLeft = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          setChargeModalVisible(true);
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 20,
            marginBottom: 20,
          }}>
          <FontAwesomeIcon icon={faBolt} size={20} color={chargeColor} />
          <Text style={{color: 'gray', fontSize: 15, marginLeft: 10}}>
            {Charge}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // animate the lighting symbol
  const [chargeColor, setChargeColor] = useState('gray');
  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }

  const lastCharge = usePrevious(Charge);
  function timeUnit(n) {
    return 1000 + 300 * n;
  }
  useEffect(() => {
    if (Charge > lastCharge) {
      setChargeColor('yellow');
      // set charge color to red and blue and back to gray in sequence
      setTimeout(() => {
        setChargeColor('gray');
      }, timeUnit(1));
      setTimeout(() => {
        setChargeColor('yellow');
      }, timeUnit(2));
      setTimeout(() => {
        setChargeColor('gray');
      }, timeUnit(3));
    }
  }, [Charge]);

  const chargePurchaseSelection = [
    {
      label: '$0.99 for 30 ',
      subscription: false,
      price: 0.99,
      charge: 30,
    },
    {
      label: '$19.9 for 800 ',
      subscription: false,
      price: 1.99,
      charge: 80,
    },
    {
      label: '$399.99 for 20000 ',
      subscription: false,
      price: 39.99,
      charge: 200,
    },
  ];

  // show modal to purchase charge when user press the Charge icon
  const [chargeModalVisible, setChargeModalVisible] = useState(false);
  const [price, setPrice] = useState(0);
  const [chargeOrder, setChargeOrder] = useState(0);

  const ChargeModal = () => {
    return (
      chargeModalVisible && (
        <View
          style={{
            backgroundColor: COLORS.primary,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              position: 'absolute',
              top: '10%',
              right: 0,
            }}>
            <TouchableOpacity
              style={{
                alignItems: 'flex-end',
              }}
              onPress={() => {
                setChargeModalVisible(!chargeModalVisible);
                scrollViewRef.current.scrollToEnd({animated: true});
              }}>
              <FontAwesomeIcon
                icon={faTimes}
                size={20}
                color={'gray'}
                style={{marginRight: 20, marginTop: 20}}
              />
            </TouchableOpacity>
          </View>

          <RadioButtonRN
            data={chargePurchaseSelection}
            selectedBtn={e => {
              setPrice(e.price);
              setChargeOrder(e.charge);
            }}
            box={false}
            circleSize={10}
            textStyle={{color: 'black', fontSize: 15}}
            textColor={'black'}
            activeColor={'black'}
            deactiveColor={'gray'}
            boxActiveBgColor={'white'}
            boxDeactiveBgColor={COLORS.primary}
            duration={0}
          />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 20,
            }}>
            <Payment
              price={price}
              chargeOrder={chargeOrder}
              updateCharge={updateCharge}
            />
          </View>
        </View>
      )
    );
  };

  const [artistSeggestion, setArtistSeggestion] = useState('');
  const [artistSuggestionVisible, setArtistSuggestionVisible] = useState(false);
  const [artistsUsed, setArtistsUsed] = useState([]);
  const refreshArtist = () => {
    const artist = artists[Math.floor(Math.random() * artists.length)];
    setArtistSeggestion(artist.artist);
  };

  useEffect(() => {
    refreshArtist();
  }, []);

  const artistView = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 20,
          marginBottom: 20,
        }}>
        <TouchableOpacity
          onPress={() => {
            refreshArtist();
            setPrompt(prompt + ', ' + artistSeggestion);
            setArtistsUsed([...artistsUsed, artistSeggestion]);
            refreshArtist();
          }}>
          <Text style={{color: 'gray', fontSize: 15, marginRight: 10}}>
            Tap here to add artist style: {artistSeggestion}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={verticalOffest}
      style={{
        backgroundColor: COLORS.primary,
        flex: 1,
      }}>
      <View
        style={{
          height: '100%',
          justifyContent: 'flex-end',
        }}>
        {ShareModal()}
        <ScrollView
          ref={scrollViewRef}
          onContentSizeChange={(contentWidth, contentHeight) => {
            if (pickedImage === null) {
              // if user unselected the image, don't scroll
              if (contentHeight > scrollViewHeight) {
                scrollViewRef.current.scrollToEnd({animated: true});
              }
            } else {
              if (pickedImage.id === images[images.length - 1].id) {
                scrollViewRef.current.scrollToEnd({animated: true});
              }
            }
            scrollViewHeight = contentHeight;
          }}>
          {images.map((item, index) => {
            return imageView(item);
          })}
          {ChargeLeft()}
          {ChargeModal()}
        </ScrollView>

        <View>
          {!loading && (
            <TextInput
              multiline={true}
              onChangeText={text => {
                setPrompt(text);
                setArtistSuggestionVisible(true);
                refreshArtist();
              }}
              onBlur={() => {
                setArtistSuggestionVisible(false);
              }}
              value={prompt}
              style={{
                backgroundColor: 'rgba(0,0,0,0)',
                // align text to center
                textAlign: 'center',
              }}
              placeholder="🤯 Tap here to write down your dream "
              returnKeyType="send"
              numberOfLines={1}
              blurOnSubmit={true}
              onSubmitEditing={() => {
                //haptic feedback
                ReactNativeHapticFeedback.trigger(
                  'impactMedium',
                  hapticOptions,
                );
                if (Charge > 0) {
                  setLoading(true);
                  if (images[0].id === 'empty') {
                    // set the first image to loading
                    setImages([
                      {
                        id: 'empty',
                        image: loading_image,
                        prompt: '',
                        date: new Date(),
                        loading: true,
                        selected: false,
                      },
                    ]);
                    // force update the view
                  } else {
                    // add a new image with loading

                    setImages([
                      ...images.map(item => {
                        item.selected = false;
                        return item;
                      }),
                      {
                        id: 'loading',
                        image: loading_image,
                        prompt: '',
                        date: new Date(),
                        loading: true,
                        selected: false,
                      },
                    ]);
                  }
                  setPickedImage(null);
                  send();
                } else {
                  setChargeModalVisible(true);
                }
                setArtistSuggestionVisible(false);
              }}
            />
          )}
        </View>
        {artistSuggestionVisible && artistView()}
      </View>
    </KeyboardAvoidingView>
  );
}
