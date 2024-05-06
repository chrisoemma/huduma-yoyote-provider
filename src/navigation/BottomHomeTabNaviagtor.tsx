import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome5 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/Feather';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from '../features/home/Home';
import { colors } from '../utils/colors';
import { useTranslation } from 'react-i18next';
import CategoryScreen from '../features/category/CategoryScreen';
import Requests from '../features/requests/Requests';
import Account from '../features/account/Account';
import { useSelector,RootStateOrAny } from 'react-redux';
import EmployeeDashboard from '../features/home/EmployeeDashboard';


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

  const { isDarkMode } = useSelector(
    (state: RootStateOrAny) => state.theme,
);

const tabNavScreenOptions = ({ route }: any) => ({
  headerShown: false,
  tabBarIcon: ({ focused, color, size }: any) => {
    let iconName;

    if (route.name === 'Home') {
      iconName = 'home';
      return <Icon name={iconName as string} size={size} color={color} />;
    } else if (route.name === 'Requests') {
      iconName = 'rotate-3d-variant';
    } else if (route.name === 'Account') {
      iconName = 'account-circle';
    } 
    // You can return any component that you like here!
    return <FontAwesome5 name={iconName as string} size={size} color={color} />;
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
  
    if ((user?.provider || user?.employee) && user?.status !== 'Active' || user?.provider?.status=='Pending approval' || user?.provider?.subscription_status !=='Active') {
     
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
