import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from '../features/home/Home';
import { colors } from '../utils/colors';
import { useTranslation } from 'react-i18next';
import Requests from '../features/requests/Requests';
import Account from '../features/account/Account';
import { useSelector,RootStateOrAny } from 'react-redux';
import EmployeeDashboard from '../features/home/EmployeeDashboard';
import BadgeIcon from '../components/BadgeIcon';


const Tab = createBottomTabNavigator();

const screenOptions = {
  headerShown: false,
};


const Stack = createNativeStackNavigator();

const HomeStack = () => {

  const {user } = useSelector(
    (state: RootStateOrAny) => state.user,
  );

  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={screenOptions}>
      <Stack.Screen name="Home" component={user.provider?Home:EmployeeDashboard} />
    </Stack.Navigator>
  );
};






export default function BottomHomeTabNavigator() {


  const { loading, user } = useSelector(
    (state: RootStateOrAny) => state.user,
  );
  
  const { t } = useTranslation();

  const notifications = useSelector((state: RootStateOrAny) => state.notificationsProvider.notifications);

  const requestsBadgeCount = notifications.filter(notification => notification.type === 'Request' && !notification.viewed).length;
  const accountBadgeCount = notifications.filter(notification => notification.type === 'Account' && !notification.viewed).length;

  const { isDarkMode } = useSelector(
    (state: RootStateOrAny) => state.theme,
);


const tabNavScreenOptions = ({ route }: any) => ({
  headerShown: false,
  tabBarIcon: ({ focused, color, size }: any) => {
    let iconName;
    let badgeCount = 0;

    if (route.name === 'Home') {
      iconName = 'home';
      return <Icon name={iconName as string} size={size} color={color} />;
    } else if (route.name === 'Requests') {
      iconName = 'rotate-3d-variant';
      badgeCount = requestsBadgeCount;
    } else if (route.name === 'Account') {
      iconName = 'account-circle';
      badgeCount = accountBadgeCount;
    } 
    return <BadgeIcon name={iconName as string} size={size} color={color} badgeCount={badgeCount} />;
  },
  tabBarActiveTintColor: colors.secondary,
  tabBarInactiveTintColor:isDarkMode?colors.white:colors.blackBg,
  
});


  function getNavigatorScreens(user) {

      
    const screens = [
      {
        name: 'Home',
        component: HomeStack,
        options: { tabBarLabel: t('navigate:home') },
      },
      {
        name: 'Requests',
        component: Requests,
        options: { tabBarLabel: t('navigate:requests') },
      },
      {
        name: 'Account',
        component: Account,
        options: { tabBarLabel: t('navigate:account') },
      },
    ];

    if (user?.employee &&  user?.employee?.status == 'Active') {
      return screens;
    }
  
    if ((user?.provider) && user?.provider?.status !== 'Active' || user?.provider?.subscription_status !=='Active') {
     
      return screens.filter(screen => screen.name !== 'Home' && screen.name !== 'Requests');
    }
  
    return screens;
  }

  const screens = getNavigatorScreens(user);
  
  return (
    <Tab.Navigator screenOptions={tabNavScreenOptions}>
      {screens.map(screen => (
        <Tab.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={screen.options}
        />
      ))}
    </Tab.Navigator>
  );
}
