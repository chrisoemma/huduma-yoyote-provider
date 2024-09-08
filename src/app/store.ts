import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { useDispatch } from 'react-redux';
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import userReducer from '../features/auth/userSlice';
import RequestSlice from '../features/requests/RequestSlice';
import ServiceProviderSlice from '../features/serviceproviders/ServiceProviderSlice';
import AccountSlice from '../features/account/AccountSlice';
import BusinessSlice from '../features/business/BusinessSlice';
import CategorySlice from '../features/category/CategorySlice';
import ServiceSlice from '../features/Service/ServiceSlice';
import SubservicesSlice from '../features/subservices/SubservicesSlice';
import EmployeeSlice from '../features/employees/EmployeeSlice';
import themeSlice from '../costants/themes/themeSlice';
import LocationSlice from '../components/Location/LocationSlice';
import OnboardingSlice from '../features/onboarding/OnboardingSlice';
import languangeSlice from '../costants/languangeSlice';
import ChartSlice from '../features/home/ChartSlice';
import professionsSlice from '../features/professionsSlice';
import SubscriptionSlice from '../features/subscriptions/SubscriptionSlice';
import FeebackTemplateSlice from '../features/feedbackTemplate/FeebackTemplateSlice';
import NotificationProviderSlice from '../features/Notifications/NotificationProviderSlice';


const reducers = combineReducers({
  user: userReducer,
  requests:RequestSlice,
  providers:ServiceProviderSlice,
  account:AccountSlice,
  businesses:BusinessSlice,
  categories:CategorySlice,
  services:ServiceSlice,
  subservices:SubservicesSlice,
  employees:EmployeeSlice,
  theme:themeSlice,
  locations:LocationSlice,
  onboarding:OnboardingSlice,
  language:languangeSlice,
  charts:ChartSlice,
  professions:professionsSlice,
  subscriptions:SubscriptionSlice,
  feebackTemplate:FeebackTemplateSlice,
  notificationsProvider:NotificationProviderSlice
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({

  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;
