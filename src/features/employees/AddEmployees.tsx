import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, ToastAndroid } from 'react-native'
import React, { useState,useRef, useEffect } from 'react'
import { BasicView } from '../../components/BasicView'
import { globalStyles } from '../../styles/global'
import { Controller, useForm } from 'react-hook-form'
import { TextInputField } from '../../components/TextInputField'
import { colors } from '../../utils/colors'
import { useTranslation } from "react-i18next";
import PhoneInput from 'react-native-phone-number-input'
import Button from '../../components/Button'
import { ButtonText } from '../../components/ButtonText'
import { useAppDispatch } from '../../app/store'
import { useSelector,RootStateOrAny } from 'react-redux'
import { createEmployee, updateEmployee } from './EmployeeSlice'

const AddEmployees = ({route,navigation}:any) => {

    const [isEditMode, setIsEditMode] = useState(false);

    const { t } = useTranslation();
    const phoneInput = useRef<PhoneInput>(null);

    const [employee,setEmployee]=useState(null);

    
  const dispatch = useAppDispatch();

  const {user } = useSelector(
    (state: RootStateOrAny) => state.user,
  );
    const {loading } = useSelector(
      (state: RootStateOrAny) => state.employees,
  );

  const {
    control,
    handleSubmit,
    formState: { errors },trigger 
  } = useForm({
    defaultValues: {
      name: '',
      phone:'',
      
    },
  });


  useEffect(() => {
    // Watch for changes in the 'employee' object and trigger revalidation
    if (employee) {
      Object.keys(employee).forEach((key) => {
        trigger(key); // 'trigger' is from react-hook-form
      });
    }
  }, [employee]);


  const[message,setMessage]=useState("")
  const setDisappearMessage = (message: any) => {
    setMessage(message);

    setTimeout(() => {
      setMessage('');
    }, 5000);
  };

  useEffect(() => {
    const existingEmployee = route.params?.employee;
    if (existingEmployee) {
      setIsEditMode(true);
      setEmployee(existingEmployee)
      navigation.setOptions({
        title:t('navigate:editEmployee'),
      });
    }else{
        navigation.setOptions({
            title: t('navigate:addEmployee') ,
          }); 
    }
  }, [route.params]);


  const onSubmit = (data) => {
    console.log('dataaa',data);
    if (isEditMode) {
        dispatch(updateEmployee({data:data,employeeId:employee?.id}))
      .unwrap()
      .then(result => {
        if (result.status) {
    
          ToastAndroid.show(`${t('screens:updatedSuccessfully')}`, ToastAndroid.SHORT);
          navigation.navigate('Employees', {
            screen: 'Employees',
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
    } else {
      console.log('dataaa',data);
      dispatch(createEmployee({data:data,providerId:user.provider.id}))
          .unwrap()
          .then(result => {
            if (result.status) {
        
              ToastAndroid.show(`${t('screens:addedSuccessfully')}`, ToastAndroid.SHORT);
              navigation.navigate('Employees', {
                screen: 'Employees',
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
  };

  return (
    <SafeAreaView
    style={globalStyles.scrollBg}
  >
    <View style={styles.container}>
    <BasicView style={globalStyles.centerView}>
              <Text style={globalStyles.errorMessage}>{message}</Text>
      </BasicView>

    <BasicView>
      <Text
        style={[
          globalStyles.inputFieldTitle,
          globalStyles.marginTop20,
        ]}>
       {t('screens:name')}
      </Text>

      <Controller
        control={control}
        rules={{
          maxLength: 12,
          required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInputField
            placeholder={t('screens:enterName')}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value || employee?.name}
          />
        )}
        name="name"
      />

      {errors.name && (
        <Text style={globalStyles.errorMessage}>
          {t('screens:nameRequired')}
        </Text>
      )}
    </BasicView>
    
    <BasicView>
              <Text
                style={[
                  globalStyles.inputFieldTitle,
                  globalStyles.marginTop20,
                ]}>
                  {t('auth:phone')}
              </Text>

              <Controller
                control={control}
                rules={{
                  maxLength: 12,
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInputField
                     placeholder= {t('screens:enterPhone')}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value || employee?.phone}
                    keyboardType='numeric'
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
          <Button loading={loading} onPress={handleSubmit(onSubmit)}>
            <ButtonText>{isEditMode ?`${t('navigate:editEmployee')}`:`${t('navigate:addEmployee')}`}</ButtonText>
          </Button>
        </BasicView>
  </View>
  </SafeAreaView>
  )
}


const styles = StyleSheet.create({
    container: {
      paddingTop: 20,
      paddingHorizontal: 20,
      alignItems: 'center',
  
    },

 
    textStyle: {
      color: colors.black,
      marginBottom: 10,
      fontSize: 17,
  
    }
  
  })

export default AddEmployees