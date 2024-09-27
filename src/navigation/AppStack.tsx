import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DrawerNavigator from "./DrawerNavigator";
import RequestedServices from "../features/Service/RequestedServices";
import MyBusiness from "../features/business/MyBusiness";
import BusinessDetails from "../features/business/BusinessDetails";
import AddBusinessScreen from "../features/business/AddBusiness";
import AddSubServiceScreen from "../features/business/AddSubServiceScreen";
import Settings from "../features/settings/Settings";
import { useTranslation } from "react-i18next";
import Employees from "../features/employees/Employees";
import AddEmployees from "../features/employees/AddEmployees";
import EmployeeAccount from "../features/employees/EmployeeAccount";
import EditAccount from "../features/account/EditAccount";
import Documents from "../features/account/Documents";
import ChangePassword from "../features/auth/ChangePassword";
import EditSubService from "../features/business/EditSubService";
import ViewSubService from "../features/business/ViewSubService";
import Subscriptions from "../features/subscriptions/Subscriptions";
import { useEffect, useRef, useState } from "react";
import {getUserData, postUserOnlineStatus } from "../features/auth/userSlice";
import { useAppDispatch } from "../app/store";
import FCMMessageHandler from "../components/FCMMessageHandler";
import { useSelector } from "react-redux";
import { AppState, Platform } from "react-native";
import PackagePayments from "../features/payments/PackagePayments";
import Notifications from "../features/Notifications/Notifications";
import { getActiveRequests, getEmployeeActiveRequests } from "../features/requests/RequestSlice";
import { handleDeviceToken } from "../utils/handeDeviceToken";
import ProviderSubServiceDetails from "../features/subservices/ProviderSubServiceDetails";
import messaging from '@react-native-firebase/messaging';


const AppStack = () => {

  const { t } = useTranslation();

  const Stack = createNativeStackNavigator();
  const dispatch = useAppDispatch();

  const screenOptions = {
    headerShown: true,
    headerTitleStyle: {
      fontFamily: 'Prompt-Regular', 
      fontSize: 15, 
    },
  };

    const { user} = useSelector((state: RootStateOrAny) => state.user);
    const appState = useRef(AppState.currentState);
    const [appStateVisible, setAppStateVisible] = useState(appState.current);



    useEffect(() => {
      const unsubscribe = handleDeviceToken(dispatch, user);
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }, [dispatch, user]);



    // useEffect(() => {
    
    //   const retrieveDeviceToken = async () => {
    //     try {
    //       const token = await messaging().getToken();
    //       console.log('Device Token:', token);
    //       // if (user) {
    //       //   dispatch(postUserDeviceToken({ userId: user?.id, deviceToken: token }));
    //       // }
    //     } catch (error) {
    //       console.log('Error retrieving device token:', error);
    //     }
    //   };
  
    //   const handleTokenRefresh = async (token) => {
    //     console.log('New token:', token);
    //     // if (user) {
    //     //   dispatch(postUserDeviceToken({ userId: user?.id, deviceToken: token }));
    //     // }
    //   };
    //   if (Platform.OS === 'ios') {
    //     const requestPermission = async () => {
    //       try {
    //         await messaging().requestPermission();
    //         retrieveDeviceToken();
    //       } catch (error) {
    //         console.log('Permission denied:', error);
    //       }
    //     };
  
    //     requestPermission();
    //   } else {
    //     retrieveDeviceToken();
    //   }
  
    //   // Listen for token refresh
    //   const unsubscribeOnTokenRefresh = messaging().onTokenRefresh(handleTokenRefresh);
  
    //   return () => {
    //     unsubscribeOnTokenRefresh();
    //   };
    // }, [dispatch, user]);

    
    useEffect(() => {
      let data={
        isOnline:false
      }
      const handleAppStateChange = (nextAppState) => {
      
        appState.current = nextAppState;
        setAppStateVisible(appState.current);
        console.log('AppState', appState.current);
        if (appState.current === 'active') {
          console.log('App has come to the foreground!');
          if (user) {
               data.isOnline=true
            dispatch(postUserOnlineStatus({ userId: user?.id, data }));
            
            handleDeviceToken(dispatch, user);
            if(user?.provider){
              dispatch(getUserData(user?.id,'provider'))
              dispatch(getActiveRequests(user?.provider?.id));
             }else if(user?.employee){
              dispatch(getUserData(user?.id,'employee'))
              dispatch(getEmployeeActiveRequests(user?.employee?.id));
             } 
          }
        }
        if (appState.current === 'background') {
          console.log('App has gone to the background!');
          if (user) {
            data.isOnline=false
            dispatch(postUserOnlineStatus({ userId: user?.id, data }));
          
          }
        }
      };
  
      const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
  
      return () => {
        appStateSubscription.remove();
      };
    }, [dispatch]);
  return (
    <>
    <FCMMessageHandler />
    <Stack.Navigator initialRouteName="Home"  screenOptions={screenOptions}>
      <Stack.Screen name="Home" component={DrawerNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Requested services"
        component={RequestedServices}
        options={{ title: t('navigate:requestedServices') }}
      />

      <Stack.Screen name="Edit sub service"
        component={EditSubService}
        options={{ title: t('navigate:editSubService') }}
      />

      <Stack.Screen name="Package Payments"
        component={PackagePayments}
        options={{ title: t('navigate:packagePayment') }}
      />
       <Stack.Screen name="View sub service"
        component={ViewSubService}
        options={{ title: t('navigate:viewSubService') }}
      />
      <Stack.Screen name="My Businesses" component={MyBusiness}
        options={{ title: t('navigate:business') }}
      />
      <Stack.Screen name="Business Details"
        component={BusinessDetails}
        options={{ title: t('navigate:businessDetails') }}
      />
      <Stack.Screen name="Add Business"
        component={AddBusinessScreen}
        options={{ title: t('navigate:addBusiness') }}
      />
      <Stack.Screen name="Add Sub Service"
        component={AddSubServiceScreen}
        options={{ title: t('navigate:addSubService') }}
      />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{ title: t('navigate:settings') }}
      />
        <Stack.Screen name="providerSubServiceDetails"
          component={ProviderSubServiceDetails}
          options={{ title: t('navigate:providerSubServiceDetails') }}
        />

      <Stack.Screen
        name="Employees"
        component={Employees}
        options={{ title: t('navigate:employees') }}
      />

      <Stack.Screen
        name="Add Employees"
        component={AddEmployees}
        options={{ title: t('navigate:addEmployee') }}
      />

      <Stack.Screen
        name="Employee Account"
        component={EmployeeAccount}
        options={{ title: t('navigate:employeeAccount') }}
      />
      
      <Stack.Screen name="Edit Account"
         component={EditAccount}
         options={{ title: t('navigate:editAccount') }}
        />

        <Stack.Screen name="Change Password"
         component={ChangePassword}
         options={{ title: t('navigate:changePassword') }}
          />
       <Stack.Screen name="My Documents"
         component={Documents}
         options={{ title: t('screens:myDocuments') }}
          />
        <Stack.Screen name="Notifications"
         component={Notifications}
         options={{ title: t('screens:notifications') }}
          />
    
    <Stack.Screen name="Subscriptions"
         component={Subscriptions}
         options={{ title: t('navigate:subscriptions') }}
          />

    </Stack.Navigator>
    </>
  );
};

export default AppStack

