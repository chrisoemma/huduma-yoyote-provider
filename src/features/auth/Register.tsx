import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ToastAndroid,
} from 'react-native';

import Icon from 'react-native-vector-icons/Feather';

import { useForm, Controller } from 'react-hook-form';
import { RootStateOrAny, useSelector } from 'react-redux';
import { setFirstTime, userRegiter } from './userSlice';
import { globalStyles } from '../../styles/global';
import { useTogglePasswordVisibility } from '../../hooks/useTogglePasswordVisibility';
import PhoneInput from 'react-native-phone-number-input';
import { colors } from '../../utils/colors';
import { Container } from '../../components/Container';
import { BasicView } from '../../components/BasicView';
import { TextInputField } from '../../components/TextInputField';
import { useAppDispatch } from '../../app/store';
import Button from '../../components/Button';
import { ButtonText } from '../../components/ButtonText';
import Pdf from 'react-native-pdf';
import DocumentPicker, { types } from 'react-native-document-picker';
import { firebase } from '@react-native-firebase/storage';
import { PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { useTranslation } from 'react-i18next';
import { formatErrorMessages, showErrorWithLineBreaks, validateNIDANumber } from '../../utils/utilts';

const RegisterScreen = ({ route, navigation }: any) => {

  const dispatch = useAppDispatch();
  const { user, loading, status,isFirstTimeUser } = useSelector(
    (state: RootStateOrAny) => state.user,
  );

  const { passwordVisibility, rightIcon, handlePasswordVisibility } =
    useTogglePasswordVisibility();

  const phoneInput = useRef<PhoneInput>(null);
  const [message, setMessage] = useState('');
   const [fileDoc, setFileDoc] = useState<string | null>(null);
   const [uploadingDoc,setUploadingDoc]=useState(false)
   const [nidaError, setNidaError] = useState('');
   const [nidaLoading,setNidaLoading]=useState(false)


   const { t } = useTranslation();

  const makeid = (length: any) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  // useEffect(() => {
  //   if (status !== '') {
  //     setMessage(status);
  //   }
  // }, [status]);

  useEffect(() => {
    if(isFirstTimeUser){
        dispatch(setFirstTime(false))
    }
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      phone: '',
      password: '',
      first_name: '',
      last_name: '',
      email:'',
      nida: '',
    },
  });


  const removeAttachment = () => {
    setFileDoc(null)
  }

  const selectFileDoc = async () => {

    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
      })
      setFileDoc(res);
    } catch (error) {

      if (DocumentPicker.isCancel(error)) {
        setFileDoc(null)
      } else {
        alert('Unknown Error: ' + JSON.stringify(error));
        throw error
      }
    }
  }


  const getPathForFirebaseStorage = async (uri: any) => {
    const destPath = `${RNFS.TemporaryDirectoryPath}/text`;
    await RNFS.copyFile(uri, destPath);

    return (await RNFS.stat(destPath)).path;
  };


  const setDisappearMessage = (message: any) => {
    setMessage(message);

    setTimeout(() => {
      setMessage('');
    }, 5000);
  };



  const onSubmit = async (data: any) => {

     data.app_type='provider';

    if (fileDoc !== null) {
      console.log('documents',fileDoc[0]); 
      data.doc_type = fileDoc[0].type;
      data.doc_format =fileDoc[0].name;
      console.log('file document', fileDoc);
      const fileExtension = fileDoc[0].type.split("/").pop();
      var uuid = makeid(10)
      const fileName = `${uuid}.${fileExtension}`;
      var storageRef = firebase.storage().ref(`businesses/docs/${fileName}`);

      console.log('file docs', fileDoc[0].uri);
      const fileUri = await getPathForFirebaseStorage(fileDoc[0].uri);
      try {

          const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          
          {
            title: "Read Permission",
            message: "Your app needs permission.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setUploadingDoc(true);
          storageRef.putFile(fileUri).on(
            firebase.storage.TaskEvent.STATE_CHANGED,
            (snapshot: any) => {
              console.log("snapshost: " + snapshot.state);
              if (snapshot.state === firebase.storage.TaskState.SUCCESS) {
              }
            },
            (error) => {
              unsubscribe();
            },
            ()  => {
              storageRef.getDownloadURL().then(async(downloadUrl: any) => {
                data.doc_url = downloadUrl;
                setUploadingDoc(false);
                //    console.log('on submit data', data);

                setNidaLoading(true)
                const nidaValidationResult = await validateNIDANumber(data.nida);
                setNidaLoading(false)
            
              
                if (!nidaValidationResult.obj.error|| nidaValidationResult.obj.error.trim() === '') {
                  data.status='S.Valid';
                dispatch(userRegiter(data))
                  .unwrap()
                  .then(result => {
                    console.log('resultsss', result);
                    if (result.status) {
                      console.log('excuted this true block')
                      ToastAndroid.show("User created successfuly!", ToastAndroid.SHORT);

                      navigation.navigate('Login', {
                        screen: 'Login',
                        message: message
                      });
                    } else {
                      if (result.data) {
                        const errors = result.data.errors;
                        setDisappearMessage(
                          showErrorWithLineBreaks(formatErrorMessages(errors))
                        );
                    } else {
                        setDisappearMessage(result.message);
                    }
                    }

                    console.log('result');
                    console.log(result);
                  })
                  .catch(rejectedValueOrSerializedError => {
                    // handle error here
                    console.log('error');
                    console.log(rejectedValueOrSerializedError);
                  });

                }else{
                  setNidaError(t('auth:nidaDoesNotExist'))
                  console.log('NIDA validation failed:', nidaValidationResult.error);
                }
              });
            }
          );
        } else {
          return false;
        }
      } catch (error) {
        console.warn(error);
        return false;
      }
    } else {
      dispatch(userRegiter(data))
    .unwrap()
    .then(result => {
      console.log('resultsss', result);
      if (result.status) {
        console.log('excuted this true block')
        ToastAndroid.show("User created successfuly!", ToastAndroid.SHORT);

        navigation.navigate('Login', {
          screen: 'Login',
          message: message
        });
      } 

   
    }).catch(rejectedValueOrSerializedError => {
          // handle error here
          console.log('error');
          console.log(rejectedValueOrSerializedError);
        });

    }
  };

  const stylesGlobal = globalStyles();

  const { isDarkMode } = useSelector(
    (state: RootStateOrAny) => state.theme,
  );

  return (

    <SafeAreaView style={stylesGlobal.scrollBg}>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
       
          <View style={stylesGlobal.centerView}>
            <Image
             source={isDarkMode? require('./../../../assets/images/logo-white.png'): require('./../../../assets/images/logo.png')}
              style={[stylesGlobal.verticalLogo,{height:100,marginTop:20}]}
            />
          </View>
          <View>
            <Text style={stylesGlobal.largeHeading}>{t('auth:register')}</Text>
          </View>
          <View>
            <BasicView style={stylesGlobal.centerView}>
              <Text style={stylesGlobal.errorMessage}>{message}</Text>
            </BasicView>

            <BasicView>
              <Text
                style={[
                  stylesGlobal.inputFieldTitle,
                  stylesGlobal.marginTop10,
                ]}>
                {t('auth:phone')}
              </Text>
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <PhoneInput
                    ref={phoneInput}
                    placeholder="714 055 666"
                    defaultValue={value}
                    defaultCode="TZ"
                    countryPickerProps={{
                      countryCodes: ['TZ', 'KE', 'UG', 'RW', 'BI'],
                    }}
                    layout="first"
                    // onChangeText={}
                    onChangeFormattedText={text => {
                      onChange(text);
                    }}
                    withDarkTheme
                    withShadow
                    autoFocus
                    containerStyle={stylesGlobal.phoneInputContainer}
                    textContainerStyle={stylesGlobal.phoneInputTextContainer}
                    textInputStyle={stylesGlobal.phoneInputField}
                    textInputProps={{
                      maxLength: 9,
                    }}
                  />
                )}
                name="phone"
              />
              {errors.phone && (
                <Text style={stylesGlobal.errorMessage}>
                  {t('auth:phoneRequired')}
                </Text>
              )}
            </BasicView>

            <BasicView>
              <Text
                style={[
                  stylesGlobal.inputFieldTitle,
                  stylesGlobal.marginTop20,
                ]}>
               {t('auth:firstName')}
              </Text>

              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInputField
                    placeholder= {t('auth:enterFirstName')}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
                name="first_name"
              />

              {errors.first_name && (
                <Text style={stylesGlobal.errorMessage}>
                  {t('auth:firstNameRequired')}
                </Text>
              )}
            </BasicView>

            <BasicView>
              <Text
                style={[
                  stylesGlobal.inputFieldTitle,
                  stylesGlobal.marginTop20,
                ]}>
               {t('auth:lastName')}
              </Text>

              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInputField
                    placeholder= {t('auth:enterLastName')}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
                name="last_name"
              />

              {errors.last_name && (
                <Text style={stylesGlobal.errorMessage}>
                  {t('auth:lastNameRequired')}
                </Text>
              )}
            </BasicView>

            <BasicView>
              <Text
                style={[
                  stylesGlobal.inputFieldTitle,
                  stylesGlobal.marginTop20,
                ]}>
                {t('auth:nida')}
              </Text>

         
              <Controller
                control={control}
                rules={{
                  required: true,
                  validate: (value) => {
                    if (value.length !== 20) {
                      setNidaError(t('auth:nida20numbers'));
                      return false;
                    }
                    setNidaError('');
                    return true;
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInputField
                    placeholder={t('auth:enterNida')}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType='numeric'
                  />
                )}
                name="nida"
              />
                   {nidaError && (
                <Text style={stylesGlobal.errorMessage}>
                  {nidaError}
                </Text>
              )}
            </BasicView>

            <BasicView>
              <Text
                style={[
                  stylesGlobal.inputFieldTitle,
                  stylesGlobal.marginTop20,
                ]}>
                {t('auth:password')}
              </Text>

              <View style={stylesGlobal.passwordInputContainer}>
                <Controller
                  control={control}
                  rules={{
               
                    required: true,
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[stylesGlobal.passwordInputField,
                        {backgroundColor:colors.white,color:colors.black}
                      ]}
                      secureTextEntry={passwordVisibility}
                      placeholder={t('auth:enterPassword')}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                  name="password"
                />

                <TouchableOpacity onPress={handlePasswordVisibility}>
                  <Icon name={rightIcon} size={20} color={colors.grey} />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={stylesGlobal.errorMessage}>
                  {t('auth:passwordRequired')}
                </Text>
              )}
            </BasicView>

            <BasicView>
                <View style={stylesGlobal.uploadView} >
                  <Text style={{ fontSize: 12 }}>
                    {fileDoc == null ? `${t('screens:attachWorkingPermit')}` : `${t('screens:fileAttached')}`}
                  </Text>
                  <View style={stylesGlobal.attachmentDiv}>
                    <TouchableOpacity
                      style={stylesGlobal.uploadBtn}
                      onPress={selectFileDoc}
                      disabled={fileDoc == null ? false : true}
                    >
                      {
                        fileDoc == null ? (<View />) : (
                          <Icon name={rightIcon} size={20} color={colors.successGreen} />
                        )
                      }

                      <Text style={{
                        color: colors.white,
                        fontSize: 12
                      }}>
                        {fileDoc == null ? `${t('screens:attach')}` : `${t('screens:attached')}`}
                      </Text>
                    </TouchableOpacity>
                    {fileDoc == null ? (<View />) : (
                      <TouchableOpacity style={{
                        alignSelf: 'center',
                        marginLeft: 30
                      }}
                        onPress={() => removeAttachment()}
                      >
                        <Text style={stylesGlobal.textChange}>{t('screens:change')}</Text>
                      </TouchableOpacity>)}
                  </View>
                  {fileDoc == null ? (<View>
                    <Text style={{ color: '#f25d52' }}>

                    </Text>
                  </View>) : (<View />)}
                </View>
                {fileDoc == null ? (<View />) : (
                  <View style={stylesGlobal.displayDoc}>
                    {
                      fileDoc[0].type == 'application/pdf' ? (
                        <Pdf source={{ uri: fileDoc[0].uri }} style={stylesGlobal.pdf}
                          maxScale={3}
                        />
                      ) : (
                        <Image source={{ uri: fileDoc[0].uri }}
                          style={stylesGlobal.pdf}
                        />
                      )
                    }
                  </View>)}
              </BasicView>


              <BasicView>
              <Button loading={loading || uploadingDoc || nidaLoading} onPress={handleSubmit(onSubmit)}>
                <ButtonText>{t('auth:register')}</ButtonText>
              </Button>
            </BasicView>

            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Login');
              }}
              style={[stylesGlobal.marginTop20, stylesGlobal.centerView]}>
              <Text style={stylesGlobal.touchablePlainTextSecondary}>
                {t('auth:alreadyHaveAccount')}
              </Text>
            </TouchableOpacity>
          </View>
       
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
