import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native'
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
import { getPastRequests } from '../requests/RequestSlice'
import { useSelector, RootStateOrAny } from 'react-redux'
import { getBusinesses } from '../business/BusinessSlice'


const Home = ({ navigation }: any) => {

    const { t } = useTranslation();

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


    useEffect(() => {
        dispatch(getPastRequests(user?.provider?.id));
        dispatch(getBusinesses({ providerId: user?.provider?.id }))
    }, [dispatch])


    // const callGetDashboard = React.useCallback(() => {

    //     setRefreshing(true);
    //     dispatch(getOrders({ businessId: user.business.id, userType: 'business', orderType: 'active', userId: null }));
    //     dispatch(getProducts({ businessId: user?.business.id })).unwrap()
    //         .then(result => {
    //             setRefreshing(false);
    //         })
    // }, []);

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const [sheetTitle, setSheetTitle] = useState('');

    // variables
    const snapPoints = useMemo(() => ['25%', '70%'], []);

    // callbacks
    const handlePresentModalPress = (title: any) => useCallback(() => {
        setSheetTitle(title)
        console.log('shittitle', title);
        bottomSheetModalRef.current?.present();
    }, []);
    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
    }, [])

    return (
        <>
            <SafeAreaView>
                <ScrollView
                    horizontal={false}
                    contentInsetAdjustmentBehavior="automatic"
                    keyboardShouldPersistTaps={'handled'}
                    style={globalStyles.scrollBg}
                // refreshControl={
                //     <RefreshControl refreshing={refreshing} onRefresh={callGetDashboard} />
                // }

                >
                    <PageContainer>
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
                                    color={colors.primary}
                                />
                                <Databoard
                                    mainTitle={t('screens:business')}
                                    number={businesses?.length || 0}
                                    onPress={handlePresentModalPress(`${t('screens:business')}`)}
                                    color={colors.primary}
                                />

                            </View>
                        </BasicView>
                    </PageContainer>
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
                                activeRequests.map(item => (
                                    <TouchableOpacity style={styles.bottomView}
                                    onPress={()=>{navigation.navigate('Requested services',{
                                        request:item
                                       })}}
                                    
                                    >
                                        <Text style={{ color: colors.primary }}>{item.service.name}</Text>
                                        <Text style={{ paddingVertical: 10, color: colors.black }}>{item.client.name}</Text>
                                        <View style={{ marginRight: '35%' }}><Text >{item.request_time}</Text></View>
                                    </TouchableOpacity>
                                ))

                            ) : (
                                businesses.map(item => (
                                    <TouchableOpacity style={styles.textContainer}
                                        onPress={() => navigation.navigate('Business Details', {
                                            service: item
                                        })}
                                    >
                                        <Text style={styles.categoryService}>{item?.service?.name}</Text>
                                        <Text style={styles.subservice}>{item?.service?.category?.name}</Text>
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