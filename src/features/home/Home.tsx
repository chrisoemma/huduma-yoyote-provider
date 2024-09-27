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
import { getActiveRequests } from '../requests/RequestSlice'
import { useSelector, RootStateOrAny } from 'react-redux'
import { getBusinesses } from '../business/BusinessSlice'
import FloatBtn from '../../components/FloatBtn'
import { PieChart } from 'react-native-chart-kit';
import { getProviderRequestVsSubservice } from './ChartSlice'
import { selectLanguage } from '../../costants/languangeSlice'
import CustomBackground from '../../components/CustomBgBottomSheet'
import Icon from 'react-native-vector-icons/Ionicons';
import { getStatusBackgroundColor } from '../../utils/utilts'
const Home = ({ navigation }: any) => {
    const { t } = useTranslation();
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;

    const { isDarkMode } = useSelector((state: RootStateOrAny) => state.theme);
    const selectedLanguage = useSelector(selectLanguage);
    const dispatch = useAppDispatch();
    const [refreshing, setRefreshing] = useState(false);

    const { user } = useSelector((state: RootStateOrAny) => state.user);
    const { loading, activeRequests } = useSelector((state: RootStateOrAny) => state.requests);
    const { businesses } = useSelector((state: RootStateOrAny) => state.businesses);
    const { providerServiceRequests } = useSelector((state: RootStateOrAny) => state.charts);

    useEffect(() => {
        dispatch(getActiveRequests(user?.provider?.id));
        dispatch(getBusinesses({ providerId: user?.provider?.id }));
        dispatch(getProviderRequestVsSubservice({ providerId: user?.provider?.id }));
    }, [dispatch]);

    const callGetDashboard = React.useCallback(() => {
        setRefreshing(true);
        dispatch(getActiveRequests(user?.provider?.id));
        dispatch(getProviderRequestVsSubservice({ providerId: user?.provider?.id }));
        dispatch(getBusinesses({ providerId: user?.provider?.id })).unwrap()
            .then(result => {
                setRefreshing(false);
            })
    }, []);

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const [sheetTitle, setSheetTitle] = useState('Total requests');
    const snapPoints = useMemo(() => ['25%', '70%'], []);

    const handlePresentModalPress = (title: any) => useCallback(() => {
        setSheetTitle(title);
        bottomSheetModalRef.current?.present();
    }, []);
    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
    }, []);

    const stylesGlobal = globalStyles();

    
    const getStatusTranslation = (status: string) => {
        return t(`screens:${status}`);
      };

    const labels = providerServiceRequests?.map(entry => {
        const serviceName = JSON.parse(entry.sub_service_name);
        return selectedLanguage === 'en' ? serviceName?.en : serviceName?.sw;
    });
    const dataset = providerServiceRequests?.map(entry => entry.request_count);

    const getRandomColor = () => {
        const baseColors = ['#82D0D4'];
        const randomBaseColor = baseColors[Math.floor(Math.random() * baseColors.length)];

        const variationAmount = 100; 
        const variation = () => Math.floor(Math.random() * variationAmount * 2) - variationAmount;

        const hexToRgb = (hex) => hex.match(/[A-Za-z0-9]{2}/g).map((v) => parseInt(v, 16));
        const [baseRed, baseGreen, baseBlue] = hexToRgb(randomBaseColor);
        const randomColor = `rgb(${baseRed + variation()}, ${baseGreen + variation()}, ${baseBlue + variation()})`;

        return randomColor;
    };

    const truncateLabel = (label, maxLength) => {
        return label?.length > maxLength ? label?.substring(0, maxLength - 3) + '...' : label;
    };

    const totalRequests = dataset?.reduce((total, count) => total + count, 0);
    const dataWithPercentage = dataset?.map((value, index) => {
        const percentage = ((value / totalRequests) * 100).toFixed(2);
        return {
            name: `${truncateLabel(labels[index], 15)} (${percentage}%)`,
            value,
            color: getRandomColor(),
        };
    });




    const chartConfig = {
        backgroundGradientFrom: isDarkMode ? colors.black : colors.white,
        backgroundGradientTo: isDarkMode ? colors.black : colors.white,
        color: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
        labelColor: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
        propsForLabels: {
            fontFamily: 'Prompt-Regular',
            fill: isDarkMode ? '#fff' : '#000',
        },
        propsForBackgroundLines: {
            stroke: isDarkMode ? '#fff' : '#000',
            strokeWidth: 0.5,
        },
    };

    const chartHeight = Math.max(200, screenHeight * 0.2 + dataWithPercentage.length * 10); 
     
    return (
        <>
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView
                    contentInsetAdjustmentBehavior="automatic"
                    keyboardShouldPersistTaps="handled"
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={callGetDashboard} />
                    }
                    style={[stylesGlobal.scrollBg,{flex:1}]}
                >
                    <BasicView>
                        <View style={styles.dataBoardContainer}>
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

                    <ScrollView horizontal={true} 
                      showsHorizontalScrollIndicator={false}
                    style={styles.chartContainer}>
                        <View style={styles.chart}>
                            <Text style={styles.chartTitle}>{t('screens:requestsVsSubserices')}</Text>
                            {providerServiceRequests ? (
                                <PieChart
                                    data={dataWithPercentage}
                                    width={screenWidth}
                                    height={chartHeight}
                                    chartConfig={chartConfig}
                                    accessor="value"
                                    backgroundColor="transparent"
                                    paddingLeft="10"
                                    absolute
                                    style={styles.pieChart}
                                />
                            ) : (
                                <Text style={styles.noDataText}>
                                    {t('screens:noDataAvailable')}
                                </Text>
                            )}
                        </View>
                    </ScrollView>
                    
                </ScrollView>
             
            </SafeAreaView>
            <BottomSheetModalProvider>
                <View style={styles.container}>
                    <BottomSheetModal
                        backgroundComponent={CustomBackground}
                        ref={bottomSheetModalRef}
                        index={1}
                        snapPoints={snapPoints}
                        onChange={handleSheetChanges}
                    >
                        <BottomSheetScrollView
                            contentContainerStyle={styles.contentContainer}
                        >
                          
<Text style={[styles.title, { color: isDarkMode ? colors.white : colors.black }]}>{sheetTitle}</Text>

{sheetTitle === 'Total requests' || sheetTitle === 'Maombi yote' ? (
    activeRequests?.map(item => (
        <TouchableOpacity style={[styles.bottomView, { backgroundColor: isDarkMode ? colors.darkModeBottomSheet : colors.whiteBackground }]}
            onPress={() => {
                navigation.navigate('Requested services', {
                    request: item
                })
            }}
            key={item.id}
        >
            <Text style={{ color: isDarkMode ? colors.white : colors.secondary, fontFamily: 'Prompt-Bold', fontSize: 15 }}>
            <Icon name="business" size={20} color={isDarkMode ? colors.white : colors.darkGrey} />
              {' '}  {selectedLanguage == 'en' ? item?.service?.name?.en : item?.service?.name?.sw}</Text>
            {item?.request_number && (
                <View style={styles.header}>
                    <Text style={[styles.requestNumber, { color: isDarkMode ? colors.white : colors.secondary }]}>
                        {`#${item.request_number}`}
                    </Text>
                </View>
            )}
            <Text style={{ paddingVertical: 10, color: isDarkMode ? colors.white : colors.black, fontFamily: 'Prompt-Regular' }}>
            <Icon name="person" size={15} color={isDarkMode ? colors.white : colors.darkGrey} />
               {' '} {item?.client?.name}</Text>
               <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:5}}>
               <View><Text style={{ color: isDarkMode ? colors.white : colors.black, fontFamily: 'Prompt-Regular', fontSize: 13 }}>{item?.request_time}</Text></View>
            <View style={[styles.status, { backgroundColor: getStatusBackgroundColor(item?.statuses[item?.statuses.length - 1].status) }]}>
            <Text style={styles.statusText}>
      {getStatusTranslation(item?.statuses[item?.statuses.length - 1].status)}</Text>
            </View>
               </View>
        </TouchableOpacity>
    ))

) : (
    businesses?.map(item => (
        <TouchableOpacity style={[styles.bottomViewBusiness, { backgroundColor: isDarkMode ? colors.darkModeBottomSheet : colors.whiteBackground }]}
            onPress={() => navigation.navigate('Business Details', {
                service: item
            })}
            key={item.id}
        >
            <Text style={[styles.categoryService, { color: isDarkMode ? colors.white : colors.secondary }]}>
                <Icon name="business" size={20} color={isDarkMode ? colors.white : colors.darkGrey} />
                {' '}  {selectedLanguage == 'en' ? item?.service?.name?.en : item?.service?.name?.sw}</Text>
            <Text style={[styles.subservice, { color: isDarkMode ? colors.white : colors.black }]}>{selectedLanguage == 'en' ? item?.service?.category?.name?.en : item?.service?.category?.name?.sw}</Text>
        </TouchableOpacity>
    ))
    
)}

                        </BottomSheetScrollView>
                        <View>
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
                        </View>
                    </BottomSheetModal>
                </View>
            </BottomSheetModalProvider>
      

 
        </>
    );
};

const styles = StyleSheet.create({
    container: {
       
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    dataBoardContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 50,
    },
    chartContainer: {
        flex:1,
        marginTop: 10,
    },
    chart: {
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        backgroundColor: colors.white,
        marginHorizontal: 10,
    },
    chartTitle: {
        fontSize: 16,
        color: colors.alsoGrey,
        fontFamily: 'Prompt-Regular',
    },
    pieChart: {
        marginVertical: 8,
        borderRadius: 30,
    },
    noDataText: {
        color: colors.black,
        fontFamily: 'Prompt-Regular',
    },
    contentContainer: {
    
        paddingHorizontal: 10,
    },
    title: {
        alignSelf: 'center',
        fontSize: 16,
        fontFamily: 'Prompt-Bold',
        marginVertical: 10,
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

    categoryService: {
        fontFamily: 'Prompt-Bold',
    },
    service: {
        paddingTop: 5
    },
    subservice: {
        paddingTop: 5,
        fontFamily: 'Prompt-Regular',
    },

    bottomView: {
        paddingVertical: 10,
        margin: 8,
        borderRadius: 8,
        elevation: 2,
        paddingRight: 10
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    requestNumber: {
        fontFamily: 'Prompt-Regular',
        fontSize: 13,
        marginLeft: 5,
    },

    status: {
        paddingVertical: 3,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight:10
      },
      statusText: {
        color: colors.white,
        paddingHorizontal: 10,
        fontFamily: 'Prompt-Bold',
        fontSize: 14,
      },

    bottomViewBusiness: {
        paddingVertical: 10,
        margin: 8,
        borderRadius: 8,
        elevation: 2,
        paddingRight: 10
    }
});

export default Home;