import { useEffect } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { Notifications } from 'react-native-notifications';

const useNotificationSetup = () => {
  useEffect(() => {
    const setupNotifications = async () => {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        Notifications.registerRemoteNotifications();

        Notifications.setNotificationChannel({
          channelId: 'high-priority-channel',
          name: 'High Priority Channel',
          importance: 4,
          description: 'A high priority channel for important notifications',
        
        });
      }

      // Request user permissions for iOS
      if (Platform.OS === 'ios') {
        await messaging().requestPermission();
      }
    };

    setupNotifications();
  }, []);
};

export default useNotificationSetup;
