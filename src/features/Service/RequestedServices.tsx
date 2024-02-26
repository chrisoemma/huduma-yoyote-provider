import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, SafeAreaView, Image, TouchableOpacity, StyleSheet, Button, ToastAndroid, Alert, ScrollView } from 'react-native'
import { globalStyles } from '../../styles/global'
import { colors } from '../../utils/colors'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet';

import { useTranslation } from 'react-i18next';
import ContentServiceList from '../../components/ContentServiceList';
import MapDisplay from '../../components/MapDisplay';
import Icon from 'react-native-vector-icons/AntDesign';
import { combineSubServices, getStatusBackgroundColor, makePhoneCall } from '../../utils/utilts';
import { useSelector, RootStateOrAny } from 'react-redux';
import { useAppDispatch } from '../../app/store';
import { getProviderSubServices } from '../serviceproviders/ServiceProviderSlice';
import { transferRequest, updateRequestStatus } from '../requests/RequestSlice';
import EmployeeListModal from '../../components/EmployeeListModel';
import { getEmployees } from '../employees/EmployeeSlice';
import Notification from '../../components/Notification';


const RequestedServices = ({ navigation, route }: any) => {


    const { request } = route.params;

    const [userLocation, setUserLocation] = useState(null);
    const [providerLocation, setProviderLocation] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null)

    const handleLocationUpdate = useCallback((userLocation, providerLocation) => {
        setUserLocation(userLocation);
        setProviderLocation(providerLocation);
    }, []);


    const { loading, providerSubServices, subServices } = useSelector(
        (state: RootStateOrAny) => state.providers,
    );

    const { user } = useSelector(
        (state: RootStateOrAny) => state.user,
    );


    const { employees } = useSelector(
        (state: RootStateOrAny) => state.employees,
    );

    const getStatusTranslation = (status: string) => {
        return t(`screens:${status}`);
    };

    if (user.provider) {
        useEffect(() => {
            dispatch(getEmployees({ providerId: user.provider.id }));
        }, [])

    }


    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(getProviderSubServices({ providerId: request?.provider.id, serviceId: request?.service.id }));
    }, [dispatch])

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const [sheetTitle, setSheetTitle] = useState('');
    const [isEmployeeListVisible, setEmployeeListVisible] = useState(false);
    const toggleEmployeeListModal = () => {
        if (!isEmployeeListVisible) {
            setSelectedEmployee(null);
        }
        setEmployeeListVisible(!isEmployeeListVisible);
    };


    // variables
    const snapPoints = useMemo(() => ['25%', '100%'], []);

    // callbacks
    const handlePresentModalPress = useCallback((title: any) => {
        setSheetTitle(title);
        bottomSheetModalRef.current?.present();
    }, []);

    const handleSheetChanges = useCallback((index: number) => {
        //console.log('handleSheetChanges', index);
    }, [])


    const [selectedSubservice, setSelectedSubservice] = useState([]);

    const PhoneNumber = `${request?.client?.user.phone}`;


    React.useLayoutEffect(() => {
        if (request && request.service) {
            navigation.setOptions({ title: request.service.name });
        }
    }, [navigation, request]);

    const { t } = useTranslation();

    const request_status = request?.statuses[request?.statuses.length - 1].status;

    const [message, setMessage] = useState("")
    const setDisappearMessage = (message: any) => {
        setMessage(message);

        setTimeout(() => {
            setMessage('');
        }, 5000);
    };

    const data = {
        status: '',

    }

    const handleTransfer = (selectedEmployee) => {
        const data = {
            provider: '',
            employee: '',
        }

        data.provider = user.provider.id;
        data.employee = selectedEmployee;
        // Do something with the selected employee, e.g., update state
        setSelectedEmployee(selectedEmployee);


        dispatch(transferRequest({ data: data, requestId: request?.id }))
            .unwrap()
            .then((result) => {
                if (result.status) {
                    ToastAndroid.show(`${t('screens:requestUpdatedSuccessfully')}`, ToastAndroid.SHORT);
                    navigation.navigate('Requests', {
                        screen: 'Requests',
                    });
                } else {
                    setDisappearMessage(`${t('screens:requestFail')}`);
                    console.log('dont navigate');
                }
            })
            .catch((rejectedValueOrSerializedError) => {
                // handle error here
                console.log('error');
                console.log(rejectedValueOrSerializedError);
            });


        // toggleEmployeeListModal();
    };

    const updateRequest = (id, requestType) => {
        Alert.alert(
            'Confirm Action',
            `Are you sure you want to ${requestType} this request?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Confirm',
                    onPress: () => {
                        if (requestType === 'Accept') {
                            data.status = 'Accepted';
                        } else if (requestType === 'Reject') {
                            data.status = 'Rejected';
                        } else if (requestType === 'Complete') {
                            data.status = 'Completed';
                        }

                        dispatch(updateRequestStatus({ data: data, requestId: id }))
                            .unwrap()
                            .then((result) => {
                                if (result.status) {
                                    ToastAndroid.show(`${t('screens:requestUpdatedSuccessfully')}`, ToastAndroid.SHORT);
                                    navigation.navigate('Requests', {
                                        screen: 'Requests',
                                    });
                                } else {
                                    setDisappearMessage(`${t('screens:requestFail')}`);
                                    console.log('dont navigate');
                                }
                            })
                            .catch((rejectedValueOrSerializedError) => {
                                // handle error here
                                console.log('error');
                                console.log(rejectedValueOrSerializedError);
                            });
                    },
                },
            ]
        );
    };

    const stylesGlobal = globalStyles();

    const { isDarkMode } = useSelector(
        (state: RootStateOrAny) => state.theme,
    );

    return (
        <>
            <View
                style={[stylesGlobal.scrollBg, { flex: 1 }]}
            >

                <GestureHandlerRootView style={{ flex: 0.9, margin: 10 }}>

                    <View >
                        <View style={[stylesGlobal.circle, { backgroundColor: colors.white, marginTop: 15, alignContent: 'center', justifyContent: 'center' }]}>
                            {request?.client?.profile_img.startsWith("https://") ?
                                <Image
                                    source={{ uri: request?.client?.profile_img }}
                                    style={{
                                        resizeMode: "cover",
                                        width: 90,
                                        height: 95,
                                        borderRadius: 90,
                                        alignSelf: 'center'
                                    }}
                                />
                                : <Image
                                    source={require('../../../assets/images/profile.png')}
                                    style={{
                                        resizeMode: "cover",
                                        width: 90,
                                        height: 95,
                                        borderRadius: 90,
                                        alignSelf: 'center'
                                    }}
                                />}
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <View>
                                <Text style={{ marginVertical: 5, color: isDarkMode ? colors.white : colors.black }}>{request?.client?.name}</Text>
                                <Text style={{ marginVertical: 5, color: colors.secondary }}>{request?.service?.name}</Text>
                            </View>
                            <TouchableOpacity style={{
                                flexDirection: 'row',
                                marginHorizontal: 30,
                                marginVertical: 20,
                                alignItems: 'flex-end'
                            }}
                                onPress={() => makePhoneCall(PhoneNumber)}
                            >
                                <Icon
                                    name="phone"
                                    color={colors.black}
                                    size={20}
                                />
                                <Text style={{
                                    paddingHorizontal: 5, fontWeight: 'bold',
                                    color: isDarkMode ? colors.white : colors.black
                                }}>{PhoneNumber}</Text>
                            </TouchableOpacity>
                        </View>
                        <Text>{request?.service?.description}</Text>

                        <View style={[stylesGlobal.chooseServiceBtn, { justifyContent: 'space-between' }]}>
                            <TouchableOpacity style={stylesGlobal.chooseBtn}
                                onPress={() => handlePresentModalPress('Services')}
                            >
                                <Text style={{ color: colors.white }}>{t('navigate:requestedServices')}</Text>
                            </TouchableOpacity>


                            <TouchableOpacity style={[stylesGlobal.otherBtn, { backgroundColor: getStatusBackgroundColor(request_status) }]}>
                                <Text style={{ color: colors.white }}>{getStatusTranslation(request_status)}</Text>
                            </TouchableOpacity>

                        </View>
                        {user.provider && request.is_transferred ? (
                            <Notification message={`${t('screens:requestTransferToEmployee')} ${request?.transfer[0]?.employee?.name}`} type="info" />
                        ) : (<></>)}
                    </View>
                    <View>
                        <View style={styles.mapContainer}>
                            <MapDisplay
                                onLocationUpdate={handleLocationUpdate}
                                client={request?.client}
                                requestLocation={request.location}
                            />
                        </View>
                    </View>

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
                                    <Text style={styles.title}>{t('screens:Services')}</Text>


                                    <View style={stylesGlobal.subCategory}>
                                        <ContentServiceList
                                            subServices={subServices}
                                            providerSubServices={providerSubServices}
                                            toggleSubService={{}}
                                            selectedSubServices={selectedSubservice}
                                            screen="requested"
                                        />
                                    </View>

                                </BottomSheetScrollView>
                            </BottomSheetModal>
                        </View>
                    </BottomSheetModalProvider>

                </GestureHandlerRootView>
                <View style={[styles.bottomDiv, { backgroundColor: isDarkMode ? colors.black : colors.white, height: 100 }]}>

                    {request_status == 'Comfirmed' ? (
                        <TouchableOpacity
                            onPress={() => updateRequest(request?.id, 'Complete')}
                            style={{
                                backgroundColor: colors.successGreen, borderRadius: 20,
                                justifyContent: 'center',
                                padding: 20
                            }}>
                            <Text style={{ color: colors.white }}>{t('screens:complete')}</Text>
                        </TouchableOpacity>

                    ) : <></>}

                    {!request?.is_transferred && user.provider && request_status == 'Comfirmed' ? (

                        <TouchableOpacity
                            onPress={toggleEmployeeListModal}
                            style={{
                                backgroundColor: colors.primary, borderRadius: 20,
                                justifyContent: 'center',
                                padding: 20
                            }}>
                            <Text style={{ color: colors.white }}>{t('screens:transfer')}</Text>
                        </TouchableOpacity>

                    ) : (<></>)
                    }

                    {request_status == 'Requested' ? (
                        <>
                            <TouchableOpacity
                                onPress={() => updateRequest(request?.id, 'Accept')}
                                style={{
                                    backgroundColor: colors.successGreen, borderRadius: 20,
                                    justifyContent: 'center',
                                    padding: 20
                                }}>
                                <Text style={{ color: colors.white }}>{t('screens:accept')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => updateRequest(request?.id, 'Reject')}
                                style={{
                                    backgroundColor: colors.dangerRed, borderRadius: 20,
                                    justifyContent: 'center',
                                    padding: 20
                                }}>
                                <Text style={{ color: colors.white }}>{t('screens:reject')}</Text>
                            </TouchableOpacity>
                        </>
                    ) : <></>}

                </View>
            </View>
            <EmployeeListModal
                isVisible={isEmployeeListVisible}
                onClose={toggleEmployeeListModal}
                employees={employees}
                transferFunc={handleTransfer}
            />
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        //  flex: 1
        // height:300,
        // margin: 10
    },
    contentContainer: {
        // flex:1,
        marginHorizontal: 10
    },
    title: {
        alignSelf: 'center',
        fontSize: 15,
        fontWeight: 'bold'
    },
    mapContainer: {
        flex: 1,
        marginBottom: '10%',
    },
    bottomDiv: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20
    }
})

export default RequestedServices