import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet } from 'react-native'
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

const AddEmployees = ({route,navigation}:any) => {

    const [isEditMode, setIsEditMode] = useState(false);

    const { t } = useTranslation();
    const phoneInput = useRef<PhoneInput>(null);

    const [employee,setEmployee]=useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      phone:'',
      email: '',
      desc:''
    },
  });

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
    if (isEditMode) {
      // Handle update logic
      // You can use data to update the existing employee
      // For example: updateEmployee(existingEmployee.id, data);
    } else {
      // Handle add logic
      // You can use data to add a new employee
      // For example: addEmployee(data);
    }
  };

  return (
    <SafeAreaView
    style={globalStyles.scrollBg}
  >
    <View style={styles.container}>
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
                    placeholder="672137313"
                    value={value}
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
       {t('screens:email')}
      </Text>

      <Controller
        control={control}
        rules={{
          maxLength: 12,
          required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInputField
            placeholder={t('screens:enterEmail')}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value || employee?.email}
           
          />
        )}
        name="email"
      />

    </BasicView>

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
                      value={value || employee?.desc}
                    />
                  )}
                  name="desc"
                />
              </BasicView>

        <BasicView>
          <Button onPress={() => { }}>
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