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
import { userRegiter } from './userSlice';
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

const RegisterScreen = ({ route, navigation }: any) => {

  const dispatch = useAppDispatch();
  const { user, loading, status } = useSelector(
    (state: RootStateOrAny) => state.user,
  );

  const { passwordVisibility, rightIcon, handlePasswordVisibility } =
    useTogglePasswordVisibility();

  const phoneInput = useRef<PhoneInput>(null);
  const [message, setMessage] = useState('');
   const [fileDoc, setFileDoc] = useState<string | null>(null);


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

  useEffect(() => {
    if (status !== '') {
      setMessage(status);
    }
  }, [status]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      phone: '',
      password: '',
      name: '',
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

    // if (Platform.OS === "ios") return uri;
    // const stat = await RNFetchBlob.fs.stat(uri);
    // return stat.path;
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

   
    })

  }

  return (

    <SafeAreaView>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <Container>
          <View style={globalStyles.centerView}>
            <Image
              source={require('./../../../assets/images/logo.png')}
              style={globalStyles.verticalLogo}
            />
          </View>
          <View>
            <Text style={globalStyles.largeHeading}>{t('auth:register')}</Text>
          </View>
          <View>
            <BasicView style={globalStyles.centerView}>
              <Text style={globalStyles.errorMessage}>{message}</Text>
            </BasicView>

            <BasicView>
              <Text
                style={[
                  globalStyles.inputFieldTitle,
                  globalStyles.marginTop10,
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
                    placeholder="672 127 313"
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
                    containerStyle={globalStyles.phoneInputContainer}
                    textContainerStyle={globalStyles.phoneInputTextContainer}
                    textInputStyle={globalStyles.phoneInputField}
                    textInputProps={{
                      maxLength: 9,
                    }}
                  />
                )}
                name="phone"
              />
              {errors.phone && (
                <Text style={globalStyles.errorMessage}>
                  {t('auth:phoneRequired')}
                </Text>
              )}
            </BasicView>

            <BasicView>
              <Text
                style={[
                  globalStyles.inputFieldTitle,
                  globalStyles.marginTop20,
                ]}>
               {t('auth:name')}
              </Text>

              <Controller
                control={control}
                rules={{
                  maxLength: 12,
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInputField
                    placeholder= {t('auth:enterName')}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
                name="name"
              />

              {errors.name && (
                <Text style={globalStyles.errorMessage}>
                  {t('auth:nameRequired')}
                </Text>
              )}
            </BasicView>

            <BasicView>
              <Text
                style={[
                  globalStyles.inputFieldTitle,
                  globalStyles.marginTop20,
                ]}>
                {t('auth:nida')}
              </Text>

              <Controller
                control={control}
                rules={{
                  maxLength: 12,
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInputField
                    placeholder={t('auth:enterNida')}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
                name="nida_number"
              />

            </BasicView>

            <BasicView>
              <Text
                style={[
                  globalStyles.inputFieldTitle,
                  globalStyles.marginTop20,
                ]}>
                {t('auth:password')}
              </Text>

              <View style={globalStyles.passwordInputContainer}>
                <Controller
                  control={control}
                  rules={{
                    maxLength: 12,
                    required: true,
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={globalStyles.passwordInputField}
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
                <Text style={globalStyles.errorMessage}>
                  {t('auth:passwordRequired')}
                </Text>
              )}
            </BasicView>


         

            <BasicView>
                <View style={globalStyles.uploadView} >
                  <Text style={{ fontSize: 12 }}>
                    {fileDoc == null ? 'Attach the business licences' : 'File Attach'}
                  </Text>
                  <View style={globalStyles.attachmentDiv}>
                    <TouchableOpacity
                      style={globalStyles.uploadBtn}
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
                        {fileDoc == null ? 'Attach' : 'Attached'}
                      </Text>
                    </TouchableOpacity>
                    {fileDoc == null ? (<View />) : (
                      <TouchableOpacity style={{
                        alignSelf: 'center',
                        marginLeft: 30
                      }}
                        onPress={() => removeAttachment()}
                      >
                        <Text style={globalStyles.textChange}>Change</Text>
                      </TouchableOpacity>)}
                  </View>
                  {fileDoc == null ? (<View>
                    <Text style={{ color: '#f25d52' }}>

                    </Text>
                  </View>) : (<View />)}
                </View>
                {fileDoc == null ? (<View />) : (
                  <View style={globalStyles.displayDoc}>
                    {
                      fileDoc[0].type == 'application/pdf' ? (
                        <Pdf source={{ uri: fileDoc[0].uri }} style={globalStyles.pdf}
                          maxScale={3}
                        />
                      ) : (
                        <Image source={{ uri: fileDoc[0].uri }}
                          style={globalStyles.pdf}
                        />
                      )
                    }
                  </View>)}
              </BasicView>


              <BasicView>
              <Button loading={loading} onPress={handleSubmit(onSubmit)}>
                <ButtonText>{t('auth:register')}</ButtonText>
              </Button>
            </BasicView>

            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Login');
              }}
              style={[globalStyles.marginTop20, globalStyles.centerView]}>
              <Text style={globalStyles.touchablePlainTextSecondary}>
                {t('auth:alreadyHaveAccount')}
              </Text>
            </TouchableOpacity>
          </View>
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
