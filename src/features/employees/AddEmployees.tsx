import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, ToastAndroid } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
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
import { useSelector, RootStateOrAny } from 'react-redux'
import { createEmployee, updateEmployee } from './EmployeeSlice'
import { validateNIDANumber, validateTanzanianPhoneNumber } from '../../utils/utilts'

const AddEmployees = ({ route, navigation }: any) => {

  const [isEditMode, setIsEditMode] = useState(false);
  const [nidaError, setNidaError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [nidaLoading, setNidaLoading] = useState(false)

  const { t } = useTranslation();
  const phoneInput = useRef<PhoneInput>(null);

  const [employee, setEmployee] = useState(null);

  const stylesGlobal = globalStyles();

  const dispatch = useAppDispatch();

  const { user } = useSelector(
    (state: RootStateOrAny) => state.user,
  );
  const { loading } = useSelector(
    (state: RootStateOrAny) => state.employees,
  );


  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors }, trigger
  } = useForm({
    defaultValues: {
      name: '',
      phone: '',
      nida:''   
     }
  });



  const [message, setMessage] = useState("")
  const setDisappearMessage = (message: any) => {
    setMessage(message);

    setTimeout(() => {
      setMessage('');
    }, 10000);
  };

  useEffect(() => {
    const existingEmployee = route.params?.employee;
    if (existingEmployee) {
      const cleanedPhone = existingEmployee?.phone?.replace(/\+/g, '');
      setIsEditMode(true);
      setEmployee(existingEmployee)
      setValue('name', existingEmployee?.name);
      setValue('phone', cleanedPhone);
      setValue('nida', existingEmployee?.nida);

      navigation.setOptions({
        title: t('navigate:editEmployee'),
      });
    } else {
      navigation.setOptions({
        title: t('navigate:addEmployee'),
      });
    }
  }, [route.params]);


  const onSubmit = async(data) => {

  
    data.phone = validateTanzanianPhoneNumber(data.phone);

    if (isEditMode) {
      dispatch(updateEmployee({ data: data, employeeId: employee?.id }))
        .unwrap()
        .then(result => {
          if (result.status) {

            ToastAndroid.show(`${t('screens:updatedSuccessfully')}`, ToastAndroid.SHORT);
            navigation.navigate('Employees', {
              screen: 'Employees',
            });
          } else {
            if (result.error) {
                    setDisappearMessage(result.error
                    );
                  } else {
                    setDisappearMessage(result.message);
                  }
          }
        })
        .catch(rejectedValueOrSerializedError => {
          // handle error here
          console.log('error');
          console.log(rejectedValueOrSerializedError);
        });
    } else {
      data.provider_id=user?.provider?.id

    
      setNidaLoading(true)
      const nidaValidationResult = await validateNIDANumber(data.nida);
      setNidaLoading(false)
     if (!nidaValidationResult?.obj?.error || nidaValidationResult?.obj?.error?.trim() === '') {
       
    dispatch(createEmployee(data))
          .unwrap()
          .then(result => {
            if (result.status) {
              ToastAndroid.show(`${t('screens:addedSuccessfully')}`, ToastAndroid.SHORT);
              navigation.navigate('Employees', {
                screen: 'Employees',
              });
            } else {
              if (result.error) {
         
                setDisappearMessage(result.error
                );
              } else {
                setDisappearMessage(result.message);
              }
            }
          })
        
      } else {
        setNidaError(t('auth:nidaDoesNotExist'))
        console.log('NIDA validation failed:', nidaValidationResult.error);
      }

    }

    
  };

  return (
    <SafeAreaView
      style={stylesGlobal.scrollBg}
    >
      <View style={styles.container}>
        <BasicView style={stylesGlobal.centerView}>
          <Text style={stylesGlobal.errorMessage}>{message}</Text>
        </BasicView>

        <BasicView>
          <Text
            style={[
              stylesGlobal.inputFieldTitle,
              stylesGlobal.marginTop20,
            ]}>
            {t('screens:name')}
          </Text>

          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInputField
                placeholderTextColor={colors.alsoGrey}
                placeholder={t('screens:enterName')}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
            name="name"
          />

          {errors.name && (
            <Text style={stylesGlobal.errorMessage}>
              {t('screens:nameRequired')}
            </Text>
          )}
        </BasicView>

        <BasicView>
          <Text
            style={[
              stylesGlobal.inputFieldTitle,
              stylesGlobal.marginTop20,
            ]}>
            {t('auth:phone')}
          </Text>

          <Controller
            control={control}
            rules={{
              minLength: 10,
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInputField
                placeholderTextColor={colors.alsoGrey}
                placeholder={t('screens:enterPhone')}
                onBlur={onBlur}
                onChangeText={(text) => {
                  // Remove any non-numeric characters
                  const cleanedText = text.replace(/\D/g, '');

                  // Check if it starts with '0' or '+255'/'255'
                  if (cleanedText.startsWith('0') && cleanedText.length <= 10) {
                    onChange(cleanedText);
                  } else if (
                    (cleanedText.startsWith('255') ||
                      cleanedText.startsWith('+255')) &&
                    cleanedText.length <= 12
                  ) {
                    onChange(cleanedText);
                  }
                }}
                value={value}
                keyboardType='numeric'
                maxLength={12}

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
          {errors.nida && (
            <Text style={stylesGlobal.errorMessage}>
              {t('auth:nidaEmptyError')}
            </Text>
          )}
          {nidaError && (
            <Text style={stylesGlobal.errorMessage}>
              {nidaError}
            </Text>
          )}
        </BasicView>

        <BasicView>
          <Button loading={nidaLoading || loading} onPress={handleSubmit(onSubmit)}>
            <ButtonText>{isEditMode ? `${t('navigate:editEmployee')}` : `${t('navigate:addEmployee')}`}</ButtonText>
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