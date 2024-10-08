import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import { useSelector, RootStateOrAny } from 'react-redux';
import { logoutOtherDevice, changeNidaStatus, setUserChanges, setUserSubcriptionStatus, updateProviderChanges, userLogoutThunk, setChangeProfession } from '../features/auth/userSlice';
import { useAppDispatch } from '../app/store';
import { getActiveRequests, setRequestRating, setRequestStatus } from '../features/requests/RequestSlice';
import { setServiceApproval } from '../features/subservices/SubservicesSlice';
import { changeDocStatus } from '../features/business/BusinessSlice';
import { addNotification } from '../features/Notifications/NotificationProviderSlice';
import { useNavigation } from '@react-navigation/native';
import { formatRequestTime } from '../utils/utilts';

const FCMMessageHandler = () => {
  const { user } = useSelector((state: RootStateOrAny) => state.user);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      handleRemoteMessage(remoteMessage);
    });

    // Handle messages when the app is in the background or terminated
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      handleRemoteMessage(remoteMessage);
    });

    // Listen for notification clicks
    const unsubscribeNotificationOpened = messaging().onNotificationOpenedApp(remoteMessage => {
      handleNotificationClick(remoteMessage);
    });

    // Check if notification caused app to open from a closed state
    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        handleNotificationClick(remoteMessage);
      }
    });

    return () => {
      unsubscribeForeground();
      unsubscribeNotificationOpened();
    };
  }, []);

  const handleRemoteMessage = remoteMessage => {
    const { data, notification } = remoteMessage;

  
    if (data && data.type) {
      const type = data.type;
      if(data?.notification_type){
        const creationTime = formatRequestTime(new Date());
        const notificationData = {
          id: data.id,
          type: data.notification_type,
          title: data.title,
          message: data.message,
          viewed: false,
          createdAt: creationTime,
        };
        dispatch(addNotification(notificationData));
        
      }
    

      switch (type) {
        case 'account_changed':
          const userChanges = data.userChanges ? JSON.parse(data.userChanges) : {};
          const providerChanges = data.providerChanges ? JSON.parse(data.providerChanges) : {};
          dispatch(setUserChanges(userChanges));
          dispatch(updateProviderChanges(providerChanges));
          break;
        case 'logout_device':
          dispatch(userLogoutThunk());
          break;
        case 'new_request':
           if(user?.provider){
            dispatch(getActiveRequests(user?.provider?.id));
           }
           case 'request_status_changed':
            const request = data.request ? JSON.parse(data.request) :{}
            dispatch(setRequestStatus({request,title:data.title}))
            break;
            case 'request_rating':
              const requestRating = data.request ? JSON.parse(data.request) :{}
             // console.log('requestRating',requestRating)
              dispatch(setRequestRating({requestRating,title:data.title}))
              break;
        case 'doc_status':
          dispatch(changeDocStatus({ docId: data.docId, docStatus: data.docStatus }));
          break;

        case 'nida_status_chaged':
          dispatch(changeNidaStatus(data.nidaStatus));
          break;
        case 'service_approval':
          const subService = data.providerSubService ? JSON.parse(data.providerSubService):{}
          dispatch(setServiceApproval(subService));
          break;
        case 'category':
          // console.log('category', data.category)
          // dispatch(setCategoryChanges(data.category))
          break;
          case 'profession_change':
            const pendingProfession = data.pending_profession ? JSON.parse(data.pending_profession) : null;
            const profession = data.profession ? JSON.parse(data.profession) : null;
            const status = data.status;
          
            dispatch(setChangeProfession({ pendingProfession, profession, status }));
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

  const handleNotificationClick = remoteMessage => {
    const { data } = remoteMessage;
    if (data && data.type) {
      navigation.navigate('Notifications');
    }
  };

  return null;
};

export default FCMMessageHandler;
