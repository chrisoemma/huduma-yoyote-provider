import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet,ToastAndroid } from 'react-native'
import React, { useState,useEffect } from 'react'
import { globalStyles } from '../../styles/global';
import { colors } from '../../utils/colors';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { BasicView } from '../../components/BasicView';
import Button from '../../components/Button';
import { ButtonText } from '../../components/ButtonText';
import { useForm, Controller } from 'react-hook-form';
import { TextInputField } from '../../components/TextInputField';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector,RootStateOrAny } from 'react-redux';
import { createSubService, getSubserviceByService } from '../subservices/SubservicesSlice';
import { useAppDispatch } from '../../app/store';
import DocumentPicker from 'react-native-document-picker';
import { useTranslation } from 'react-i18next';

const AddSubServiceScreen = ({route,navigation}:any) => {

  const {business,sub_services} = route.params;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  useEffect(() => {
      dispatch(getSubserviceByService({ serviceId: business?.service_id }));
  }, [business?.service_id]);

  const { user} = useSelector((state: RootStateOrAny) => state.user);
  const { loading, subServiceByService } = useSelector((state: RootStateOrAny) => state.subservices);


  //console.log('subServices',subServiceByService);

 // const filteredSubService = subServiceByService.filter(item => !sub_services.includes(item));

  const commonSubServices = subServiceByService.filter(itemB => sub_services.some(itemA => itemA?.id === itemB?.id));
  
  //console.log('common',filteredSubService);

  const [activeTab, setActiveTab] = useState('addFromList');
  const toggleTab = () => {
    setActiveTab(activeTab === 'addFromList' ? 'addNew' : 'addFromList');
  };

  const [checkedSubServices, setCheckedSubServices] = useState([]);
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [image, setImage] = useState(null)
  const [video,setVideo]=useState(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: ''
    },
  });

  const [message, setMessage] = useState(null);

  const setDisappearMessage = (message: any) => {
    setMessage(message);

    setTimeout(() => {
      setMessage('');
    }, 5000);
  };

  // const removeAttachment = () => {
  //   setImage(null);
  //   setVideo(null);
  // };

  const selectFile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
      });

      if (res.type === 'image') {
        setImage(res);
      } else if (res.type === 'video') {
        setVideo(res);
      }

    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        setImage(null);
        setVideo(null);
      } else {
        // For Unknown Error
        alert("Unknown Error: " + JSON.stringify(error));
        throw err;
      }
    }
  };


  // console.log('providersss',user.provider.id);
  const onSubmit = (data) => {
    data.provider_id = user.provider.id;
    data.service_id = business?.service_id;
    data.business_id=business?.id;
    // data.img_url="https/img_real.com";
    //data.video_url="https://www.youtube.com/watch?v=rKMEkQ-e9I8";
    data.sub_services = checkedSubServices;

    console.log('datatattta',data)

    if (checkedSubServices == null || data.name == null) {

    } else {

      dispatch(createSubService({data:data,providerId:user.provider.id,businessId:business.id}))
        .unwrap()
        .then(result => {
          if (result.status) {

            ToastAndroid.show(`${t('screens:addedSuccessfully')}`, ToastAndroid.SHORT);
            navigation.navigate('My Businesses', {
              screen: 'My Businesses',
            });
          } else {
            setDisappearMessage(
              `${t('screens:requestFail')}`,
            );
            console.log('dont navigate');
          }
        })
        .catch(rejectedValueOrSerializedError => {
          // handle error here
          console.log('error');
          console.log(rejectedValueOrSerializedError);
        });
    }
    console.log(data);
  }

  return (
    <SafeAreaView
      style={globalStyles.scrollBg}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={toggleTab}
        >
          <Text style={[styles.buttonText, activeTab === 'addFromList' ? styles.activeToggleText : null]}>
            Add from List
          </Text>
          <Text style={[styles.buttonText, activeTab === 'addNew' ? styles.activeToggleText : null]}>
            Add New Service
          </Text>
        </TouchableOpacity>
        <BasicView style={globalStyles.centerView}>
          <Text style={globalStyles.errorMessage}>{message}</Text>
        </BasicView>
        {
          activeTab === 'addFromList' ? (

            <View style={styles.checkBoxContainer}>

              <Text style={styles.textStyle}>Please Add by checking more sub services</Text>
              {
                subServiceByService.map(subservice => (
                  <BouncyCheckbox
                  // key={subservice.id}
                    size={25}
                    fillColor={colors.secondary}
                    style={{ marginTop: 5 }}
                    unfillColor="#FFFFFF"
                    text={subservice.name}
                    iconStyle={{ borderColor: "red" }}
                    innerIconStyle={{ borderWidth: 2 }}
                    textStyle={{ fontFamily: "JosefinSans-Regular" }}
                    isChecked={commonSubServices.some(commonSub => commonSub.id === subservice.id)} // Check if it's in commonSubServices
                    
                    onPress={(isChecked: boolean) => {
                      // Update the checked sub-services state
                      // const isSubserviceInCommon = commonSubServices.some(commonSub => commonSub.id === subservice.id);
                      // if (isSubserviceInCommon) {
                      //   return;
                      // }

                      if (isChecked) {
                        setCheckedSubServices(prevChecked => [...prevChecked, subservice.id]);
                      } else {
                        setCheckedSubServices(prevChecked =>
                          prevChecked.filter(id => id !== subservice.id)
                        );
                      }
                    }}
                  />
                ))
              }
            </View>
          ) : (

            <View>
              <BasicView>
                <Text
                  style={[
                    globalStyles.inputFieldTitle,
                    globalStyles.marginTop20,
                  ]}>
                  Sub service
                </Text>

                <Controller
                  control={control}
                  rules={{
                    maxLength: 12,
                    required: true,
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInputField
                      placeholder="Enter Sub service"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                  name="name"
                />

                {errors.name && (
                  <Text style={globalStyles.errorMessage}>
                    Sub service is required
                  </Text>
                )}
              </BasicView>

              <BasicView>
                <Text
                  style={[
                    globalStyles.inputFieldTitle,
                    globalStyles.marginTop20,
                  ]}>
                  Description
                </Text>

                <Controller
                  control={control}
                  rules={{
                    maxLength: 12,
                    required: true,
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInputField
                      placeholder="Enter Description"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                  name="description"
                />

                {errors.description && (
                  <Text style={globalStyles.errorMessage}>
                    Description service is required
                  </Text>
                )}
              </BasicView>

              <View style={{ marginVertical: 10 }}>
                <Text style={styles.textStyle}>Upload Video or image of the service you offer</Text>
                <View style={styles.imageContainer}>
                  <TouchableOpacity
                   onPress={selectFile}
                  >
                    <Text>Upload image</Text>
                    <Ionicons name="image"
                      color={colors.black}
                      size={100}
                      style={{ alignSelf: 'center' }}
                    />

                  </TouchableOpacity>

                </View>

              </View>

            </View>
          )}

        <BasicView>
          <Button loading={loading} onPress={handleSubmit(onSubmit)}>
            <ButtonText>Add Sub Service</ButtonText>
          </Button>
        </BasicView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {

    // flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',

  },
  toggleButton: {
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
  },
  activeToggleText: {
    color: colors.white,
    backgroundColor: colors.primary,
    borderRadius: 20
    // Active text color
  },
  buttonText: {
    color: colors.primary,
    padding: 10,
    marginRight: 5
    // Default text color
  },
  checkBoxContainer: {
    marginVertical: 30
  },
  textStyle: {
    color: colors.black,
    marginBottom: 10,
    fontSize: 17,

  }

})

export default AddSubServiceScreen