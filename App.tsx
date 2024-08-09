import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Import GestureHandlerRootView
import Navigation from './src/navigation';
import store from './src/app/store';
import { MenuProvider } from 'react-native-popup-menu';
import useNotificationSetup from './src/costants/UseNotificationSetup';

let persistor = persistStore(store);

const App = () => {
  useNotificationSetup();

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
