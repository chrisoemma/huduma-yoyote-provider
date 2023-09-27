import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ToastAndroid, Alert, ScrollView, Image } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { globalStyles } from '../../styles/global';
import DropDownPicker from "react-native-dropdown-picker";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { colors } from '../../utils/colors';
import DocumentPicker from 'react-native-document-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Button from '../../components/Button';
import { BasicView } from '../../components/BasicView';
import { ButtonText } from '../../components/ButtonText';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../app/store';
import { useSelector, RootStateOrAny } from 'react-redux';
import { getCategories } from '../category/CategorySlice';
import { transformDataToDropdownOptions } from '../../utils/utilts';
import { getServicesByCategory } from '../Service/ServiceSlice';
import { getSubserviceByService, clearSubServiceByService } from '../subservices/SubservicesSlice';
import { createBusiness } from './BusinessSlice';
import { useForm, Controller } from 'react-hook-form';
import { TextInputField } from '../../components/TextInputField';

const AddBusiness = ({route, navigation }: any) => {

  const [isEditmode,setIsEditMode]=useState(false);
 // const {business:editedBusiness,sub_services}=route?.params


  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      description: ''
    },
  });

  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  

  useEffect(() => {
    const existingBusiness= route?.params?.business;
    if (existingBusiness) {
      setIsEditMode(true);
      setValue(existingBusiness?.service?.category?.id)
      setServiceValue(existingBusiness?.service_id)
     
      navigation.setOptions({
        title:t('screens:editBusiness'),
      });
    }else{
        navigation.setOptions({
            title: t('screens:addBusiness') ,
          }); 
    }
  }, [route.params]);

  const [checkedSubServices, setCheckedSubServices] = useState([]);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);

  const [ServiceOpen, setServiceOpen] = useState(false);
  const [ServiceValue, setServiceValue] = useState(null);

  const { user } = useSelector((state: RootStateOrAny) => state.user);
  const { categories } = useSelector((state: RootStateOrAny) => state.categories);
  const { servicesByCategory } = useSelector((state: RootStateOrAny) => state.services);
  const { subServiceByService } = useSelector((state: RootStateOrAny) => state.subservices);
  const { loading, business } = useSelector((state: RootStateOrAny) => state.businesses);
  useEffect(() => {
    dispatch(clearSubServiceByService());  //clear sub service on first render not working
    setSubs([]);
    dispatch(getCategories());
  }, [dispatch]);

  useEffect(() => {
    // This effect is only for dispatching the action, it won't trigger unnecessary re-renders
    if (value !== null) {
      dispatch(getServicesByCategory({ categoryId: value }));
    }
  }, [value, dispatch]);


  // useEffect(() => {
  //   // This effect is only for dispatching the action, it won't trigger unnecessary re-renders
  //   if (ServiceValue !== null) {
  //     dispatch(getSubserviceByService({ serviceId: ServiceValue }));
  //   }
  // }, [ServiceValue, dispatch]);



  useEffect(() => {
    if (categories) {
      setItems(transformDataToDropdownOptions(categories));
      
    }
  }, [categories]);

  useEffect(() => {
    if (servicesByCategory) {
      setServiceItems(transformDataToDropdownOptions(servicesByCategory));
    }
  }, [servicesByCategory]);


  useEffect(() => {
    if (subServiceByService) {
      setSubs(subServiceByService);
    }
  }, [subServiceByService]);
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<string | null>(null);
  const [items, setItems] = useState(transformDataToDropdownOptions(categories));
  const [ServiceItems, setServiceItems] = useState(transformDataToDropdownOptions(servicesByCategory));
  const [subs, setSubs] = useState(subServiceByService)
  const removeImage = () => {
    setImageFile(null)
  }

  const removeVideo = () => {
    setVideoFile(null)
  }

  const onChangeCategory = async () => {

    if (value !== null) {
      // Clear the services list
      await dispatch(clearSubServiceByService());  //clear sub service on first render not working
      setSubs([]);
      setServiceItems([]);
      dispatch(getServicesByCategory({ categoryId: value }));
    }
  }

  const onChangeService = () => {
    if (ServiceValue !== null) {
      dispatch(getSubserviceByService({ serviceId: ServiceValue }));
    }
  }

  const ServiceItemsMemoized = useMemo(() => {
    return transformDataToDropdownOptions(servicesByCategory);
  }, [servicesByCategory]);

  // console.log('subservicesss', subServiceByService);

  // const uploadFile = async () => {
  //   try {
  //     const result = await DocumentPicker.pick({
  //       type: [DocumentPicker.types.images, DocumentPicker.types.video],
  //     });

  //     if (result.type === 'image' || result.type === 'video') {
  //       // Here, you can send the selected file (image or video) to your server or perform any desired action.
  //       // You can use the file's URI, name, and other details from the 'result' object.
  //     }
  //   } catch (error) {
  //     if (DocumentPicker.isCancel(error)) {
  //       // User cancelled the picker
  //     } else {
  //       throw error;
  //     }
  //   }
  // };


  //console.log('cheked subservice', checkedSubServices);
  //console.log('subs',subs);
  const [video, setVideo] = useState(null);
  const [image, setImage] = useState(null)
  const [message, setMessage] = useState(null);

  const setDisappearMessage = (message: any) => {
    setMessage(message);

    setTimeout(() => {
      setMessage('');
    }, 5000);
  };

  const removeAttachment = () => {
    setImage(null);
    setVideo(null);
  };

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


  //console.log('editing business',existingBusiness);

  // console.log('providersss',user.provider.id);
  const onSubmit = (data) => {
    data.provider_id = user.provider.id;
    data.category_id = value;
    data.service_id = ServiceValue;
    // data.img_url="https/img_real.com";
    //data.video_url="https://www.youtube.com/watch?v=rKMEkQ-e9I8";
    data.sub_services = checkedSubServices;

    if (value == null || ServiceValue == null) {

    } else {

      dispatch(createBusiness(data))
        .unwrap()
        .then(result => {
          if (result.status) {

            ToastAndroid.show(`${t('screens:businessAddedSuccessfully')}`, ToastAndroid.SHORT);
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
    <SafeAreaView style={globalStyles.scrollBg}>
      <ScrollView style={globalStyles.appView} showsVerticalScrollIndicator={false}>
        <BasicView style={globalStyles.centerView}>
          <Text style={globalStyles.errorMessage}>{message}</Text>
        </BasicView>
        <View style={styles.marginDropdown}>
          <DropDownPicker
            searchable={true}
            zIndex={6000}
            placeholder="Select Category"
            listMode="SCROLLVIEW"
            open={open}
            value={value}
            items={items}
            onChangeValue={onChangeCategory}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems}
          />
        </View>
        <View style={styles.marginDropdown}>
          <DropDownPicker
            searchable={true}
            placeholder="Select Service"
            listMode="SCROLLVIEW"
            open={ServiceOpen}
            value={ServiceValue}
            items={ServiceItemsMemoized}
            onChangeValue={onChangeService}
            setOpen={setServiceOpen}
            setValue={setServiceValue}
            setItems={setServiceItems}
          />
        </View>
        <View style={styles.checkBoxContainer}>
          <Text style={styles.textStyle}>Please choose the sub services you offer</Text>
          {
            subs.map(subservice => (
              <BouncyCheckbox
                key={subservice.id} // Add a key to each checkbox element
                size={25}
                fillColor={colors.secondary}
                style={{ marginTop: 5 }}
                unfillColor="#FFFFFF"
                text={subservice.name}
                iconStyle={{ borderColor: "red" }}
                innerIconStyle={{ borderWidth: 2 }}
                textStyle={{ fontFamily: "JosefinSans-Regular" }}
                onPress={(isChecked: boolean) => {
                  // Update the checked sub-services state
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
        <BasicView>
          <Text
            style={[
              globalStyles.inputFieldTitle,
              globalStyles.marginTop20,
            ]}>
            {t('screens:description')}
          </Text>

          <Controller
            control={control}
            rules={{
              maxLength: 12,
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInputField
                placeholder={t('screens:enterDescription')}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
            name="description"
          />

          {errors.description && (
            <Text style={globalStyles.errorMessage}>
              {t('screens:descriptionRequired')}
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
              {image == null ? (
                <Ionicons name="image"
                  color={colors.black}
                  size={100}
                  style={{ alignSelf: 'center' }}
                />
              ) : (<Image source={{ uri: image[0].uri }} style={styles.docView} />)}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={selectFile}
            >
              <Text>Upload Video</Text>
              <Ionicons name="videocam-outline"
                color={colors.black}
                size={100}
                style={{ alignSelf: 'center' }}
              />
            </TouchableOpacity>
          </View>
          <BasicView>
            <Button loading={loading} onPress={handleSubmit(onSubmit)}>
              <ButtonText>Add Business</ButtonText>
            </Button>
          </BasicView>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  marginDropdown: { marginBottom: 20 },
  checkBoxContainer: {
    marginVertical: 10
  },
  textStyle: {
    color: colors.black,
    marginBottom: 10,
    fontSize: 17,
  },
  docView: {
    flex: 1,
    width: 200,
    height: 150
  },
});

export default AddBusiness;
