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
  ActivityIndicator,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import {TextInput} from 'react-native-paper';

import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {Neomorph} from 'react-native-neomorph-shadows';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

import {COLORS, productID, SIZES} from '../common/globalValues';
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
import ImageMarker from 'react-native-image-marker';
import {useDispatch, useSelector} from 'react-redux';
import {IAP} from './PaymentIAP';
import {
  BUY_CHARGE_LOADING,
  FILL_CHARGE,
  SET_CHARGE_ORDER,
  SET_PRODUCT_ID,
} from '../../redux/types';

const loading_image = require('./asset/loading.gif');
const empty_image = require('./asset/empty.jpg');

const tabBarHeight = 29;

var scrollViewHeight = 0;

const storageRef = storage().ref();

export default function Dream() {
  const dispatch = useDispatch();
  const prompt = useSelector(state => state.dream.prompt);
  const setPrompt = prompt => dispatch({type: 'SET_PROMPT', payload: prompt});

  const [loading, setLoading] = useState(false);
  // const [charge, setCharge] = useState(0);
  // const [heart, setHeart] = useState(false);
  const Charge = useSelector(state => state.user.data?.charge);
  const artistList = useSelector(state => state.user.data?.artistList);
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

  const placeholder_template = '🤯 Tap here to write down your dream';

  const [placeHolder, setPlaceHolder] = useState(placeholder_template);
  // image object fields:
  // id: imageId same as the key
  // image: image_file (base64) in string
  // prompt: prompt
  // date: date
  // loading: boolean
  //

  const initImage = {
    id: 'empty',
    image: '',
    prompt: '',
    date: new Date().getTime(),
    loading: false,
    selected: false,
  };

  const loadImages = async () => {
    const allKeys = await AsyncStorage.getAllKeys();
    // console.log(allKeys);

    // remove keys with "auth_" prefix
    const keys = allKeys.filter(key => {
      return key.indexOf('Parse') === -1;
    });
    if (keys.length === 0) {
      setImages([initImage]);
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
    // loadBalance();
  }, []);

  // save charge and hard to AsyncStorage

  // const storeBalance = async () => {
  //   await AsyncStorage.setItem('auth_charge', Charge.toString());
  //   await AsyncStorage.setItem('auth_heart', Heart.toString());
  // };
  // useEffect(() => {
  //   storeBalance();
  // }, [Charge, Heart]);

  // // load charge and heart from AsyncStorage
  // const loadBalance = async () => {
  //   AsyncStorage.getItem('auth_charge').then(value => {
  //     if (value) {
  //       setCharge(parseInt(value));
  //     }
  //   });
  //   AsyncStorage.getItem('auth_heart').then(value => {
  //     if (value) {
  //       setHeart(parseInt(value));
  //     }
  //   });
  // };

  // // sync user charge
  // realtime()
  //   .ref('/users/' + auth().currentUser.uid)
  //   .on('value', snapshot => {
  //     setCharge(snapshot.val().charge);
  //     setHeart(snapshot.val().heart);
  //   });

  const fillCharge = change => {
    realtime()
      .ref('/users/' + auth().currentUser.uid)
      .update({
        charge: realtime.ServerValue.increment(change),
        heart: realtime.ServerValue.increment(change),
      });
    realtime().ref(`/users/${auth().currentUser.uid}/bills`).push({
      amount: price,
      chargeOrder: fillChargeAmount,
      date: new Date().toLocaleString(),
    });

    dispatch({type: FILL_CHARGE, payload: 0});
  };

  const fillChargeAmount = useSelector(state => state.dream.fillCharge);

  useEffect(() => {
    console.log(fillChargeAmount);
    if (fillChargeAmount) {
      fillCharge(fillChargeAmount);
      dispatch({type: BUY_CHARGE_LOADING, payload: false});
    }
  }, [fillChargeAmount]);

  const buyChargeLoading = useSelector(state => state.dream.buyChargeLoading);

  const buyChargeLoadingModal = () => {
    return (
      buyChargeLoading && (
        <Modal transparent={true}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        </Modal>
      )
    );
  };

  const spendCharge = () => {
    realtime()
      .ref('/users/' + auth().currentUser.uid)
      .update({
        charge: realtime.ServerValue.increment(-1),
      });
  };

  const addArtist = artist => {
    realtime()
      .ref('/users/' + auth().currentUser.uid)
      .update({
        artistList: {
          preferred: artistList?.preferred
            ? [...new Set(artistList?.preferred.concat(artist))]
            : [artist],
        },
      });
  };

  function replaceNonUrlCharsWithUnderscore(inputString) {
    // Define a regular expression that matches non-URL acceptable characters
    var regex = /[^A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=]/g;

    // Use the replace method to replace matched characters with underscores
    var resultString = inputString.replace(regex, '_');

    return resultString;
  }

  const addArtistToMessage = (artist, image_entry) => {
    //set a message to the artist
    realtime()
      .ref(
        `/users/${auth().currentUser.uid}/messages/${artist}/${(
          image_entry.date - 1
        ).toString()}/`,
      )
      .set({
        message: image_entry.prompt.replace(`, ${artist} art style`, ''),
        type: 'new art work request',
        timestamp: image_entry.date - 1,
        read: false,
        send: true,
        // image: image_entry,
      });

    // set a message from the artist
    realtime()
      .ref(
        `/users/${
          auth().currentUser.uid
        }/messages/${artist}/${image_entry.date.toString()}/`,
      )
      .set({
        prompt: image_entry.prompt.replace(`, ${artist} art style`, ''),
        type: 'new art work',
        timestamp: image_entry.date,
        read: false,
        send: false,
        image: image_entry,
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

  const serverURL = 'http://phantaspace.ddns.net:7865/sdapi/v1/';

  const send = async () => {
    const imageId = uuid.v1();
    const userId = auth().currentUser.uid;
    const seed = Math.floor(Math.random() * 1e8);

    axios
      .post(serverURL + 'txt2img', {
        prompt: prompt,
        steps: 20,
        width: 768,
        height: 768,
        cfg_scale: 7,
        seed: seed,
      })
      .then(function (response) {
        console.log('send');

        const image_file = `data:image/png;base64,${response.data.images[0]}`;

        setPrompt('');
        const currentTime = new Date().getTime();
        // save the image state
        var image_entry = {
          id: imageId,
          image: image_file,
          imageURL: '',
          prompt: prompt,
          date: currentTime,
          artist: artistsUsed,
          seed: seed,
          model: 1,
        };
        // replace the last image with the new image
        image_entry.loading = false;
        AsyncStorage.setItem(imageId, JSON.stringify(image_entry));
        image_entry.selected = true;
        if (images[0].id === 'empty') {
          setImages([image_entry]);
        } else {
          setImages([...images, image_entry]);
        }
        setLoading(false);
        setPickedImage(image_entry);
        addArtist(artistsUsed[0]);
        setArtistsUsed([]);
        spendCharge();
        setPlaceHolder(placeholder_template);

        // save the image information to user database
        const imageRef = storageRef.child('images/' + imageId + '.png');
        imageRef.putString(image_file, 'data_url').then(() => {
          imageRef.getDownloadURL().then(url => {
            const generatedImageMeta = {
              id: imageId,
              imageURL: url,
              prompt: prompt,
              date: currentTime,
              artist: artistsUsed,
              seed: seed,
              model: 1,
            };
            realtime()
              .ref('/users/' + auth().currentUser.uid + '/generated')
              .child(imageId)
              .set(generatedImageMeta);
            addArtistToMessage(artistsUsed[0], generatedImageMeta);
            // save the url wit the image entry to local storage
            image_entry.imageURL = url;
            AsyncStorage.setItem(imageId, JSON.stringify(image_entry));
            console.log('image uploaded');
            if (images[0].id === 'empty') {
              setImages([image_entry]);
            } else {
              setImages([...images, image_entry]);
            }
          });
        });
      })
      .catch(function (error) {
        console.log('get post response error', error);
        // send();
        return;
      });

    // check progress using get from http://phantaspace.ddns.net:7865/sdapi/v1/progress
    // if progress is not 100, keep checking
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
              shadowRadius: 5,
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

  const actionButtons = () => {
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
        setArtistsUsed(pickedImage.artist);
      }
    }
  }, [CopyButtonPressed]);

  // save photo to local cameral roll
  useEffect(() => {
    if (pickedImage) {
      if (saveButtonPressed) {
        // water mark the image with "PhantaDream"
        const image = pickedImage.image;
        // attach a black bar to the bottom of the image

        // ImageMarker.markText({
        //   src: image,
        //   text: 'Dreamed @ PhantaDream',
        //   position: 'bottomRight',
        //   scale: 1,
        //   color: '#FFFFFF80',
        //   fontName: 'HelveticaNeue',
        //   fontSize: 15,
        //   quality: 100,
        // }).then(markedImage => {
        //   // save the image to camera roll
        //   CameraRoll.save(markedImage).then(() => {
        //     Alert.alert('Photo Saved!');
        //   });
        // });

        // save the image to camera roll
        CameraRoll.save(image).then(() => {
          Alert.alert('Photo Saved!');
        });
      }
    }
  }, [saveButtonPressed]);

  // modal for sharing to public or private
  const [shareModalVisible, setShareModalVisible] = useState(false);
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
                  excuteShare('published');
                  setShareModalVisible(false);
                }}>
                <Neomorph
                  inner={false}
                  style={{
                    shadowRadius: 5,
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
              <TouchableOpacity
                onPress={() => {
                  excuteShare('private');
                  setShareModalVisible(false);
                }}>
                <Neomorph
                  inner={false}
                  style={{
                    shadowRadius: 5,
                    borderRadius: 25,
                    backgroundColor: COLORS.primary,
                    width: 140,
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
                    Private club
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
              default. Only shared art works will be saved on our server. Only
              your approved friends can see your private club art works.
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

  const avatar = useSelector(state => state.user.data?.avatar);
  const artName = useSelector(state => state.user.data?.artName);

  const excuteShare = place => {
    // upload image to firebase storage create an entry on firestore

    const imageId = pickedImage.id;
    const image = pickedImage.image;
    const prompt = pickedImage.prompt;
    const date = pickedImage.date;
    const artist = pickedImage.artist;
    const seed = pickedImage.seed;
    const url = pickedImage.imageURL;

    const imageMeta = {
      url: url,
      id: imageId,
      prompt: prompt,
      date: date,
      artist: artist,
      creator: auth().currentUser.uid,
      owner: {
        id: auth().currentUser.uid,
        avatar: avatar,
        artName: artName,
      },
      likes: 0,
      seed: seed,
      model: 1,
      public: true,
    };
    // store image meta on firestore
    firestore()
      .collection('images')
      .doc(imageId)
      .set(imageMeta)
      .then(() => {
        Alert.alert('Image Shared!');
      });

    // store published image on user's published images
    realtime()
      .ref('users/' + auth().currentUser.uid + '/' + place)
      .child(imageId)
      .set(imageMeta);
  };

  // delete photo
  useEffect(() => {
    if (pickedImage) {
      if (deleteButtonPressed) {
        Alert.alert(
          'Delete',
          'Are you sure you want to delete?',
          [
            {
              text: 'Cancel',
              onPress: () => {
                setDeleteButtonPressed(false);
              },
              style: 'cancel',
            },
            {
              text: 'OK',
              onPress: () => {
                if (images.length === 1) {
                  setImages([initImage]);
                } else {
                  setImages(
                    images.filter(image => {
                      return image.id !== pickedImage.id;
                    }),
                  );
                }
                AsyncStorage.removeItem(pickedImage.id);
                // remove image on users' generated images and messages
                realtime()
                  .ref('users/' + auth().currentUser.uid + '/generated')
                  .child(pickedImage.id)
                  .remove();
                realtime()
                  .ref('users/' + auth().currentUser.uid + '/messages')
                  .child(pickedImage.artist[0])
                  .child(pickedImage.date)
                  .remove();
                // remove image on storage
                storageRef
                  .child('images/' + pickedImage.id + '.png')
                  .delete()
                  .then(() => {
                    console.log('image deleted');
                  });

                setPickedImage(null);
                setDeleteButtonPressed(false);
              },
            },
          ],
          {cancelable: false},
        );
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
            if (!item.loading && item.id !== 'empty') {
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
            }
          }}>
          <Neomorph
            style={{
              shadowRadius: 5,
              borderRadius: 25,
              backgroundColor: COLORS.primary,
              width: SIZES.canvas,
              height: SIZES.canvas,
              marginTop: 20,
            }}>
            <Image
              source={
                item.loading
                  ? loading_image
                  : item.id === 'empty'
                  ? empty_image
                  : {
                      uri: item.image,
                    }
              }
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
        {item.selected ? actionButtons() : null}
      </View>
    );
  };

  // show charge left with lighting symbol
  const ChargeLeft = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          setChargeModalVisible(!chargeModalVisible);
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

  const [price, setPrice] = useState(0.99);

  const chargePurchaseSelection = [
    {
      label: '$0.99 for 100 ',
      productID: productID.charge1,
      subscription: false,
      price: 0.99,
      charge: 100,
    },
    {
      label: '$9.99 for 2000 ',
      productID: productID.charge2,
      subscription: false,
      price: 19.99,
      charge: 2000,
    },
    {
      label: '$99.99 for 40000 ',
      productID: productID.charge3,
      subscription: false,
      price: 399.99,
      charge: 40000,
    },
  ];

  // show modal to purchase charge when user press the Charge icon
  const [chargeModalVisible, setChargeModalVisible] = useState(false);

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
              dispatch({type: SET_PRODUCT_ID, payload: e.productID});
              dispatch({type: SET_CHARGE_ORDER, payload: e.charge});
              setPrice(e.price);
              // setChargeOrder(e.charge);
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
            {/* <Payment
              price={price}
              chargeOrder={chargeOrder}
              fillCharge={fillCharge}
            /> */}
            <IAP />
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
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="always">
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View>
            <Text style={{color: 'gray', fontSize: 15, marginRight: 10}}>
              add artist style:
            </Text>
          </View>
          <View>
            <TouchableOpacity
              onPress={() => {
                // refreshArtist();
                setPrompt(prompt + ', ' + artistSeggestion + ' art style');
                setArtistsUsed([...artistsUsed, artistSeggestion]);
                // refreshArtist();
                setArtistSuggestionVisible(false);
              }}
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 10,
                height: 40,
                marginRight: 10,
                borderColor: COLORS.blue,
                backgroundColor: COLORS.blue,
                borderRadius: 10,
              }}>
              <Text style={{color: 'black', fontSize: 15, marginRight: 10}}>
                {artistSeggestion}
              </Text>
            </TouchableOpacity>
          </View>
          {artistList?.preferred.map(artist => {
            return (
              <View key={artist}>
                <TouchableOpacity
                  onPress={() => {
                    // refreshArtist();
                    setPrompt(prompt + ', ' + artist + ' art style');
                    setArtistsUsed([...artistsUsed, artist]);
                    // refreshArtist();
                    setArtistSuggestionVisible(false);
                  }}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 10,
                    height: 40,
                    marginRight: 10,
                    borderColor: COLORS.blue,
                    backgroundColor: COLORS.blue,
                    borderRadius: 10,
                  }}>
                  <Text style={{color: 'black', fontSize: 15, marginRight: 10}}>
                    {artist}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
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
          onLayout={() => scrollViewRef.current.scrollToEnd({animated: true})}
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
          {buyChargeLoadingModal()}
        </ScrollView>

        {artistSuggestionVisible && artistView()}

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
                setPlaceHolder(placeholder_template);
              }}
              value={prompt}
              style={{
                backgroundColor: 'rgba(0,0,0,0)',
                // align text to center
                textAlign: 'center',
              }}
              onFocus={() => {
                // Clear the placeholder text when focused
                setPlaceHolder('');
              }}
              placeholder={placeHolder}
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
                        date: new Date().getTime(),
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
                        date: new Date().getTime(),
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
      </View>
    </KeyboardAvoidingView>
  );
}
