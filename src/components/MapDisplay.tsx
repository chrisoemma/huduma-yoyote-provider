import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, PermissionsAndroid, Image } from 'react-native';
import MapView, { AnimatedRegion, Marker, Polyline } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import MapViewDirections from 'react-native-maps-directions';
import { colors } from '../utils/colors';
import {
  Pusher,
  PusherEvent,
  PusherAuthorizerResult
} from '@pusher/pusher-websocket-react-native';
import { postProviderLocation } from './Location/LocationSlice';
import { useAppDispatch } from '../app/store';
import { useSelector, RootStateOrAny } from 'react-redux';
import { API_URL, GOOGLE_MAPS_API_KEY } from '../utils/config';
import { useTranslation } from 'react-i18next';
import { extractEventName } from '../utils/utilts';


const MapDisplay = ({ onLocationUpdate, client, clientLastLocation, requestStatus, requestLastLocation }: any) => {


  const [distance, setDistance] = useState(null);
  const [providerLocation, setServiceProvidersLocation] = useState(null);
  const [clientLocation, setClientLocation] = useState(null);
  const [previousProviderLocation, setPreviousProviderLocation] = useState(null);
  const [previousLocation, setPreviousLocation] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

  const markerRef = useRef(null);
  const [isMoving, setIsMoving] = useState(false);

  const mapViewRef = useRef(null);

  const STATUS_ACTIVE = ['Requested', 'Accepted', 'Comfirmed'];
  const STATUS_PAST = ['Cancelled', 'Rejected', 'Completed'];

  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };


  useEffect(() => {
    if (clientLastLocation) {
      setClientLocation({
        latitude: parseFloat(clientLastLocation?.latitude),
        longitude: parseFloat(clientLastLocation?.longitude)
      });
    }
  }, [clientLastLocation]);


  useEffect(() => {
    if (providerLocation) {
      setPreviousProviderLocation(providerLocation);
    }
  }, [providerLocation]);


  const debouncedUpdateLocation = debounce((newLocation, animatedCoordinate) => {
    // Animate the marker to the new provider location
    animatedCoordinate.timing({
      latitude: newLocation.latitude,
      longitude: newLocation.longitude,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, 300);


  useEffect(() => {
    if (providerLocation) {
      const newLocation = {
        latitude: providerLocation?.latitude,
        longitude: providerLocation?.longitude,
      };
      debouncedUpdateLocation(newLocation, animatedCoordinate);
    }
  }, [providerLocation]);


  // useEffect(() => {
  //   if (providerLocation) {
  //     const newLocation = {
  //       latitude: providerLocation?.latitude,
  //       longitude: providerLocation?.longitude
  //     };

  //     const updateLocation = debounce(() => {
  
  //       setServiceProvidersLocation(newLocation);
  //       // Animate the marker to the new provider location
  //       animatedCoordinate.timing({
  //         latitude: newLocation.latitude,
  //         longitude: newLocation.longitude,
  //         duration: 500,
  //         useNativeDriver: false,
  //       }).start();
  //     }, 300); 
  //     updateLocation();
  //   }
  // }, [providerLocation]);


  const animatedCoordinate = useRef(
    new AnimatedRegion({
      latitude: providerLocation?.latitude || 0,
      longitude: providerLocation?.longitude || 0,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    })
  ).current;



  useEffect(() => {
    if (STATUS_PAST.includes(requestStatus)) {
      // Use requestLastLocation for both clientLocation and providerLocation
      setClientLocation({
        latitude: parseFloat(requestLastLocation?.client_latitude),
        longitude: parseFloat(requestLastLocation?.client_longitude)
      });
      setServiceProvidersLocation({
        latitude: parseFloat(requestLastLocation?.provider_latitude),
        longitude: parseFloat(requestLastLocation?.provider_longitude)
      });
    }
  }, [requestStatus, requestLastLocation]);


  const pusher = Pusher.getInstance();

  useEffect(() => {
    if (clientLocation && providerLocation) {
      const calculatedDistance = calculateDistance(clientLocation?.latitude, clientLocation?.longitude, providerLocation?.latitude, providerLocation?.longitude);
      setDistance(calculatedDistance);
    }
  }, [clientLocation, providerLocation]);



  useEffect(() => {

    if (STATUS_ACTIVE.includes(requestStatus)) {
      const setupPusher = async () => {
        const headers = {
          'Authorization': `Bearer ${user.token}`,
        };

        try {
          await pusher.init({
            apiKey: "70f571d3d3621db1c3d0",
            cluster: "ap2",
            authEndpoint: `${API_URL}/pusher/auth`,
            onAuthorizer: async (channelName, socketId) => {
              console.log('trying to authorize');
              try {
                const response = await fetch(`${API_URL}/pusher/auth`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                  },
                  body: JSON.stringify({
                    socket_id: socketId,
                    channel_name: channelName,
                    userId: user.id
                  }),
                });
                if (!response.ok) {
                  throw new Error('Network response was not ok');
                }
                const authData = await response.json() as PusherAuthorizerResult;
                const newAuthData = JSON.parse(authData);
                console.log('new authata', newAuthData);
                return newAuthData;
              } catch (error) {
                console.error('Error during Pusher authentication:', error);
                throw error;
              }
            },
          });

          const channel = pusher.subscribe({
            channelName: `private-client-location-updates-user-${client.user_id}`,
            onSubscriptionSucceeded: (data: any) => {
              console.log('Subscription succeeded:', data);
            },
            onSubscriptionError: (channelName, message, e) => {
              console.log(`onSubscriptionError: ${message} channelName: ${channelName} Exception: ${e}`);
            },
            onEvent: (event: PusherEvent) => {
              if (extractEventName(event.eventName) === "ClientLocationUpdated") {
                if (event.data) {
                  const parsedData = JSON.parse(event.data);
                  const latitude = parseFloat(parsedData?.clientData?.latitude);
                  const longitude = parseFloat(parsedData?.clientData?.longitude);
                  setClientLocation({ latitude: latitude, longitude: longitude });
                }
              }
            },
          });

          await pusher.connect();

        } catch (e) {
          console.log(`ERROR: ${e}`);
        }
      };

      console.log('running pusher');
      setupPusher();

      return () => {
        pusher.unsubscribe({ channelName: `private-client-location-updates-user-${client.user_id}` });
      };
    }
  }, [requestStatus]);



  const { user } = useSelector(
    (state: RootStateOrAny) => state.user,
  );

  const dispatch = useAppDispatch();

  let data = {
    provider_latitude: providerLocation?.latitude,
    provider_longitude: providerLocation?.longitude
  }


  useEffect(() => {
    // Only run the location tracking when requestStatus is included in STATUS_ACTIVE
    if (STATUS_ACTIVE.includes(requestStatus)) {
      let watchId;

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

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            watchId = Geolocation.watchPosition(
              position => {
                setServiceProvidersLocation({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                });

                const data = {
                  provider_latitude: position.coords.latitude,
                  provider_longitude: position.coords.longitude,
                };



                if (position.coords) {
                  dispatch(postProviderLocation({ providerId: user?.employee? user?.employee?.id:user?.provider.id, data }));
                }

                const newLatitude = position?.coords?.latitude;
                const newLongitude = position?.coords?.longitude;
                const newLocation = { latitude: newLatitude, longitude: newLongitude };


                setLastUpdateTime(Date.now());
                if (previousLocation) {
                  const distance = calculateDistance(
                    previousLocation?.latitude,
                    previousLocation?.longitude,
                    newLatitude,
                    newLongitude
                  );

                  // Set isMoving based on distance threshold
                  setIsMoving(distance > 0.01); // Adjust the threshold as needed
                }

                // Update locations
                setPreviousLocation(newLocation);

                if (requestStatus === 'Comfirmed') {
                  animatedCoordinate.timing({
                    latitude: newLatitude,
                    longitude: newLongitude,
                    duration: 500,
                    useNativeDriver: false,
                  }).start();
                  
                }
              },
              error => console.error(error),
              {
                enableHighAccuracy: true,
                distanceFilter: 100,
                interval: 10000,
                fastestInterval: 5000,
              }
            );
          }
        } catch (error) {
          console.error(error);
        }
      };

      requestLocationPermission();

      return () => {
        Geolocation.clearWatch(watchId);
      };
    }
  }, [requestStatus]);

  useEffect(() => {

    if (STATUS_ACTIVE.includes(requestStatus)) {
      const sendLocationToServer = () => {
        dispatch(postProviderLocation({ providerId: user.provider? user?.provider.id:user?.employee.id, data }));
      };

      const intervalId = setInterval(sendLocationToServer, 15000);
      return () => clearInterval(intervalId);
    }

  }, [dispatch, user?.provider?.id, requestStatus]);

  useEffect(() => {
    onLocationUpdate(providerLocation, clientLocation);
  }, [clientLocation, providerLocation]);


  const centerLat = (providerLocation?.latitude + clientLocation?.latitude) / 2;
  const centerLng = (providerLocation?.longitude + clientLocation?.longitude) / 2;

  const zoomLevel = 0.02;

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance.toFixed(2);
  };

  const { t } = useTranslation();

  const customMapStyle = [
    {

      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#e0e0e0" // Grey color
        }
      ]
    },
    // Add more styling for other map elements as needed
  ];


  useEffect(() => {
    if (clientLocation && providerLocation) {
      const bounds = {
        latitude: (clientLocation?.latitude + providerLocation?.latitude) / 2,
        longitude: (clientLocation?.longitude + providerLocation?.longitude) / 2,
        latitudeDelta: Math.abs(clientLocation?.latitude - providerLocation?.latitude) * 1.5,
        longitudeDelta: Math.abs(clientLocation?.longitude - providerLocation?.longitude) * 1.5,
      };
      mapViewRef?.current?.fitToCoordinates([clientLocation, providerLocation], {
        edgePadding: { top: 100, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [clientLocation, providerLocation]);

  const shouldUpdateDirections = (oldLocation, newLocation) => {
    if (!oldLocation || !newLocation) return true;
    const distance = calculateDistance(
      oldLocation.latitude,
      oldLocation.longitude,
      newLocation.latitude,
      newLocation.longitude
    );
    return distance > 0.05; // Update threshold
  };

  return (
    <View style={styles.container}>
      {providerLocation && clientLocation && (
        <MapView
          ref={mapViewRef}
          style={styles.map}
          initialRegion={{
            latitude: centerLat,
            longitude: centerLng,
            latitudeDelta: zoomLevel,
            longitudeDelta: zoomLevel * (Dimensions.get('window').width / Dimensions.get('window').height),
          }}
          customMapStyle={customMapStyle}
        >


          <Marker.Animated
            ref={markerRef}
            coordinate={animatedCoordinate}
            title={t(`screens:yourLocation`)}
            description={STATUS_ACTIVE.includes(requestStatus) ? t(`screens:providerIsHere`) : t(`screens:providerLastLocation`)}
            pinColor={colors.primary}
          >
            <Image source={isMoving ? require('../../assets/images/personmove.png') : require('../../assets/images/personstanding.png')} style={{ width: 20, height: 20 }} />
          </Marker.Animated>


          <Marker
            coordinate={clientLocation}
            title={`${client.name}`}
            description={t(`screens:clientIsHere`)}
            pinColor={colors.primary}
          />
          <MapViewDirections
            origin={providerLocation}
            destination={clientLocation}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={3}
            strokeColor={colors.secondary}
            onReady={(result) => {
             if (shouldUpdateDirections(previousLocation, providerLocation)) {
                //  setRouteCoordinates(result.coordinates);
                mapViewRef.current.fitToCoordinates(result.coordinates, {
                  edgePadding: {
                    top: 100,
                    right: 50,
                    bottom: 50,
                    left: 50,
                  },
                });
            }
            }}
          />
        </MapView>
      )}
      {!providerLocation && clientLocation && <Text>{t('screens:loading')}...</Text>}
      {distance && <Text style={styles.distanceText}>{t('screens:distance')}: {distance} km</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  distanceText: {
    color: colors.black,
    position: 'absolute',
    bottom: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
});

export default MapDisplay;
