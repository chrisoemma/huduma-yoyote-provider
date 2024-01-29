import { View, Text, SafeAreaView, FlatList,TouchableOpacity,StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { globalStyles } from '../../styles/global'
import { colors } from '../../utils/colors';
import RequestList from '../../components/RequestList';
import { useTranslation } from 'react-i18next';
import { useSelector,RootStateOrAny } from 'react-redux';
import { useAppDispatch } from '../../app/store';
import { getActiveRequests, getEmployeeActiveRequests, getEmployeePastRequests, getPastRequests } from './RequestSlice';

const Requests = ({navigation}:any) => {

  const {user } = useSelector(
    (state: RootStateOrAny) => state.user,
);

const { loading, activeRequests,pastRequests } = useSelector(
  (state: RootStateOrAny) => state.requests,
);

const dispatch = useAppDispatch();

  if(user.provider){
    console.log('this code provider is excuted')
useEffect(() => {
   dispatch(getActiveRequests(user?.provider?.id));
   dispatch(getPastRequests(user?.provider?.id));
}, [dispatch])

  }else if(user.employee){
    console.log('this code empoyeee is excuted')
    useEffect(() => {
      dispatch(getEmployeeActiveRequests(user?.employee?.id));
      dispatch(getEmployeePastRequests(user?.employee?.id));
   }, [dispatch])
  }

  const { t } = useTranslation();

    const [activeTab, setActiveTab] = useState('current');
  
    const toggleTab = () => {
      setActiveTab(activeTab === 'current' ? 'previous' : 'current');
    };


    const stylesGlobal = globalStyles(); 

    const renderRequestItem = ({ item }:any) => (
      <View style={styles.itemlistContainer}>
      <RequestList navigation={navigation}  item={item}/>
      </View>
    );

  return (
    <SafeAreaView
    style={stylesGlobal.scrollBg}
    >
    <View style={{}}>
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={toggleTab}
      >
        <Text style={[styles.buttonText, activeTab === 'current' ? styles.activeToggleText : null]}>
         {t('screens:current')}
        </Text>
        <Text style={[styles.buttonText, activeTab === 'previous' ? styles.activeToggleText : null]}>
        {t('screens:previous')}
        </Text>
      </TouchableOpacity>
    </View>
    <View style={styles.listContainer}>
        <FlatList
          data={activeTab === 'current'?activeRequests:pastRequests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
    </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    container: {
  
     // flex: 1,
     paddingTop: 20,
      paddingHorizontal: 20,
     alignItems: 'center',
    },
    toggleButton: {
      borderRadius: 30,
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor:colors.white,
    },
    activeToggleText: {
      color:colors.white,
      backgroundColor:colors.primary,
      borderRadius:20
       // Active text color
    },
    buttonText: {
      color:colors.primary,
      padding:10,
       marginRight:5
    },
    listContainer: {
      marginHorizontal:5
     // flex: 1,
    },
    itemlistContainer:{ 
        marginTop:20,  
    }
  });

export default Requests