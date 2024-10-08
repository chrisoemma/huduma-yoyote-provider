import * as React from 'react';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { Alert, Image, Text, View } from 'react-native';
import styled from 'styled-components/native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useTranslation } from 'react-i18next';
//import { userLogout } from './../features/auth/userSlice';

//import { globalStyles } from '../style/global';
import { colors } from '../utils/colors';
import { userLogout, userLogoutThunk } from '../features/auth/userSlice';
//import TextView from '../components/TextView';
import { useDispatch, useSelector, RootStateOrAny } from 'react-redux';
import { makePhoneCall } from '../utils/utilts';
import { useNavigation } from '@react-navigation/native';
//import { services } from '../utils/app-services';

const DrawerHeader = styled.View`
  height: 150px;
  align-items: flex-start;
  justify-content: center;
  padding-left: 5px;
  margin-bottom:40px;
  background-color:${colors.secondary};
  border-bottom-left-radius: 10px;
  border-bottom-right-radius:10px;

`;

const DrawerRow = styled.TouchableOpacity`
  flex-direction: row;
  padding-vertical: 2px;
  align-items: center;
`;

const DrawerIconContainer = styled.View`
  padding: 15px;
  padding-right: 20px;
  width: 75px;
`;

const DrawerRowsContainer = styled.View`
  margin-top: 10px;
 
`;

const CustomDrawerContent = (props: any) => {

  const { t } = useTranslation();
  const navigation = useNavigation();

  const { user, loading } = useSelector((state: RootStateOrAny) => state.user);
  const { isDarkMode } = props;
  React.useEffect(() => {
  }, [user]);



  const phoneNumber='+255684335955';
  
  let drawerItems = [];

  if (user.provider && user.status == 'Active' && user?.provider?.status == 'Active' && user?.provider?.subscription_status =='Active') {

    drawerItems = [
      {
        name: 'Home',
        icon: 'home',
        language: 'home',
        screen: 'Home',
        options: {
          screen: 'Home',
        },
      },
      {
        name: 'My Businesses',
        icon: 'id-card',
        language: 'business',
        screen: 'My Businesses',
      },
      {
        name: 'Employees',
        icon: 'users',
        language: 'employees',
        screen: 'Employees',
      },
      {
        name: 'Settings',
        icon: 'cogs',
        language: 'settings',
        screen: 'Settings',
        options: {
          screen: 'Settings',
        },
      },

    ]

  } else if ((user.provider) && user?.provider?.status == 'Pending approval') {

    drawerItems = [
      // {
      //   name: 'My Businesses',
      //   icon: 'id-card',
      //   language: 'business',
      //   screen: 'My Businesses',
      // },
      {
        name: 'Settings',
        icon: 'cogs',
        language: 'settings',
        screen: 'Settings',
        options: {
          screen: 'Settings',
        },
      },

    ]
  } else if (user?.employee && user?.employee?.status == 'Active') {

    drawerItems = [
      {
        name: 'Home',
        icon: 'home',
        language: 'home',
        screen: 'Home',
        options: {
          screen: 'Home',
        },
      },

      {
        name: 'Settings',
        icon: 'cogs',
        language: 'settings',
        screen: 'Settings',
        options: {
          screen: 'Settings',
        },
      },
    ]
  }
  const dispatch = useDispatch();


  const confirmLogout = () =>
    Alert.alert(`${t('screens:logout')}`, `${t('screens:areYouSureLogout')}`, [
      {
        text: `${t('screens:cancel')}`,
        onPress: () => console.log('Cancel Logout'),
        style: 'cancel',
      },
      {
        text: `${t('screens:ok')}`,
        onPress: () => {
          console.log('thunk');
          dispatch(userLogoutThunk());
        },
      },
    ]);

  const WhatsappChatBot = () => {

  }


  const NavigateSubscription = () => {
    navigation.navigate('Subscriptions');
  }

  const NavigateNotifications = () => {
    navigation.navigate('Notifications');
  }

  return (
    <DrawerContentScrollView {...props}>
      <DrawerHeader isDarkMode={isDarkMode}>
        <Image
          source={require('./../../assets/images/logo-white.png')}
          style={{
            width: '60%',
            height: 60,
          }}
        />
 
      </DrawerHeader>

      <DrawerRowsContainer>
        {drawerItems.map(item => {
          return (
            <DrawerRow
              key={item.name}
              onPress={() => {
                props.navigation.navigate(item.screen, item.options);
              }}
              isDarkMode={isDarkMode}
            >
              <DrawerIconContainer>
                <FontAwesome5
                  name={item.icon}
                  color={isDarkMode ? colors.white : colors.alsoGrey}
                  size={25}
                />
              </DrawerIconContainer>
              <Text style={{ color: isDarkMode ? colors.white : colors.black, fontFamily: 'Prompt-Regular', }}>
                {t(`navigate:${item.language}`)}
              </Text>
            </DrawerRow>
          );
        })}

        {user?.provider && user.status == 'Active' ? (
          <DrawerRow
            onPress={() => {

              NavigateSubscription();
            }}
            isDarkMode={isDarkMode}
          >
            <DrawerIconContainer>
              <FontAwesome5
                name="dolly"
                color={isDarkMode ? colors.white : colors.alsoGrey}
                size={25}
              />
            </DrawerIconContainer>
            <Text
              style={{
                color: isDarkMode ? colors.white : colors.black,
                fontFamily: 'Prompt-Regular',
              }}>
              {t('navigate:subscriptions')}
            </Text>
          </DrawerRow>
        ) : (<></>)}

<DrawerRow
          onPress={() => {

            NavigateNotifications();
          }}
          isDarkMode={isDarkMode}
        >
          <DrawerIconContainer>
            <FontAwesome5
              name="bell"
              color={isDarkMode ? colors.white : colors.alsoGrey}
              size={25}
            />
          </DrawerIconContainer>
          <Text
            style={{
              color: isDarkMode ? colors.white : colors.black,
              fontFamily: 'Prompt-Regular',
            }}>
            {t('screens:notifications')}
          </Text>
        </DrawerRow>
        <DrawerRow
          onPress={() => {

            WhatsappChatBot();
          }}
          isDarkMode={isDarkMode}
        >
          <DrawerIconContainer>
            <FontAwesome5
              name="whatsapp"
              color={isDarkMode ? colors.white : colors.alsoGrey}
              size={25}
            />
          </DrawerIconContainer>
          <Text
            style={{
              color: isDarkMode ? colors.white : colors.black,
              fontFamily: 'Prompt-Regular',
            }}>
            {t('navigate:whatsapp')}
          </Text>
        </DrawerRow>

        <DrawerRow
          onPress={() => {
            makePhoneCall(phoneNumber)
          }}
          isDarkMode={isDarkMode}
        >
          <DrawerIconContainer>
            <FontAwesome5
              name="phone"
              color={isDarkMode ? colors.white : colors.alsoGrey}
              size={25}
            />
          </DrawerIconContainer>
          <Text
            style={{
              color: isDarkMode ? colors.white : colors.black,
              fontFamily: 'Prompt-Regular',
            }}>
            {t('navigate:support')}
          </Text>
        </DrawerRow>

        <DrawerRow
          onPress={() => {
            confirmLogout();
          }}
          isDarkMode={isDarkMode}
        >
          <DrawerIconContainer>
            <FontAwesome5
              name="sign-out-alt"
              color={isDarkMode ? colors.white : colors.alsoGrey}
              size={25}
            />
          </DrawerIconContainer>
          <Text
            style={{
              color: isDarkMode ? colors.white : colors.black,
              fontFamily: 'Prompt-Regular',
            }}>
            {t('navigate:logout')}
          </Text>
        </DrawerRow>
      </DrawerRowsContainer>
    </DrawerContentScrollView>

  );
};

export default CustomDrawerContent;
