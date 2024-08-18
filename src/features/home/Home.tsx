import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Dimensions } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
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
import { getActiveRequests} from '../requests/RequestSlice'
import { useSelector, RootStateOrAny } from 'react-redux'
import { getBusinesses } from '../business/BusinessSlice'
import FloatBtn from '../../components/FloatBtn'
import { PieChart } from 'react-native-chart-kit';
import { getProviderRequestVsSubservice } from './ChartSlice'
import { selectLanguage } from '../../costants/languangeSlice'


const Home = ({ navigation }: any) => {

    const { t } = useTranslation();

    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;


    const { isDarkMode } = useSelector(
        (state: RootStateOrAny) => state.theme,
    );
    const selectedLanguage = useSelector(selectLanguage);

    const dispatch = useAppDispatch();
    const [refreshing, setRefreshing] = useState(false);

    const { user } = useSelector(
        (state: RootStateOrAny) => state.user,
    );

    const { loading, activeRequests } = useSelector(
        (state: RootStateOrAny) => state.requests,
    );

    const { businesses } = useSelector(
        (state: RootStateOrAny) => state.businesses,
    );

    const { providerServiceRequests } = useSelector(
        (state: RootStateOrAny) => state.charts,
    );


    const statusBarColor = colors.primary


   // console.log('providerServiceRequests',providerServiceRequests);


    useEffect(() => {
        dispatch(getActiveRequests(user?.provider?.id));
        dispatch(getBusinesses({ providerId: user?.provider?.id }))
        dispatch(getProviderRequestVsSubservice({ providerId: user?.provider?.id }))
    }, [dispatch])

    const callGetDashboard = React.useCallback(() => {

        setRefreshing(true);
        dispatch(getActiveRequests(user?.provider?.id));
        dispatch(getProviderRequestVsSubservice({ providerId: user?.provider?.id }))
        dispatch(getBusinesses({ providerId: user?.provider?.id })).unwrap()
            .then(result => {
                setRefreshing(false);
            })
    }, []);

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const [sheetTitle, setSheetTitle] = useState('Total requests');

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

    const labels = providerServiceRequests?.map(entry => {
        const serviceName = JSON.parse(entry.sub_service_name); // Parse the JSON string
        return selectedLanguage === 'en' ? serviceName?.en : serviceName?.sw;
      });
    const dataset = providerServiceRequests?.map(entry => entry.request_count);



    const getRandomColor = () => {
        const baseColors = ['#82D0D4'];
        const randomBaseColor = baseColors[Math.floor(Math.random() * baseColors.length)];
      
        // Calculate variations around the base color
        const variationAmount = 50; // Adjust this value for the range of variation
        const variation = () => Math.floor(Math.random() * variationAmount * 2) - variationAmount;
      
        // Convert the base color to RGB
        const hexToRgb = (hex) => hex.match(/[A-Za-z0-9]{2}/g).map((v) => parseInt(v, 16));
        const [baseRed, baseGreen, baseBlue] = hexToRgb(randomBaseColor);
      
        // Generate a new color with variations
        const randomColor = `rgb(${baseRed + variation()}, ${baseGreen + variation()}, ${baseBlue + variation()})`;
      
        return randomColor;
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
                                mainTitle={t('screens:totalRequests')}
                                number={activeRequests?.length || 0}
                                onPress={handlePresentModalPress(`${t('screens:totalRequests')}`)}
                                color={colors.secondary}
                            />
                            <Databoard
                                mainTitle={t('screens:business')}
                                number={businesses?.length || 0}
                                onPress={handlePresentModalPress(`${t('screens:business')}`)}
                                color={colors.secondary}
                            />

                        </View>
                    </BasicView>

                    <ScrollView horizontal={true}>
                        
                    <View style={styles.chart}>
                    <Text style={{fontSize:18,color:colors.alsoGrey}}>{t('screens:requestsVsSubserices')}</Text>
                       {providerServiceRequests?
                        (   <PieChart
                            data={dataWithPercentage}
                            width={screenWidth}
                            height={screenHeight*0.3}
                            chartConfig={chartConfig}
                            accessor="value"
                            backgroundColor="transparent"
                            paddingLeft="10"
                           
                            absolute
                            style={{ marginVertical: 8, borderRadius:30}}
                        />):
                       <Text>{t('screens:noDataAvailable')}</Text>}
                     
                    </View>
                    </ScrollView>
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

                            {sheetTitle === 'Total requests' || sheetTitle === 'Maombi yote' ? (
                                activeRequests?.map(item => (
                                    <TouchableOpacity style={styles.bottomView}
                                        onPress={() => {
                                            navigation.navigate('Requested services', {
                                                request: item
                                            })
                                        }}
                                        key={item.id}
                                    >
                                        <Text style={{ color: colors.primary }}>{selectedLanguage=='en' ?item?.service?.name?.en:item?.service?.name?.sw}</Text>
                                        <Text style={{ paddingVertical: 10, color: colors.black }}>{item?.client?.name}</Text>
                                        <View style={{ marginRight: '35%', color: colors.alsoGrey }}><Text >{item?.request_time}</Text></View>
                                    </TouchableOpacity>
                                ))

                            ) : (
                                businesses?.map(item => (
                                    <TouchableOpacity style={styles.textContainer}
                                        onPress={() => navigation.navigate('Business Details', {
                                            service: item
                                        })}
                                        key={item.id}
                                    >
                                        <Text style={styles.categoryService}>{selectedLanguage=='en' ?item?.service?.name?.en:item?.service?.name?.sw}</Text>
                                        <Text style={styles.subservice}>{selectedLanguage=='en' ?item?.service?.category?.name?.en:item?.service?.category?.name?.sw}</Text>
                                    </TouchableOpacity>
                                ))
                            )}
                        </BottomSheetScrollView>
                        {
                            sheetTitle !== 'Total requests' && sheetTitle !== 'Maombi yote' ? (
                                <FloatBtn
                                    onPress={() => navigation.navigate('Add Business')}
                                    iconType='add'
                                />
                            ) : (
                                <View />
                            )
                        }
                    </BottomSheetModal>
                </View>
            </BottomSheetModalProvider>
        </>
    )


}

const styles = StyleSheet.create({

    container: {
        alignItems: 'center',
        marginTop: 20,

    },


    chart: {
        alignItems: 'center',
        marginVertical: 8,
        borderRadius: 20,
        backgroundColor:colors.white,
       
    },
    contentContainer: {
        marginHorizontal: 10
    },
    title: {
        alignSelf: 'center',
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.black
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

export default Home