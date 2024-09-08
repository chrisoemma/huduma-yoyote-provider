import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Import GestureHandlerRootView
import Navigation from './src/navigation';
import store from './src/app/store';
import { MenuProvider } from 'react-native-popup-menu';
import useNotificationSetup from './src/costants/UseNotificationSetup';
import Orientation from 'react-native-orientation-locker';

let persistor = persistStore(store);

const App = () => {
  useNotificationSetup();
  const [orientation, setOrientation] = useState('PORTRAIT');

  useEffect(() => {
    const orientationDidChange = (newOrientation) => {
 
      setOrientation(newOrientation);
    };
    // Add orientation change listener
    Orientation.addOrientationListener(orientationDidChange);
    return () => {
      Orientation.removeOrientationListener(orientationDidChange);
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <MenuProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Navigation />
          </GestureHandlerRootView>
        </MenuProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
