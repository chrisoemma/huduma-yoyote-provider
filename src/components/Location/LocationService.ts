import Geolocation from '@react-native-community/geolocation';
import { calculateDistance } from '../../utils/utilts';
import { PermissionsAndroid } from 'react-native';
import { useDispatch, useSelector,RootStateOrAny } from 'react-redux';
import { postProviderLocation } from './LocationSlice';

export const startLocationTracking = async (MIN_DISTANCE_THRESHOLD = 100) => {
  let watchId;
  let lastKnownLocation = null;
  const dispatch = useDispatch();


  const { loading, user } = useSelector(
    (state: RootStateOrAny) => state.user,
  );


  const requestLocationPermission = async () => {
    try {
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
      
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission denied');
        return;
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  await requestLocationPermission();

  watchId = Geolocation.watchPosition(
    position => {
      const currentLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      if (lastKnownLocation) {
        const distance = calculateDistance(lastKnownLocation, currentLocation);
        if (distance >= MIN_DISTANCE_THRESHOLD) {
          // Dispatch action to update provider location
          if(user.provider){
            dispatch(postProviderLocation({providerId:user?.provider?.id, data: currentLocation }));
          }else if(user.employee){
          //  dispatch(postEmployeeLocation({user?.employee?.id, data: currentLocation }));
          }
         
          lastKnownLocation = currentLocation;
        }
      } else {
        lastKnownLocation = currentLocation;
      }
    },
    error => console.error('Error getting location:', error),
    {
      enableHighAccuracy: true,
      distanceFilter: 100,
      interval: 10000,
      fastestInterval: 5000,
    }
  );

  return watchId;
};

export const stopLocationTracking = watchId => {
  Geolocation.clearWatch(watchId);
};
