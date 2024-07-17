import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import { useSelector, RootStateOrAny } from 'react-redux';
import { logoutOtherDevice, changeNidaStatus, setUserChanges, setUserSubcriptionStatus, updateProviderChanges } from '../features/auth/userSlice';
import { useAppDispatch } from '../app/store';
import { setRequestStatus } from '../features/requests/RequestSlice';
import { setServiceApproval } from '../features/subservices/SubservicesSlice';

const FCMMessageHandler = () => {
  const { user } = useSelector((state: RootStateOrAny) => state.user);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      handleRemoteMessage(remoteMessage);
    });

    // Handle messages when the app is in the background or terminated
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      handleRemoteMessage(remoteMessage);
    });

    return () => {
      unsubscribeForeground();
    };
  }, []);

  const handleRemoteMessage = remoteMessage => {
    const { data,notification } = remoteMessage;

  //   console.log('datatatatata',data);

    if (data && data.type) {
      const type = data.type;
      // Perform actions based on the type
      switch (type) {
        case 'account_changed':
        const userChanges = data.userChanges ? JSON.parse(data.userChanges) : {};
        const providerChanges = data.providerChanges ? JSON.parse(data.providerChanges) : {};
        dispatch(setUserChanges(userChanges));
      //  dispatch(setProviderChanges(providerChanges));
        dispatch(updateProviderChanges(providerChanges))
          break;
          case 'logout_device':
            dispatch(logoutOtherDevice());
            break;
        case 'request_status_changed':
             dispatch(setRequestStatus(data.request))
          break;
          case 'nida_status_chaged':
            dispatch(changeNidaStatus(data.nidaStatus))
            break;
        case 'service_approval':
          dispatch(setServiceApproval(data.providerSubService))
          break;
        case 'subscription_status':
          dispatch(setUserSubcriptionStatus(data.subStatus));
          break;
        default:
          // Handle other types or default case
          break;
      }
    }
  };

  return null;
};

export default FCMMessageHandler;
