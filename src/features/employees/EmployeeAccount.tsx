import { View, Text, SafeAreaView, Image,Alert,ToastAndroid, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useCallback,useState, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next';
import { globalStyles } from '../../styles/global';
import { colors } from '../../utils/colors';
import { makePhoneCall } from '../../utils/utilts';
import Divider from '../../components/Divider';
import Icon from 'react-native-vector-icons/AntDesign';
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { deleteEmployee } from './EmployeeSlice';
import { useAppDispatch } from '../../app/store';
import { BasicView } from '../../components/BasicView';
import { useSelector } from 'react-redux';


const EmployeeAccount = ({route,navigation}:any) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

  const employee = route.params?.employee;

  const stylesGlobal = globalStyles();

  const { isDarkMode } = useSelector(
    (state: RootStateOrAny) => state.theme,
  );

  const phoneNumber =`${employee.phone}`;
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [message,setMessage]=useState("")

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
}, []);

const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
}, []);

const snapPoints = useMemo(() => ['25%', '95%'], []);

const subservices = [
    {
        id: 1,
        name: 'Kusuka',
        desc: 'Kaenye msuk huu nasuka misuko ya haina tofauti tofauti ilikupata wateja wazuri'
    },
    {
        id: 2,
        name: 'Dreak za kawaida',
        desc: 'Kaenye msuk huu nasuka misuko ya haina tofauti tofauti ilikupata wateja wazuri'
    },
    {
        id: 3,
        name: 'Duble dread',
        desc: 'Kaenye msuk huu nasuka misuko ya haina tofauti tofauti ilikupata wateja wazuri'
    }
];


const setDisappearMessage = (message: any) => {
    setMessage(message);

    setTimeout(() => {
      setMessage('');
    }, 5000);
  };

const ServicesOffered =({service}:any)=>{

  return(
      <View style={styles.serviceContainer}
      key={service.id}
  >
      <Text style={styles.category}>{service.name}</Text>
      <View style={styles.descContainer}>
          <View><Text style={{color:colors.alsoGrey}}>{service.desc}</Text></View>
      </View>
      <Divider />
  </View>

  )
}

const deleteFunc = (id) =>
Alert.alert(`${t('screens:deleteBusiness')}`, `${t('screens:areYouWantToDelete')} ${id}`, [
  {
    text: `${t('screens:cancel')}`,
    onPress: () => console.log('Cancel task delete'),
    style: 'cancel',
  },
  {
    text: `${t('screens:ok')}`,
    onPress: () => {
        console.log('idddd',id);
      dispatch(deleteEmployee({employeeId:id}))
      .unwrap()
      .then(result => {
        if (result.status) {
          ToastAndroid.show(`${t('screens:deletedSuccessfully')}`, ToastAndroid.SHORT);
          navigation.navigate('Employees', {
            screen: 'Employees',
          });
        } else {
          setDisappearMessage(
            `${t('screens:requestFail')}`,
          );
          console.log('dont navigate');
        }

        console.log('resultsss',result)
      })
      .catch(rejectedValueOrSerializedError => {
        // handle error here
        console.log('error');
        console.log(rejectedValueOrSerializedError);
      });
    },
  },
]);


  return (
          <SafeAreaView
            style={stylesGlobal.scrollBg}
        >
            <View style={stylesGlobal.appView}>

            <BasicView style={stylesGlobal.centerView}>
              <Text style={stylesGlobal.errorMessage}>{message}</Text>
           </BasicView>

              <View style={styles.btnView}>
              <TouchableOpacity style={{marginRight:10,alignSelf:'flex-end'}}
                 onPress={() => {deleteFunc(employee.id)}}
                >
                <Icon    
                  name="delete"
                  color={colors.dangerRed}
                  size={25}
                  />
              </TouchableOpacity>
              <TouchableOpacity style={{marginRight:10,alignSelf:'flex-end'}}
                 onPress={() => {navigation.navigate('Add Employees',{
                  employee:employee
                 })}}
                >
                <Icon    
                  name="edit"
                  color={isDarkMode?colors.white:colors.black}
                  size={25}
                  />
              </TouchableOpacity>
              </View>
              
                <View style={[stylesGlobal.circle, { backgroundColor: colors.white, marginTop: 15, alignContent: 'center', justifyContent: 'center' }]}>
                    <Image
                        source={require('../../../assets/images/profile.png')}
                        style={{
                            resizeMode: "cover",
                            width: 90,
                            height: 95,
                            borderRadius: 90,
                            alignSelf: 'center'
                        }}
                    />
                </View>
                <Text style={{color:isDarkMode?colors.white:colors.black,fontWeight:'bold',alignSelf:'center'}}>{employee.name}</Text>
               <View>
                <TouchableOpacity style={{flexDirection:'row',margin:10}}
                 onPress={() => makePhoneCall(phoneNumber)}
                >
                <Icon    
                  name="phone"
                  color={isDarkMode?colors.white:colors.black}
                  size={25}
                  />
                    <Text style={{paddingHorizontal:10,color:isDarkMode?colors.white:colors.black}}>{employee.phone}</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity style={{flexDirection:'row',marginHorizontal:10}}>
                <Icon    
                  name="mail"
                  color={colors.black}
                  size={25}
                  />
                    <Text style={{paddingLeft:10}}>Frank@gmail.com</Text>
                </TouchableOpacity> */}
                {/* <TouchableOpacity style={{flexDirection:'row',marginHorizontal:10,marginTop:5}}>
                <Icon    
                  name="enviroment"
                  color={colors.black}
                  size={25}
                  />
                    <Text style={{paddingLeft:10}}>Mwenge,kijitonyama</Text>
                </TouchableOpacity> */}
               </View>
              <View style={{marginVertical:20}}>
              <Divider />
              {/* <Text>
                    Description of the services which I do in all my services provided today in a different angle
                </Text> */}
              </View>
              <TouchableOpacity style={styles.status} onPress={handlePresentModalPress}>
                    <Text style={{ color: colors.white }}>{t('screens:requests')}</Text>
                </TouchableOpacity>
            </View>
            
            <GestureHandlerRootView style={{ flex: 1 }}>
                <BottomSheetModalProvider>
                    <View style={styles.bottomSheetContainer}>
                        <BottomSheetModal
                            ref={bottomSheetModalRef}
                            index={1}
                            snapPoints={snapPoints}
                            onChange={handleSheetChanges}
                        >
                            <BottomSheetScrollView style={styles.bottomSheetContentContainer}>
                                {
                                    subservices.map(service => (

                                <ServicesOffered service={service} />
                                      
                                    ))
                                }
                            </BottomSheetScrollView>

                        </BottomSheetModal>
                    </View>
                </BottomSheetModalProvider>
            </GestureHandlerRootView>
        </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  mainContentContainer: {
      margin: 15,
      backgroundColor: 'white',
      height: '60%',
      padding: 10,
      borderRadius: 10,
  },
  btnView:{
   flexDirection:'row',
   justifyContent:'flex-end'
  },
  bottomSheetContainer: {
      // flex: 1,
      margin: 10,
      zIndex: 1000
  },
  bottomSheetContentContainer: {
      padding: 10,
      backgroundColor: 'white',
      borderRadius: 10,
  },
  category: {
      textTransform: 'uppercase',
      color: colors.secondary,
      marginTop: 15,
  },
  service: {
      paddingTop: 5,
      fontWeight: 'bold',
      color: colors.black,
  },
  status: {
      alignSelf: 'flex-end',
      backgroundColor: colors.secondary,
      padding: 10,
      borderRadius: 10,
  },
  descContainer:{
  marginBottom:8
  },
  btnContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end'
  }
});

export default EmployeeAccount