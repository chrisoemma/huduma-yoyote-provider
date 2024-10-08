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
import { combineSubServices, extractRatingData, getStatusBackgroundColor, makePhoneCall } from '../../utils/utilts';
import { useSelector, RootStateOrAny } from 'react-redux';
import { useAppDispatch } from '../../app/store';
import { getProviderSubServices } from '../serviceproviders/ServiceProviderSlice';
import { transferRequest, updateRequestStatus } from '../requests/RequestSlice';
import EmployeeListModal from '../../components/EmployeeListModel';
import { getEmployees } from '../employees/EmployeeSlice';
import Notification from '../../components/Notification';
import { getClientLastLocation } from '../account/AccountSlice';
import { getRequestLastLocation } from '../../components/Location/LocationSlice';
import { selectLanguage } from '../../costants/languangeSlice';
import PusherOnlineListener from '../../components/PusherOnlineListener';
import IconOnline from 'react-native-vector-icons/Ionicons';
import RejectModal from '../../components/RejectModal';
import { getRejectTemplate } from '../feedbackTemplate/FeebackTemplateSlice';
import ToastNotification from '../../components/ToastNotification/ToastNotification';
import CustomBackground from '../../components/CustomBgBottomSheet'

const RequestedServices = ({ navigation, route }: any) => {
    const { activeRequests, pastRequests } = useSelector((state: RootStateOrAny) => state.requests);



    const { request: initialRequest } = route.params;

    const request = useMemo(() => {
        const allRequests = [...activeRequests, ...pastRequests];
        return allRequests.find(r => r.id === initialRequest.id) || initialRequest;
    }, [activeRequests, pastRequests, initialRequest]);

    const [userLocation, setUserLocation] = useState(null);
    const [providerLocation, setProviderLocation] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null)
    const [isCancelModalVisible, setCancelModalVisible] = useState(false);

    const handleLocationUpdate = useCallback((userLocation, providerLocation) => {
        setUserLocation(userLocation);
        setProviderLocation(providerLocation);
    }, []);


    const { rejectTemplate } = useSelector(
        (state: RootStateOrAny) => state.feebackTemplate,
    );




    const requestSubService = combineSubServices(request);




    const { loading, providerSubServices, subServices } = useSelector(
        (state: RootStateOrAny) => state.providers,
    );

    const { user, isOnline } = useSelector(
        (state: RootStateOrAny) => state.user,
    );

    const { requestLastLocation } = useSelector(
        (state: RootStateOrAny) => state.locations,
    );


    const { clientLastLocation } = useSelector(
        (state: RootStateOrAny) => state.account,
    );

    const { employees } = useSelector(
        (state: RootStateOrAny) => state.employees,
    );

    const getStatusTranslation = (status: string) => {
        return t(`screens:${status}`);
    };

    const [contextData, setContext] = useState('');

    useEffect(() => {
        dispatch(getClientLastLocation(request?.client?.id));
    }, [])

    useEffect(() => {
        dispatch(getRequestLastLocation(request?.id));
    }, [])

    const toggleModalReject = (context) => {

        if (context !== contextData) {
            //   console.log('context123',context);
            setContext(context);
            dispatch(getRejectTemplate(context));
        }
        setCancelModalVisible(!isCancelModalVisible)
    };

    if (user.provider) {
        useEffect(() => {
            dispatch(getEmployees({ providerId: user.provider.id }));
        }, [])

    }



    const confirmReject = ({ selectedIds }: any) => {

        data.status = 'Rejected';
        data.client_latitude = userLocation?.latitude
        data.client_longitude = userLocation?.longitude
        data.provider_latitude = providerLocation?.latitude
        data.provider_longitude = providerLocation?.longitude
        data.templateIds = selectedIds;
        data.context = contextData;
        toggleModalReject(contextData);



        dispatch(updateRequestStatus({ data: data, requestId: request?.id }))
            .unwrap()
            .then(result => {
                console.log('resultsss', result);
                if (result.status) {

                    ToastNotification(`${t('screens:requestUpdatedSuccessfully')}`, 'success', 'long')
                    navigation.navigate('Requests', {
                        screen: 'Requests',
                    });
                } else {
                    ToastNotification(`${t('screens:requestFail')}`, 'danger', 'long')

                    console.log('dont navigate');
                }
            })
            .catch(rejectedValueOrSerializedError => {
                // handle error here
                console.log('error');
                console.log(rejectedValueOrSerializedError);
            });



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

    const PhoneNumber = `${request?.client?.phone}`;


    // React.useLayoutEffect(() => {
    //     if (request && request.service) {
    //         navigation.setOptions({ title: request.service.name });
    //     }
    // }, [navigation, request]);

    const selectedLanguage = useSelector(selectLanguage);

    const { t } = useTranslation();

    const request_status = request?.statuses[request?.statuses.length - 1].status;

    const [message, setMessage] = useState("")
    const setDisappearMessage = (message: any) => {
        setMessage(message);

        setTimeout(() => {
            setMessage('');
        }, 5000);
    };

    let data = {
        status: '',
        client_latitude: '',
        client_longitude: '',
        provider_latitude: '',
        provider_longitude: ''

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
                    ToastNotification(`${t('screens:requestUpdatedSuccessfully')}`, 'success', 'long')

                    navigation.navigate('Requests', {
                        screen: 'Requests',
                    });
                } else {
                    ToastNotification(`${t('screens:requestFail')}`, 'danger', 'long')
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

        // console.log('providerLocation', providerLocation)
        // console.log('client location', userLocation)

        data.client_latitude = userLocation?.latitude
        data.client_longitude = userLocation?.longitude
        data.provider_latitude = providerLocation?.latitude
        data.provider_longitude = providerLocation?.longitude

        Alert.alert(
            t('screens:confirmAction'),
            `${t('screens:areYouSureYouwantTo')} ${t(`screens:${requestType}`)}`,
            [
                {
                    text: t('screens:cancel'),
                    style: 'cancel',
                },
                {
                    text: t('screens:ok'),
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
                                    ToastNotification(`${t('screens:requestUpdatedSuccessfully')}`, 'success', 'long')

                                    navigation.navigate('Requests', {
                                        screen: 'Requests',
                                    });
                                } else {

                                    ToastNotification(`${t('screens:requestFail')}`, 'danger', 'long')
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
            <PusherOnlineListener remoteUserId={request?.client?.user_id} />
            <View
                style={stylesGlobal.scrollBg}
            >
                <GestureHandlerRootView style={{ flex: 1, margin: 10 }}>

                    <View >
                        <View style={[stylesGlobal.circle, { backgroundColor: colors.white, alignContent: 'center', justifyContent: 'center' }]}>
                            {request?.client?.profile_img?.startsWith("https://") ?
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
                                <Text style={{ marginVertical: 5, color: isDarkMode ? colors.white : colors.black, fontFamily: 'Prompt-Regular', }}>{request?.client?.name}</Text>
                                <Text style={{ marginVertical: 5, color: colors.secondary, fontFamily: 'Prompt-Regular', }}>{selectedLanguage == 'en' ? request?.service?.name?.en : request?.service?.name?.sw}</Text>
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
                                    paddingHorizontal: 5, fontFamily: 'Prompt-Bold',
                                    color: isDarkMode ? colors.white : colors.black
                                }}>{PhoneNumber}</Text>
                            </TouchableOpacity>
                        </View>
                        {/* <View style={styles.divOnline}>
                            <IconOnline name={isOnline ? 'checkmark-circle' : 'close-circle'} size={24} color={isOnline ? 'green' : colors.darkGrey} />
                            <Text style={styles.text}>{isOnline ? 'Online' : 'Offline'}</Text>
                        </View> */}

                        <View style={[stylesGlobal.chooseServiceBtn, { justifyContent: 'space-between', marginBottom: 50 }]}>
                            <View style={[stylesGlobal.otherBtn, { backgroundColor: getStatusBackgroundColor(request_status) }]}>
                                <Text style={{ color: colors.white, fontFamily: 'Prompt-Regular', }}>{getStatusTranslation(request_status)}</Text>
                            </View>


                            <TouchableOpacity style={[stylesGlobal.chooseBtn,]}
                                onPress={() => handlePresentModalPress('Services')}
                            >
                                <Text style={{ color: colors.white, fontFamily: 'Prompt-Regular', }}>{t('navigate:requestedServices')}</Text>
                            </TouchableOpacity>

                        </View>
                        {user.provider && request?.is_transferred ? (
                            <Notification message={`${t('screens:requestTransferToEmployee')} ${request?.transfer[0]?.employee?.name}`} type="info" />
                        ) : (<></>)}
                    </View>
                    <View>
                        <View style={styles.mapContainer}>
                            <MapDisplay
                                onLocationUpdate={handleLocationUpdate}
                                client={request?.client}
                                clientLastLocation={clientLastLocation}
                                requestStatus={request_status}
                                requestLastLocation={requestLastLocation}
                            />
                        </View>
                    </View>

                    <BottomSheetModalProvider>
                        <View style={styles.container}>
                            <BottomSheetModal
                                ref={bottomSheetModalRef}
                                backgroundComponent={CustomBackground}
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
                                            navigation={navigation}
                                            subServices={subServices}
                                            requestSubService={requestSubService}
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
                <View style={[styles.bottomDiv, { backgroundColor: isDarkMode ? colors.black : colors.white }]}>


                    {request_status === 'Comfirmed' && (
                        <>
                            <TouchableOpacity
                                onPress={() => updateRequest(request?.id, 'Complete')}
                                style={{
                                    backgroundColor: colors.successGreen,
                                    borderRadius: 20,
                                    justifyContent: 'center',
                                    padding: 10
                                }}
                            >
                                <Text style={{ color: colors.white, fontFamily: 'Prompt-Regular', }}>{t('screens:complete')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => toggleModalReject('After')}
                                style={{
                                    backgroundColor: colors.dangerRed,
                                    borderRadius: 20,
                                    justifyContent: 'center',
                                    padding: 20
                                }}
                            >
                                <Text style={{ color: colors.white, fontFamily: 'Prompt-Regular', }}>{t('screens:reject')}</Text>
                            </TouchableOpacity>

                            {!request?.is_transferred && user.provider && (
                                <>
                                    <TouchableOpacity
                                        onPress={toggleEmployeeListModal}
                                        style={{
                                            backgroundColor: colors.primary,
                                            borderRadius: 20,
                                            justifyContent: 'center',
                                            padding: 20
                                        }}
                                    >
                                        <Text style={{ color: colors.white, fontFamily: 'Prompt-Regular', }}>{t('screens:transfer')}</Text>
                                    </TouchableOpacity>

                                    {/* <TouchableOpacity
                    onPress={() => toggleModalReject('Opening')}
                    style={{
                        backgroundColor: colors.dangerRed,
                        borderRadius: 20,
                        justifyContent: 'center',
                        padding: 20
                    }}
                >
                    <Text style={{ color: colors.white }}>{t('screens:reject')}</Text>
                </TouchableOpacity> */}
                                </>
                            )}
                        </>
                    )}


                    {request_status == 'Requested' ? (
                        <>
                            <TouchableOpacity
                                onPress={() => updateRequest(request?.id, 'Accept')}
                                style={{
                                    backgroundColor: colors.successGreen, borderRadius: 20,
                                    justifyContent: 'center',
                                    padding: 20
                                }}>
                                <Text style={{ color: colors.white, fontFamily: 'Prompt-Regular', }}>{t('screens:accept')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => toggleModalReject('Opening')}
                                style={{
                                    backgroundColor: colors.dangerRed, borderRadius: 20,
                                    justifyContent: 'center',
                                    padding: 20
                                }}>
                                <Text style={{ color: colors.white, fontFamily: 'Prompt-Regular', }}>{t('screens:reject')}</Text>
                            </TouchableOpacity>
                        </>
                    ) : <></>}
                </View>
            </View>
            <RejectModal

                rejectData={extractRatingData(rejectTemplate)}
                cancel={toggleModalReject}
                visible={isCancelModalVisible}
                confirmReject={confirmReject}
            />

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
    divOnline: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        marginLeft: 5,
        fontSize: 16,
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