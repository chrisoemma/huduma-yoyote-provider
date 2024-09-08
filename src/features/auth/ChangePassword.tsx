import React, {useEffect, useRef, useState} from 'react';
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

import {useForm, Controller} from 'react-hook-form';
import {RootStateOrAny, useSelector} from 'react-redux';
import {useAppDispatch} from '../../app/store';
import {globalStyles} from '../../styles/global';
import {useTogglePasswordVisibility} from '../../hooks/useTogglePasswordVisibility';
import {Container} from '../../components/Container';
import {BasicView} from '../../components/BasicView';
import Button from '../../components/Button';
import {ButtonText} from '../../components/ButtonText';
import {changePassword} from './userSlice';
import { useTranslation } from 'react-i18next';
import { colors } from '../../utils/colors';
import ToastNotification from '../../components/ToastNotification/ToastNotification';

const ChangePassword = ({route, navigation}: any) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();


  const {user, loading, status} = useSelector(
    (state: RootStateOrAny) => state.user,
  );


  const stylesGlobal = globalStyles();

  const [message, setMessage] = useState('');

  const [passwordsMatch, setPasswordsMatch] = useState(true);

  useEffect(() => {
  }, [user]);

  useEffect(() => {
    if (status !== '') {
      setMessage(status);
    }
  }, [status]);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    defaultValues: {
      old_password: '',
      new_password:'',
      comfirm_password:''
    },
  });
  const onSubmit = (data: any) => {
    
    
    if (data.new_password === data.comfirm_password) {
    dispatch(changePassword({data:data,userId:user.id}))
      .unwrap()
      .then(result => {


        if (result.status) {
      
            ToastNotification(`${t('screens:updatedSuccessfully')}`,'success','long')
          navigation.navigate('Home');
        } else {
          ToastNotification(`${t('screens:requestFail')}`,'danger','long')
        }
      })
      .catch(rejectedValueOrSerializedError => {
        // handle error here
        console.log('error');
        console.log(rejectedValueOrSerializedError);
      });
    }else{
        setPasswordsMatch(false);
    }
  };

  return (
    <SafeAreaView style={stylesGlobal.scrollBg}>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
    
          <BasicView>
            <Text style={stylesGlobal.errorMessage}>{message}</Text>
          </BasicView>

          <BasicView>
              <Text
                style={[
                  stylesGlobal.inputFieldTitle,
                  stylesGlobal.marginTop20,
                ]}>
                {t('auth:oldPassword')}
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
                      placeholder={t('auth:enterOldPassword')}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                  name="old_password"
                />

              </View>
              {errors.old_password && (
                <Text style={stylesGlobal.errorMessage}>
                  {t('auth:oldPasswordRequired')}
                </Text>
              )}
            </BasicView>

            <BasicView>
              <Text
                style={[
                  stylesGlobal.inputFieldTitle,
                  stylesGlobal.marginTop20,
                ]}>
                {t('auth:newPassword')}
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
                  
                      placeholder={t('auth:enterNewPassword')}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                  name="new_password"
                />

              </View>
              {errors.new_password && (
                <Text style={stylesGlobal.errorMessage}>
                  {t('auth:newPasswordRequired')}
                </Text>
              )}
            </BasicView>


            <BasicView>
              <Text
                style={[
                  stylesGlobal.inputFieldTitle,
                  stylesGlobal.marginTop20,
                ]}>
                {t('auth:comfirmNewPassword')}
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
                      placeholder={t('auth:enterComfirmPassword')}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                  name="comfirm_password"
                />

              </View>
              {errors.comfirm_password && (
                <Text style={stylesGlobal.errorMessage}>
                  {t('auth:oldPasswordRequired')}
                </Text>
              )}
              {!passwordsMatch && (
    <Text style={stylesGlobal.errorMessage}>
         {t('auth:passwordMatch')}
    </Text>
  )}
            </BasicView>

          <BasicView style={stylesGlobal.marginTop30}>
            <Button loading={loading} onPress={handleSubmit(onSubmit)}>
              <ButtonText>{t('screens:changePassword')}</ButtonText>
            </Button>
          </BasicView>
   
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChangePassword;
