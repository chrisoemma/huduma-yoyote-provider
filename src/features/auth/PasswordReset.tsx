import React, {useEffect, useRef, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';

import Icon from 'react-native-vector-icons/Feather';

import {useForm, Controller} from 'react-hook-form';
import {RootStateOrAny, useSelector} from 'react-redux';
import {useAppDispatch} from '../../app/store';
import {globalStyles} from '../../styles/global';
import {useTogglePasswordVisibility} from '../../hooks/useTogglePasswordVisibility';
import PhoneInput from 'react-native-phone-number-input';
import {colors} from '../../utils/colors';
import {Container} from '../../components/Container';
import {BasicView} from '../../components/BasicView';
import Button from '../../components/Button';
import {ButtonText} from '../../components/ButtonText';
import {resetPassword} from './userSlice';
import { useTranslation } from 'react-i18next';

const PasswordResetScreen = ({route, navigation}: any) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const {verificationCode} = route.params;

  const {user, loading, status} = useSelector(
    (state: RootStateOrAny) => state.user,
  );
  const {passwordVisibility, rightIcon, handlePasswordVisibility} =
    useTogglePasswordVisibility();

  const [message, setMessage] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    console.log(user);
  }, [user]);

  // useEffect(() => {
  //   if (status !== '') {
  //     setMessage(status);
  //   }
  // }, [status]);


  const stylesGlobal = globalStyles();

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });
  const onSubmit = (data: any) => {


    if (data.password !== data.confirmPassword) {
      setConfirmError(t('auth:passwordMismatch'));
      return;
    } else {
      setConfirmError('');
    }

    
    dispatch(
      resetPassword({
        phone: user.phone,
        code: verificationCode,
        password: data.password,
      }),
    )
      .unwrap()
      .then(result => {
        // handle result here
        console.log('result');
        console.log(result);

        if (result.status) {
          console.log('Navigate to login');
          navigation.navigate('Login');
        } else {
          console.log('Message with error should be set');
        }
      })
      .catch(rejectedValueOrSerializedError => {
        // handle error here
        console.log('error');
        console.log(rejectedValueOrSerializedError);
      });
  };

  return (
    <SafeAreaView  style={stylesGlobal.scrollBg}>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
      
          <BasicView style={stylesGlobal.marginTop60}>
            <Text style={stylesGlobal.mediumHeading}>{t('auth:resetPassword')}</Text>
          </BasicView>

          <BasicView>
            <Text style={stylesGlobal.errorMessage}>{message}</Text>
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
                        { backgroundColor: colors.white, color: colors.black }
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
            <Text
              style={[
                stylesGlobal.inputFieldTitle,
                stylesGlobal.marginTop20,
              ]}>
              {t('auth:confirmPassword')}
            </Text>

            <View style={stylesGlobal.passwordInputContainer}>
              <Controller
                control={control}
                rules={{
                  required: true,
                  validate: (value) => value === confirmPassword,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[stylesGlobal.passwordInputField,
                    { backgroundColor: colors.white, color: colors.black }
                    ]}
                    secureTextEntry={passwordVisibility}
                    placeholderTextColor={colors.alsoGrey}
                    placeholder={t('auth:confirmPassword')}
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      onChange(text);
                    }}
                    value={value}
                  />
                )}
                name="confirmPassword"
              />
              <TouchableOpacity onPress={handlePasswordVisibility}>
                <Icon name={rightIcon} size={20} color={colors.grey} />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
                <Text style={stylesGlobal.errorMessage}>
                  {t('auth:passwordRequired')}
                </Text>
              )}

            {confirmError && (
              <Text style={stylesGlobal.errorMessage}>
                {t('auth:passwordMismatch')}
              </Text>
            )}
          </BasicView>

          <BasicView style={stylesGlobal.marginTop30}>
            <Button loading={loading} onPress={handleSubmit(onSubmit)}>
              <ButtonText>{t('auth:changePassword')}</ButtonText>
            </Button>
          </BasicView>

          <BasicView>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Register');
              }}
              style={[stylesGlobal.marginTop20, stylesGlobal.centerView]}>
              <Text style={stylesGlobal.touchablePlainTextSecondary}>
                {t('auth:alreadyHaveAccount')}
              </Text>
            </TouchableOpacity>
          </BasicView>
      
      </ScrollView>
    </SafeAreaView>
  );
};

export default PasswordResetScreen;
