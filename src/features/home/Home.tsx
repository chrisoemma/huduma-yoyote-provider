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


const Home = ({ navigation }: any) => {

    const { t } = useTranslation();

    const dispatch = useAppDispatch();
    const [refreshing, setRefreshing] = useState(false);

    // const { loading: productLoading, products } = useSelector(
    //     (state: RootStateOrAny) => state.products,
    // );


    // const { loading: ordersLoading, orders } = useSelector(
    //     (state: RootStateOrAny) => state.orders,
    // );


    // const { user, loading: loadingUser } = useSelector((state: RootStateOrAny) => state.user);

    // useEffect(() => {
    //     dispatch(getOrders({ businessId: user.business.id, userType: 'business', orderType: 'active', userId: null }));
    // }, [])


    // useEffect(() => {
    //     dispatch(getProducts({ businessId: user?.business.id }));
    // }, [])


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
                                alignItems:'center',
                                justifyContent:'center',
                                marginTop: 50
                            }}>
                                <Databoard
                                    mainTitle={t('screens:totalRequests')}
                                    number="9"
                                    onPress={handlePresentModalPress(`${t('screens:totalRequests')}`)}
                                    color={colors.primary}
                                />
                                <Databoard
                                    mainTitle={t('screens:business')}
                                    number="5"
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

                            {sheetTitle == '' ? (
                                <View />
                            ) : sheetTitle == 'Total requests' ? (
                               <View />
                            ) : (
                         
                              <View />

                            )
                            }
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
    }
})

export default Home