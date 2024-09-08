import { View, Text, SafeAreaView, Image, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, PermissionsAndroid, ToastAndroid, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { globalStyles } from '../../styles/global'
import { colors } from '../../utils/colors'
import Icon from 'react-native-vector-icons/AntDesign';
import Iconions from 'react-native-vector-icons/Ionicons';
import Divider from '../../components/Divider';
import { breakTextIntoLines, getLocationName, makePhoneCall } from '../../utils/utilts';
import { useTranslation } from 'react-i18next';
import { useSelector, RootStateOrAny, useDispatch } from 'react-redux';
import { firebase } from '@react-native-firebase/storage';
import RNFS from 'react-native-fs';
import { updateProfile, userLogout, userLogoutThunk } from '../auth/userSlice';
import DocumentPicker, { types } from 'react-native-document-picker'
import Notification from '../../components/Notification';
import ToastNotification from '../../components/ToastNotification/ToastNotification';
import { mediaPermissions } from '../../permissions/MediaPermissions';

const Account = ({ navigation }: any) => {

  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { loading, user, residence } = useSelector(
    (state: RootStateOrAny) => state.user,
  );

  const { isDarkMode } = useSelector(
    (state: RootStateOrAny) => state.theme,
  );

  const { selectedLanguage } = useSelector(
    (state: RootStateOrAny) => state.language,
  );


  const [profile, setProfile] = useState(null)
  const [uploadingPic, setUploadingPic] = useState(false)
  const [message, setMessage] = useState('');


  const data = {
    image_url: '',
    doc_type: ''
  }


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

  const setDisappearMessage = (message: any) => {
    setMessage(message);

    setTimeout(() => {
      setMessage('');
    }, 5000);
  };

  const stylesGlobal = globalStyles();

  const [locationName, setLocationName] = useState(null);
  const [workingLocation, setWorkingLocation] = useState(null)


  useEffect(() => {

    const latitudeData = user?.provider ? user?.provider?.latitude : user?.employee?.latitude
    const longitudeData = user?.provider ? user?.provider?.longitude : user?.employee?.longitude;

    setWorkingLocation({ latitude: latitudeData, longitude: longitudeData });
    getLocationName(latitudeData, longitudeData)
      .then((locationName) => {
        setLocationName(locationName);

      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }, [user?.provider?.latitude, user?.provider?.longitude, user?.employee?.latitude, user?.employee?.longitude]);



  const lastNidaStatus = user?.provider?.nida_statuses?.[user?.provider?.nida_statuses.length - 1]?.status;


  const confirmLogout = () =>
    Alert.alert(`${t('screens:logout')}`, `${t('screens:areYouSureLogout')}`, [
      {
        text: `${t('screens:cancel')}`,
        onPress: () => console.log('Cancel Logout'),
        style: 'cancel',
      },
      {
        text: `${t('screens:ok')}`,
        onPress: () => {
          dispatch(userLogoutThunk());
        },
      },
    ]);




  const getPathForFirebaseStorage = async (uri: any) => {

    const destPath = `${RNFS.TemporaryDirectoryPath}/text`;
    await RNFS.copyFile(uri, destPath);

    return (await RNFS.stat(destPath)).path;
  };
  const handleSaveProfilePicture = async () => {
    if (!profile) return false;

    const [file] = profile;
    const { type: doc_type, uri: doc_uri } = file;

    const fileExtension = doc_type.split("/").pop();
    const fileName = `${makeid(10)}.${fileExtension}`;
    const storageRef = firebase.storage().ref(`profile/${fileName}`);

    try {


      const permissionsGranted = await mediaPermissions();
      if (!permissionsGranted) {
        ToastNotification(`${t('screens:mediaPermissionNotGranted')}`, 'default', 'long');
        return;
      }


      setUploadingPic(true);
      const snapshot = await storageRef.putFile(await getPathForFirebaseStorage(doc_uri));

      if (snapshot.state === firebase.storage.TaskState.SUCCESS) {
        const downloadUrl = await storageRef.getDownloadURL();
        data.doc_type = doc_type;
        data.image_url = downloadUrl;

        const result = await dispatch(updateProfile({ data: data, userId: user.id })).unwrap();

        if (result.status) {
          setUploadingPic(false)
          console.log('executed this true block');
          ToastNotification(`${t('screens:pictureUpdatedSuccessfully')}`, 'success', 'long')
        } else {

          ToastNotification(`${t('screens:requestFail')}`, 'danger', 'long')
        }

        console.log(result);
      }

    } catch (error) {
      console.warn(error);
      return false;
    }


  };

  const selectProfile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.images],
      });
      setProfile(res);

    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        setProfile(null);

      } else {
        // For Unknown Error
        alert("Unknown Error: " + JSON.stringify(error));
        throw error;
      }
    }
  };

  const phoneNumber = `${user?.phone}`;
  return (
    <SafeAreaView
      style={stylesGlobal.scrollBg}
    >
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={stylesGlobal.appView}>

          {(user?.provider || user?.employee) && user?.provider?.status == 'Pending approval' ? (<Notification
            message={`${t('screens:accountPendingActivation')}`}
            type="info"
          />) : (<View />)}

          {user.status == 'Active' && user?.provider?.status == 'Pending approval' ? (<Notification
            message={`${t('screens:reregitrationProvider')}`}
            type="info"
          />) : (<View />)}

          {user?.provider?.status == 'Deactivated' ? (<Notification
            message={`${t('screens:accountDeactivated')}`}
            type="danger"
          />) : (<View />)}


          {user?.provider?.subscription_status == 'Ended' ? (
            <Notification
              message={`${t('screens:subscriptionEnded')}`}
              type="danger"
            />) : (<View />)}


          {((user?.provider || user?.employee) && user?.status !== 'In Active') ? (
            <View style={styles.btnView}>
              {profile == null ? (<View />) : (
                <TouchableOpacity
                  onPress={handleSaveProfilePicture}
                  style={styles.picture_save}
                  disabled={loading || uploadingPic} // Disable the button when loading or uploadingPic is true
                >
                  {loading || uploadingPic ? (
                    // Render loader when loading or uploadingPic is true
                    <View style={{ flexDirection: 'row' }}>
                      <Text style={{ marginHorizontal: 3, color: isDarkMode ? colors.black : colors.white }}>
                        {t('screens:uploding')}
                      </Text>
                      <ActivityIndicator size="small" color={colors.white} />
                    </View>
                  ) : (

                    <Text style={{
                      paddingVertical: 3,
                      paddingHorizontal: 6,
                      color: colors.white
                    }}>
                      {t('screens:updatePicture')}
                    </Text>
                  )}
                </TouchableOpacity>
              )}

              {user?.provider?.subscription_status !== 'Ended' ? (
                <TouchableOpacity style={{ marginRight: 10, alignSelf: 'flex-end' }}
                  onPress={() => {
                    if (user.provider)
                      navigation.navigate('Edit Account', {
                        provider: user?.provider
                      })
                    else
                      navigation.navigate('Edit Account', {
                        employee: user?.employee
                      })
                  }}
                >
                  <Icon
                    name="edit"
                    color={isDarkMode ? colors.white : colors.black}
                    size={25}
                  />
                </TouchableOpacity>
              ) : (<></>)}
            </View>
          ) : (<View />)}

          <View style={[stylesGlobal.circle, { backgroundColor: colors.white, marginTop: 15, alignContent: 'center', justifyContent: 'center' }]}>
            <Image
              source={!user.profile_img ? (profile == null ? require('../../../assets/images/profile.png') : { uri: profile[0]?.uri }) : { uri: user.profile_img }}
              style={{
                resizeMode: "cover",
                width: 90,
                height: 95,
                borderRadius: 90,
                alignSelf: 'center'
              }}
            />
            <TouchableOpacity style={styles.cameraDiv} onPress={selectProfile}>
              <Icon
                name="camera"
                size={23}
                color={colors.white}
                style={styles.camera}
              />
            </TouchableOpacity>
          </View>
          <Text style={{ color: isDarkMode ? colors.white : colors.secondary, alignSelf: 'center', fontFamily: 'Prompt-Bold' }}>{user?.name}</Text>

          <View style={{ marginLeft: 10 }}>

            <Text style={{ color: isDarkMode ? colors.white : colors.black, fontFamily: 'Prompt-Bold', }}>{t('screens:accountNumber')}</Text>
            <Text style={{ color: isDarkMode ? colors.white : colors.black, fontFamily: 'Prompt-Regular', }}>#{user?.reg_number}</Text>

            {user?.provider ? (
              <>
                <Text style={{ color: isDarkMode ? colors.white : colors.black, fontFamily: 'Prompt-Bold', marginBottom: 10 }}>{t('screens:business')}</Text>
                <TouchableOpacity style={{ flexDirection: 'row', marginBottom: 10 }}
                  onPress={() => { }}
                >
                  <Iconions
                    name="business-sharp"
                    color={isDarkMode ? colors.white : colors.black}
                    size={25}
                  />
                  <Text style={{ paddingHorizontal: 10, color: isDarkMode ? colors.white : colors.alsoGrey, fontFamily: 'Prompt-Regular' }}>{user?.provider?.business_name}</Text>
                </TouchableOpacity>
                <Text style={{ color: isDarkMode ? colors.white : colors.black, fontFamily: 'Prompt-Bold', }}>{t('screens:profession')}</Text>
                <TouchableOpacity style={{ flexDirection: 'row' }}
                  onPress={() => { }}
                >

                  <Icon
                    name="idcard"
                    color={isDarkMode ? colors.white : colors.black}
                    size={25}
                  />
                  <Text style={{ paddingHorizontal: 10, color: isDarkMode ? colors.white : colors.alsoGrey, fontFamily: 'Prompt-Regular', }}>{selectedLanguage == 'en' ? user?.provider?.designation?.name?.en : user?.provider?.designation?.name?.sw}</Text>
                </TouchableOpacity>
              </>) : (<></>)
            }
            {
              user?.provider?.pending_profession ? (
                <Text style={{ color: 'orange', marginBottom: 10, fontFamily: 'Prompt-Regular', }}>
                  {t('screens:YouHavePendingProffessionRequest')}.
                  {' '}
                  <Text style={{ fontWeight: 'bold' }}>
                    "{selectedLanguage === 'en'
                      ? user?.provider?.pending_profession?.name?.en
                      : user?.provider?.pending_profession?.name?.sw}"
                  </Text>
                </Text>
              ) : (
                <></>
              )
            }
            <Text style={{ color: isDarkMode ? colors.white : colors.black, fontFamily: 'Prompt-Bold', }}>{t('auth:phone')}</Text>
            <TouchableOpacity style={{ flexDirection: 'row', marginBottom: 10 }}
              onPress={() => makePhoneCall(phoneNumber)}
            >
              <Icon
                name="phone"
                color={isDarkMode ? colors.white : colors.black}
                size={25}
              />
              <Text style={{ paddingHorizontal: 10, color: isDarkMode ? colors.white : colors.secondary, fontFamily: 'Prompt-Regular', }}>{user.phone}</Text>
            </TouchableOpacity>
            <Text style={{ color: isDarkMode ? colors.white : colors.black, fontFamily: 'Prompt-Bold', }}>{t('auth:email')}:</Text>
            <TouchableOpacity style={{ flexDirection: 'row', marginBottom: 10 }}>
              <Icon
                name="mail"
                color={isDarkMode ? colors.white : colors.black}
                size={25}
              />
              {user?.email == null ? (<Text style={{ color: isDarkMode ? colors.white : colors.alsoGrey }}> {t('screens:noEmail')}</Text>) : (<Text style={{ paddingLeft: 10, color: isDarkMode ? colors.white : colors.black }}>{user?.email}</Text>)
              }
            </TouchableOpacity>
            <Text style={{ color: isDarkMode ? colors.white : colors.black, fontFamily: 'Prompt-Bold', }}>{t('screens:officeLocation')}</Text>
            <TouchableOpacity style={{ flexDirection: 'row', marginBottom: 10 }}>
              <Icon
                name="enviroment"
                color={isDarkMode ? colors.white : colors.black}
                size={25}
              />
              {
                workingLocation == null ? (<Text style={{ color: isDarkMode ? colors.white : colors.alsoGrey }}> {t('screens:noresidenceData')}</Text>) : (<Text style={{ paddingLeft: 10, color: isDarkMode ? colors.white : colors.black }}>{breakTextIntoLines(locationName, 20)}</Text>)
              }

            </TouchableOpacity>

            {user?.provider ? (
              <>
                <Text style={{ color: isDarkMode ? colors.white : colors.black, fontFamily: 'Prompt-Bold', }}>{t('screens:residentialLocation')}</Text>
                <TouchableOpacity style={{ flexDirection: 'row', marginBottom: 10 }}>
                  <Icon
                    name="enviroment"
                    color={isDarkMode ? colors.white : colors.black}
                    size={25}
                  />
                  {
                    (residence === null || Object.keys(residence || {}).length === 0) ?

                      (<Text style={{ color: colors.dangerRed, fontFamily: 'Prompt-Regular', }}>{t('screens:noresidenceData')}</Text>) :

                      (
                        <Text style={{ paddingLeft: 10, color: isDarkMode ? colors.white : colors.black, fontFamily: 'Prompt-Regular', }}>
                          {breakTextIntoLines(
                            `${residence?.region?.region_name}, ${residence?.district?.district_name}, ${residence?.ward?.ward_name}, ${residence?.area?.place_name}`,
                            20
                          )}
                        </Text>
                      )
                  }

                </TouchableOpacity>
                <Text style={{ color: isDarkMode ? colors.white : colors.black, fontFamily: 'Prompt-Bold', }}>{t('auth:nida')}</Text>

                <TouchableOpacity style={{ flexDirection: 'row' }}
                >
                  <Icon
                    name="infocirlce"
                    color={isDarkMode ? colors.white : colors.black}
                    size={25}
                  />
                  <Text style={{ color: isDarkMode ? colors.white : colors.black, fontFamily: 'Prompt-Regular', }}>{user?.nida}</Text>
                </TouchableOpacity>
                <Text style={{ color: lastNidaStatus == 'A.Valid' ? colors.successGreen : colors.dangerRed, fontFamily: 'Prompt-Regular', }}>{lastNidaStatus == 'A.Valid' ? t('screens:verified') : t('screens:unVefified')}</Text>
              </>
            ) : (<></>)}
          </View>
          {user?.provider && user?.provider?.status !== 'Deactivated' && user?.provider?.subscription_status !== 'Ended' ? (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('My Documents', {
                  provider: user?.provider
                })
              }}
              style={{
                alignSelf: 'flex-end',
                backgroundColor: colors.alsoLightGrey,

              }}>
              <Text style={{
                padding: 5,
                color: colors.black,
                fontFamily: 'Prompt-Bold',
              }}>{t('screens:myDocuments')}</Text>
            </TouchableOpacity>
          ) : (<View />)}
          <View style={{ marginVertical: 20 }}>
            <Divider />
          </View>
          {user?.provider?.status !== 'Deactivated' ? (
            <TouchableOpacity style={{ flexDirection: 'row', marginHorizontal: 10, marginTop: 5 }}
              onPress={() => { navigation.navigate("Change Password") }}
            >
              <Icon
                name="lock1"
                color={isDarkMode ? colors.white : colors.secondary}
                size={25}
              />
              <Text style={{ paddingLeft: 10, fontFamily: 'Prompt-Bold', color: isDarkMode ? colors.white : colors.secondary }}>{t('screens:changePassword')}</Text>
            </TouchableOpacity>
          ) : (<></>)}

          <TouchableOpacity style={{ flexDirection: 'row', marginHorizontal: 10, marginTop: 10, marginBottom: '30%' }}
            onPress={() => {
              confirmLogout();
            }}
          >
            <Icon
              name="logout"
              color={colors.dangerRed}
              size={25}
            />
            <Text style={{ paddingLeft: 10, fontFamily: 'Prompt-Bold', color: isDarkMode ? colors.white : colors.secondary }}>{t('navigate:logout')}</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  btnView: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },

  picture_save: {
    marginRight: 25,
    marginTop: 10,
    backgroundColor: colors.secondary,
    borderRadius: 10

  },
  camera: {
    paddingVertical: 5,
    paddingHorizontal: 10
  },
  cameraDiv: {
    borderRadius: 15,
    backgroundColor: colors.secondary,
    marginTop: -20,
    marginLeft: 55,
    position: "relative",
  },

});

export default Account