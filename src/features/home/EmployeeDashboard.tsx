import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Dimensions } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PageContainer } from '../../components/PageContainer'
import { BasicView } from '../../components/BasicView'
import Databoard from '../../components/Databoard'
import { colors } from '../../utils/colors'
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { globalStyles } from '../../styles/global'
import { useAppDispatch } from '../../app/store'
import { useTranslation } from 'react-i18next';
import { getEmployeeActiveRequests, getEmployeePastRequests } from '../requests/RequestSlice'
import { useSelector, RootStateOrAny } from 'react-redux'
import { getEmployeeTranferRequests } from './ChartSlice'
import { PieChart } from 'react-native-chart-kit'
import { selectLanguage } from '../../costants/languangeSlice'


const EmployeeDashboard = ({ navigation }: any) => {

    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;

    const { t } = useTranslation();

    const dispatch = useAppDispatch();
    const [refreshing, setRefreshing] = useState(false);

    const { user } = useSelector(
        (state: RootStateOrAny) => state.user,
    );

    const { loading, activeRequests,pastRequests } = useSelector(
        (state: RootStateOrAny) => state.requests,
    );

    const { employeeTranferedRequests } = useSelector(
        (state: RootStateOrAny) => state.charts,
    );

    const selectedLanguage = useSelector(selectLanguage);


    useEffect(() => {
        dispatch(getEmployeeActiveRequests(user?.employee?.id));
        dispatch(getEmployeePastRequests(user?.employee?.id));
        dispatch(getEmployeeTranferRequests(user?.employee?.id))
    }, [dispatch])


    const callGetDashboard = React.useCallback(() => {

        setRefreshing(true);
        dispatch(getEmployeeActiveRequests(user?.employee?.id));
        dispatch(getEmployeeTranferRequests(user?.employee?.id))
        dispatch(getEmployeePastRequests(user?.employee?.id)).unwrap()
            .then(result => {
                setRefreshing(false);
            })
    }, []);

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const [sheetTitle, setSheetTitle] = useState('');

    // variables
    const snapPoints = useMemo(() => ['25%', '70%'], []);

    // callbacks
    const handlePresentModalPress = (title: any) => useCallback(() => {
        setSheetTitle(title)
       
        bottomSheetModalRef.current?.present();
    }, []);
    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
    }, [])

    const stylesGlobal = globalStyles();


    const labels = employeeTranferedRequests?.map(entry => {
        const serviceName = JSON.parse(entry.sub_service_name); // Parse the JSON string
        return selectedLanguage === 'en' ? serviceName?.en : serviceName?.sw;
      });
    const dataset = employeeTranferedRequests?.map(entry => entry.request_count);

    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      };

    const truncateLabel = (label, maxLength) => {
        return label.length > maxLength ? label.substring(0, maxLength - 3) + '...' : label;
      };
  
    // Calculate total requests
    const totalRequests = dataset?.reduce((total, count) => total + count, 0);
  
    // Create data with percentages
    const dataWithPercentage = dataset?.map((value, index) => {
      const percentage = ((value / totalRequests) * 100).toFixed(2); // Calculate percentage
      return {
        name: `${truncateLabel(labels[index], 15)} (${percentage}%)`,
        value,
        color: getRandomColor(),
      };
    });

  
    // Chart configuration
    const chartConfig = {
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#fff',
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      };

    return (
        <>
            <SafeAreaView>
                <ScrollView
                    horizontal={false}
                    contentInsetAdjustmentBehavior="automatic"
                    keyboardShouldPersistTaps={'handled'}
                    style={stylesGlobal.scrollBg}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={callGetDashboard} />
                    }

                >
                 
                        <BasicView>
                            <View style={{
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: 50
                            }}>
                                <Databoard
                                    mainTitle={t('screens:activeRequests')}
                                    number={activeRequests?.length || 0}
                                    onPress={handlePresentModalPress(`${t('screens:activeRequests')}`)}
                                    color={colors.primary}
                                />
                                <Databoard
                                    mainTitle={t('screens:pastRequests')}
                                    number={pastRequests?.length || 0}
                                    onPress={handlePresentModalPress(`${t('screens:pastRequests')}`)}
                                    color={colors.primary}
                                />

                            </View>
                        </BasicView>
                        <View style={styles.chart}>
                    <Text style={{fontSize:18,color:colors.alsoGrey}}>{t('screens:requestsVsSubserices')}</Text>
                       {employeeTranferedRequests?
                        (   <PieChart
                            data={dataWithPercentage}
                            width={screenWidth}
                            height={screenHeight*0.3}
                            chartConfig={chartConfig}
                            accessor="value"
                            backgroundColor="transparent"
                            paddingLeft="5"
                            absolute
                            style={{ marginVertical: 8, borderRadius: 16 }}
                        />):
                       <Text>{t('screens:noDataAvailable')}</Text>}
                     
                    </View>
                   
                </ScrollView>
            </SafeAreaView>
            <BottomSheetModalProvider>
                <View style={styles.container}>
                    <BottomSheetModal
                        ref={bottomSheetModalRef}
                        index={1}
                        snapPoints={snapPoints}
                        onChange={handleSheetChanges}
                    >
                        <BottomSheetScrollView
                            contentContainerStyle={styles.contentContainer}
                        >
                            <Text style={styles.title}>{sheetTitle}</Text>

                            {sheetTitle === 'Active Requests' || sheetTitle === 'Maombi yaliyopo' ? (
                                activeRequests.map(item => (
                                    <TouchableOpacity style={styles.bottomView}
                                        onPress={() => {
                                            navigation.navigate('Requested services', {
                                                request: item
                                            })
                                        }}
                                    >
                                          <Text style={{ color: colors.primary }}>{selectedLanguage=='en' ?item?.service?.name?.en:item?.service?.name?.sw}</Text>
                                        <Text style={{ paddingVertical: 10, color: colors.black }}>{item.client.name}</Text>
                                        <View style={{ marginRight: '35%', color: colors.alsoGrey }}><Text >{item.request_time}</Text></View>
                                    </TouchableOpacity>
                                ))

                            ) : (
                                pastRequests.map(item => (
                                    <TouchableOpacity style={styles.bottomView}
                                    onPress={() => {
                                        navigation.navigate('Requested services', {
                                            request: item
                                        })
                                    }}
                                >
                                     <Text style={{ color: colors.primary }}>{selectedLanguage=='en' ?item?.service?.name?.en:item?.service?.name?.sw}</Text>
                                        <Text style={{ paddingVertical: 10, color: colors.black }}>{item.client.name}</Text>
                                        <View style={{ marginRight: '35%', color: colors.alsoGrey }}><Text >{item.request_time}</Text></View>
                                </TouchableOpacity>
                                ))
                            )}
                        </BottomSheetScrollView>
                    
                    </BottomSheetModal>
                </View>
            </BottomSheetModalProvider>
        </>
    )


}

const styles = StyleSheet.create({

    container: {
        margin: 10
    },
    contentContainer: {
        marginHorizontal: 10
    },
    title: {
        alignSelf: 'center',
        fontSize: 15,
        fontWeight: 'bold'
    },
    listView: {
        marginHorizontal: 5,
        marginVertical: 15
    },
    firstList: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    productList: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
    },
    secondList: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 5
    },
    badge: {
        backgroundColor: colors.successGreen,
        padding: 3,
        borderRadius: 5
    },
    badgeText: {
        color: colors.white
    },
    textContainer: {
        paddingVertical: 5,
        margin: 5,
        borderBottomWidth: 1,
        borderBottomColor: colors.alsoGrey
    },
    categoryService: {
        textTransform: 'uppercase',
        color: colors.secondary
    },
    service: {
        paddingTop: 5
    },
    chart: {
        alignItems: 'center',
        marginVertical: 8,
        borderRadius: 20,
        backgroundColor:colors.white,
       
    },
    subservice: {
        paddingTop: 5,
        fontWeight: 'bold',
        color: colors.black
    },

    bottomView: {
        paddingVertical: 5,
        margin: 5,
        borderBottomWidth: 1,
        borderBottomColor: colors.alsoGrey
    },
})

export default EmployeeDashboard