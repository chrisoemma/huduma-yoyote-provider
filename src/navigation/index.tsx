import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, RootStateOrAny } from 'react-redux';
import AuthStack from './AuthNavigator';
import AppStack from './AppStack';
import { NavigationContainer, DefaultTheme, DarkTheme, ThemeProvider } from '@react-navigation/native';
import { navigationRef } from './RootNavigation';
import {Alert, Appearance, PermissionsAndroid} from 'react-native';
import { useAppDispatch } from '../app/store';
import { setTheme } from '../features/settings/ThemeSlice';
import { selectOnboardingCompleted } from '../features/onboarding/OnboardingSlice';
import OnBoardingStack from './OnboardingStack';
import { I18nextProvider } from 'react-i18next';
import i18n from '../costants/IMLocalize';
import { selectLanguage } from '../costants/languangeSlice';
import { startLocationTracking, stopLocationTracking } from '../components/Location/LocationService';
import { colors } from '../utils/colors';
import NewAccountStack from './NewAccountStack';
import Geolocation from '@react-native-community/geolocation';
import { postProviderLocation } from '../components/Location/LocationSlice';



const Navigation = () => {
  const { user } = useSelector((state: RootStateOrAny) => state.user);
  const { isDarkMode } = useSelector((state: RootStateOrAny) => state.theme);
  const onboardingCompleted = useSelector(selectOnboardingCompleted);
  const selectedLanguage = useSelector(selectLanguage);
  const dispatch = useAppDispatch();
  

  useEffect(() => {
  }, [user]);



  useEffect(() => {
    let watchId;
 
    const initializeLocationTracking = async () => {
      watchId = await startLocationTracking();
    };
    if (user?.token) {
    initializeLocationTracking();
    }
    return () => {
      if (watchId) {
        stopLocationTracking(watchId);
      }
    };
  }, []);



  useEffect(() => {
    let userType;
    if(user?.provider || user?.employee){
    const requestLocationPermission = async () => {
      try {
        if(user?.provider){
          userType='provider'
        }else{
         userType='employee'
        }
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'App needs access to your location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          Geolocation.getCurrentPosition(
            position => {
              const data = {
                provider_latitude: position.coords.latitude,
                provider_longitude: position.coords.longitude,
                userType:userType
              };
              dispatch(postProviderLocation({ providerId:userType=='provider'? user?.provider?.id:user?.employee?.id, data }));
            
            },
            error => {
              // console.error(error);
              // Alert.alert(
              //   'We could not get your location',
              //   'Failed to fetch your location. Please make sure location services are enabled.',
              //   [{ text: 'OK' }]
              // );
            },
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 60000,distanceFilter: 1000 }
          );
        } else {
          Alert.alert(
            'Permission Denied',
            'Without location permission, the app cannot function properly. Please grant permission in the app settings.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error(error);
      }
    };

   
    requestLocationPermission();
  }

  }, [user, dispatch]);



  useEffect(()=>{
    i18n.changeLanguage(selectedLanguage);
  },[])

  useEffect(() => {
    const appearanceChangeListener = Appearance.addChangeListener(({ colorScheme }) => {
              let value=false
               if(colorScheme=='dark'){
                 value=true
               }
      dispatch(setTheme(value));
    });

    return () => {
      appearanceChangeListener.remove();
    };
  }, [dispatch,isDarkMode]);


  const lightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: 'white',
      text: 'black',
      // Add any other custom light mode colors
    },
  };

  const darkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: colors.blackBackground,
      text: colors.white,
      inputText:colors.blackBackground
    },
  };



  return (
    
<I18nextProvider i18n={i18n}>
  <NavigationContainer theme={isDarkMode ? darkTheme : lightTheme} ref={navigationRef}>
    <ThemeProvider value={isDarkMode ? darkTheme : lightTheme}>
      {user?.token == null ? (
        onboardingCompleted ? (
          <AuthStack />
        ) : (
          <OnBoardingStack />
        )
      ) : (
        user?.provider !== null || user?.employee !==null ? (
          <AppStack />
        ) : (
          <NewAccountStack />
        )
      )}
    </ThemeProvider>
  </NavigationContainer>
</I18nextProvider>
  );
};

export default Navigation;
