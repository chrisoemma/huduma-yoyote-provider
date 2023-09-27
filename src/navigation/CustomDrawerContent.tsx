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
import { userLogout } from '../features/auth/userSlice';
//import TextView from '../components/TextView';
import { useDispatch, useSelector, RootStateOrAny } from 'react-redux';
//import { services } from '../utils/app-services';

const DrawerHeader = styled.View`
  height: 150px;
  align-items: flex-start;
  justify-content: center;
  padding-left: 5px;
  margin-bottom:40px;
  background-color:#82D0D4;
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

  //const { user, loading } = useSelector((state: RootStateOrAny) => state.user);

  // React.useEffect(() => {
  // }, [user]);

  let  drawerItems = [
      {
        name: 'Home',
        icon: 'home',
        language:'home',
        screen: 'Home',
        options: {
          screen: 'BottomHomeTabNavigator',
        },
      },
      {
        name: 'My Businesses',
        icon: 'id-card',
        language:'business',
        screen: 'My Businesses',
      },
      {
        name: 'Employees',
        icon: 'users-cog',
        language:'employees',
        screen: 'Employees',
      },
      {
        name: 'Settings',
        icon: 'cogs',
        language:'settings',
        screen: 'Settings',
        options: {
          screen: 'Settings',
        },
      },
      {
        name: 'Whatsapp',
        icon: 'whatsapp',
        language:'whatsapp',
       
      },
      {
        name: 'Support',
        icon: 'phone',
        language:'support',
        screen: 'Support',
        options: {
          screen: 'Suport',
        },
      },
      
    ]
//}
 const dispatch = useDispatch();


  const confirmLogout = () =>
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Logout'),
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => {
      dispatch(userLogout());
        },
      },
    ]);

  return (
    <DrawerContentScrollView {...props}>
      <DrawerHeader>
        <Image
          source={require('./../../assets/images/logo.jpg')}
          style={{
            width: '60%',
            height: 60,
          }}
        />

        <View>
          <Text style={{
            marginTop:10,
            color:colors.white,
            fontWeight:'bold'
          }}>
            Huduma Yopote
          </Text>
        </View>
      </DrawerHeader>

      <DrawerRowsContainer>
        {drawerItems.map(item => {
          return (
            <DrawerRow
              onPress={() => {
                props.navigation.navigate(item.screen, item.options);
              }}>
              <DrawerIconContainer>
                <FontAwesome5
                  name={item.icon}
                  color={colors.alsoGrey}
                  size={25}
                />
              </DrawerIconContainer>
              <Text
              >
                
                {t(`navigate:${item.language}`)}
              </Text>
            </DrawerRow>
          );
        })}
        <DrawerRow
          onPress={() => {
            confirmLogout();
          }}>
          <DrawerIconContainer>
            <FontAwesome5
              name="sign-out-alt"
              color={colors.alsoGrey}
              size={25}
            />
          </DrawerIconContainer>
          <Text
        >
            {t('navigate:logout')}
          </Text>
        </DrawerRow>
      </DrawerRowsContainer>
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;
