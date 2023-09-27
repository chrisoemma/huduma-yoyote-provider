import { View, Text, SafeAreaView, Image,Alert, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useCallback, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next';
import { globalStyles } from '../../styles/global';
import { colors } from '../../utils/colors';
import { makePhoneCall } from '../../utils/utilts';
import Divider from '../../components/Divider';
import Icon from 'react-native-vector-icons/AntDesign';
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


const EmployeeAccount = ({route,navigation}:any) => {
  const { t } = useTranslation();

  const employee = route.params?.employee;

  const phoneNumber = '0672137313';
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

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


const ServicesOffered =({service}:any)=>{

  return(
      <View style={styles.serviceContainer}
      key={service.id}
  >
      <Text style={styles.category}>{service.name}</Text>
      <View style={styles.descContainer}>
          <View><Text>{service.desc}</Text></View>
      </View>
      <Divider />
  </View>

  )
}

const deleteFunc = ()=>{
 
  Alert.alert(`${t('screens:delete')}!`, `${t('screens:areYouSureDelete')}`, [
      {
        text:`${t('screens:cancel')}`,
        onPress: () => {},
      },
      {
        text: `${t('screens:ok')}`,
        onPress: () => {},
      },
    ]);
}


  return (
          <SafeAreaView
            style={globalStyles.scrollBg}
        >
            <View style={globalStyles.appView}>

              <View style={styles.btnView}>
              <TouchableOpacity style={{marginRight:10,alignSelf:'flex-end'}}
                 onPress={() => {deleteFunc()}}
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
                  color={colors.black}
                  size={25}
                  />
              </TouchableOpacity>
              </View>
              
                <View style={[globalStyles.circle, { backgroundColor: colors.white, marginTop: 15, alignContent: 'center', justifyContent: 'center' }]}>
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
                <Text style={{color:colors.secondary,fontWeight:'bold',alignSelf:'center'}}>Frank John</Text>
               <View>
                <TouchableOpacity style={{flexDirection:'row',margin:10}}
                 onPress={() => makePhoneCall(phoneNumber)}
                >
                <Icon    
                  name="phone"
                  color={colors.black}
                  size={25}
                  />
                    <Text style={{paddingHorizontal:10}}>+255 672137313</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{flexDirection:'row',marginHorizontal:10}}>
                <Icon    
                  name="mail"
                  color={colors.black}
                  size={25}
                  />
                    <Text style={{paddingLeft:10}}>Frank@gmail.com</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{flexDirection:'row',marginHorizontal:10,marginTop:5}}>
                <Icon    
                  name="enviroment"
                  color={colors.black}
                  size={25}
                  />
                    <Text style={{paddingLeft:10}}>Mwenge,kijitonyama</Text>
                </TouchableOpacity>
               </View>
              <View style={{marginVertical:20}}>
              <Divider />
              <Text>
                    Description of the services which I do in all my services provided today in a different angle
                </Text>
              </View>
              <TouchableOpacity style={styles.status} onPress={handlePresentModalPress}>
                    <Text style={{ color: colors.white }}>Sub-Services</Text>
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