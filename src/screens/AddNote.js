import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  TextInput,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ScrollView,
  Platform
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import firebase from 'firebase';
import auth from '@react-native-firebase/auth';
import Voice from '@react-native-community/voice';
import {
  Camera,
  OpenMic,
  MuteMic,
  Trash,
  Location,
  Calender
} from '../components/SVGR-Components';
import MapView, { PROVIDER_GOOGLE, Marker, Callout } from 'react-native-maps';
import Modal from 'react-native-modal';
import { SearchBar } from '../components';
import ImagePicker from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddNote = (props) => {
  const { colors, dark } = useTheme();
  const styles = customStyles(colors);
  const user = auth().currentUser;
  const date = new Date().toLocaleString();
  const [data, setData] = useState('');
  const [data2, setData2] = useState('');
  const [list, setList] = useState([]);
  const [words, setWords] = useState('');
  const [push, setPush] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [image, setImage] = useState(false);
  const [isImageFullScreen, setIsImageFullScreen] = useState(false);
  const [dates, setDate] = useState(new Date(1598051730000));
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);

  const config = {
    apiKey: 'AIzaSyC7Wtd777P-gYVGWvtvx148h7c8YJZU8Qo',
    authDomain: 'freebie-notes.firebaseapp.com',
    databaseURL: 'https://freebie-notes.firebaseio.com',
    projectId: 'freebie-notes',
    storageBucket: 'freebie-notes.appspot.com',
    messagingSenderId: '33866530069',
    appId: '1:33866530069:web:e59e809cf02da65fcc7d1c',
  };
  if (!firebase.apps.length) {
    firebase.initializeApp(config);
  }
  useEffect(() => {
    const onSpeechResults = (e) => {
      setWords(e.value);
    };
    Voice.onSpeechResults = onSpeechResults;
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startRecognizing = async () => {
    try {
      await Voice.start('tr_TR');
    } catch (e) {
      console.error(e);
    }
  };
  const sendData = () => {
    let newList = [...list];
    newList.push(data);
    setList(newList);

    firebase
      .database()
      .ref(`notes/${user.uid}`)
      .push({
        noteTitle: data,
        noteDetails: data2,
        uid: user.uid,
        username: user.email,
        timestamp: date,
        voiceNote: words,
        image: image,
      })
      .then((data) => {
        //success callback
        console.log('data ', data);
      })
      .catch((error) => {
        //error callback
        console.log('error ', error);
      });
  };
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const chooseImage = () => {
    const options = {
      title: "Select Image",
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      quality: 0.2,
    }
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.fileSize > 1000000) {
        Alert.alert('Freebie Notes','Dosya boyutu çok büyük. Desteklenen maksimum dosya boyutu : 10.0 MB.');
      } else {
        const source = 'data:image/jpeg;base64,' + response.data;
        setImage(source);
      }
    });
  }
  const showFullScreenImage = () => setIsImageFullScreen(!isImageFullScreen);
  const deleteImage = () => {
    Alert.alert('Freebie Notes', 'Fotoğrafı Sil?',
      [
        { text: 'Hayır', style: 'cancel' },
        { text: 'Evet', onPress: () => setImage(false) },]
    )
  } 

  const showMode=(currentMode)=>{
    setShow(true)
    setMode(currentMode)
  }
  const openCalendar=()=>{
    const currentDate = selectedDate || date
    setShow(Platform.OS === 'ios')
    setDate(currentDate)
  }

  const showDate=()=>{
    showMode('date')
  }

  return (
    <ScrollView contentContainerStyle={{ flex: 1 }} bounces={false}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={dark ? 'light-content': 'dark-content'} />
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => {
            if (data != '') {
              if (data2 != '') {
                sendData();
                props.navigation.goBack('Tabs');
              } else {
                Alert.alert('Bir not gir..', ' ', [{ text: 'Tamam' }]);
              }
            } else {
              Alert.alert('Bir başlık gir..', ' ', [{ text: 'Tamam' }]);
            }
          }}>
          <Text style={styles.text}>Bitir</Text>
        </TouchableOpacity>
        <TextInput
          placeholder="Başlık"
          style={styles.textInput}
          onChangeText={(text) => setData(text)}
          multiline={true}
        />
        <TextInput
          placeholder="Not"
          style={[styles.textInput, { fontWeight: 'normal' }]}
          onChangeText={(text) => setData2(text)}
          multiline={true}
        />
        <Text style={[styles.textInput, { fontWeight: 'normal' }]} multiline={true}>
          {words}
        </Text>
        <View style={styles.iconBar}>
          <TouchableOpacity
            style={styles.button}
            onPress={chooseImage}>
            <Camera fill="#FF5227" width={50} height={40} />
          </TouchableOpacity>
          {push ? (
            <TouchableOpacity
              style={[styles.button, { width: 40 }]}
              onPress={() => {
                setPush(false);
                Voice.stop();
              }}>
              <OpenMic width={40} height={40} />
            </TouchableOpacity>
          ) : (
              <TouchableOpacity
                style={[styles.button, { width: 40 }]}
                onPress={() => {
                  setPush(true);
                  startRecognizing();
                }}>
                <MuteMic width={40} height={40} />
              </TouchableOpacity>
            )}
          <TouchableOpacity
            onPress={() => setWords('')}
            style={[styles.button, { width: 40 }]}>
            <Trash width={40} height={40} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => toggleModal()}
            style={[styles.button, { width: 40 }]}>
            <Location width={40} height={40} />
          </TouchableOpacity>
          <TouchableOpacity onPress={showDate}>
          <Calender width={40} height={40} />
          {show && (
            <DateTimePicker
            testID="dateTimePicker"
            value={dates}
            mode={mode}
            is24Hour={true}
            display="default"
            onChange={openCalendar}
            />
          )}
          </TouchableOpacity>
          <Modal
            isVisible={isModalVisible}
            animationType="fade"
            transparent={true}
            onBackdropPress={() => setModalVisible(false)}>
            <View style={{ flex: 0.9, justifyContent: 'center' }}>
              <SearchBar holder="Konum ara" />
              <MapView
                provider={PROVIDER_GOOGLE}
                style={{ flex: 0.9, borderRadius: 15 }}
              />
            </View>
          </Modal>
        </View>
        {image &&
          <View
            style={isImageFullScreen ?
              styles.fullScreenImageContainer :
              styles.imageContainer}
          >
            <TouchableOpacity
              onPress={showFullScreenImage}
              onLongPress={deleteImage}>
              <Image
                source={{ uri: image }}
                style={isImageFullScreen ?
                  styles.fullScreenImage :
                  styles.image}
              />
            </TouchableOpacity>
          </View>
        }
      </SafeAreaView>
    </ScrollView>
  );
};
export default AddNote;

const customStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.noteBackground,
    },
    textInput: {
      fontSize: 20,
      margin: 5,
      width: Dimensions.get('screen').width / 1,
      fontWeight: 'bold',
      color: colors.placeHolder,
      alignSelf: 'center',
      borderEndWidth: 0.5,
      textAlign: 'center',
    },
    button: {
      flexDirection: 'row',
      justifyContent: 'center',
      borderRadius: 100,
      width: 50,
      height: 40,
      marginLeft: 10,
    },
    iconBar: {
      flexDirection: 'row',
      justifyContent: 'center',
      padding: 50,
    },
    text: {
      fontSize: 20,
      fontWeight: '500',
      color: '#FF5227',
    },
    saveButton: {
      alignItems: 'flex-end',
      marginRight: 10,
    },
    image: {
      width: Dimensions.get('screen').width / 1.5,
      height: Dimensions.get('screen').width / 1.75,
    },
    fullScreenImage: {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
      resizeMode: "contain",
      justifyContent: "center"
    },
    imageContainer: {
      justifyContent: "center",
      alignItems: "center",
      marginVertical: 10,
    },
    fullScreenImageContainer: {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
      position: "absolute",
      backgroundColor: '#212121',
      justifyContent: "center",
      alignItems: "center",
    }
  });
