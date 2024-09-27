import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    Dimensions,
  } from "react-native";
  import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
  } from "react";
  import { SafeAreaView } from "react-native-safe-area-context";
  import { BasicView } from "../../components/BasicView";
  import Databoard from "../../components/Databoard";
  import { colors } from "../../utils/colors";
  import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetScrollView,
  } from "@gorhom/bottom-sheet";
  import { globalStyles } from "../../styles/global";
  import { useAppDispatch } from "../../app/store";
  import { useTranslation } from "react-i18next";
  import {
    getEmployeeActiveRequests,
    getEmployeePastRequests,
  } from "../requests/RequestSlice";
  import { useSelector, RootStateOrAny } from "react-redux";
  import { getEmployeeTranferRequests } from "./ChartSlice";
  import { PieChart } from "react-native-chart-kit";
  import { selectLanguage } from "../../costants/languangeSlice";
import CustomBackground from '../../components/CustomBgBottomSheet'
import Icon from 'react-native-vector-icons/Ionicons';
import { getStatusBackgroundColor } from '../../utils/utilts'
  
  const EmployeeDashboard = ({ navigation }: any) => {
    const screenWidth = Dimensions.get("window").width;
    const screenHeight = Dimensions.get("window").height;
  
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useSelector((state: RootStateOrAny) => state.user);
    const { loading, activeRequests, pastRequests } = useSelector(
      (state: RootStateOrAny) => state.requests
    );
    const { employeeTranferedRequests } = useSelector(
      (state: RootStateOrAny) => state.charts
    );
    const selectedLanguage = useSelector(selectLanguage);
    const { isDarkMode } = useSelector((state: RootStateOrAny) => state.theme);

    const getStatusTranslation = (status: string) => {
        return t(`screens:${status}`);
      };
  
    useEffect(() => {
      if (user?.employee?.id) {
        dispatch(getEmployeeActiveRequests(user?.employee?.id));
        dispatch(getEmployeePastRequests(user?.employee?.id));
        dispatch(getEmployeeTranferRequests(user?.employee?.id));
      }
    }, [dispatch, user?.employee?.id]);
  
    const callGetDashboard = useCallback(() => {
      setRefreshing(true);
      if (user?.employee?.id) {
        dispatch(getEmployeeActiveRequests(user?.employee?.id));
        dispatch(getEmployeeTranferRequests(user?.employee?.id));
        dispatch(getEmployeePastRequests(user?.employee?.id))
          .unwrap()
          .finally(() => setRefreshing(false));
      }
    }, [dispatch, user?.employee?.id]);
  
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const [sheetTitle, setSheetTitle] = useState("");
  
    const snapPoints = useMemo(() => ["25%", "70%"], []);
  
    const handlePresentModalPress = (title: string) => {
      setSheetTitle(title);
      bottomSheetModalRef.current?.present();
    };
  
    const handleSheetChanges = useCallback((index: number) => {
      console.log("handleSheetChanges", index);
    }, []);
  
    const stylesGlobal = globalStyles();
  
    const labels = employeeTranferedRequests?.map((entry) => {
      const serviceName = JSON.parse(entry.sub_service_name);
      return selectedLanguage === "en" ? serviceName?.en : serviceName?.sw;
    });
  
    const dataset = employeeTranferedRequests?.map(
      (entry) => entry.request_count
    );
  
    const getRandomColor = () => {
      const letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };
  
    const truncateLabel = (label, maxLength) => {
      return label.length > maxLength
        ? label.substring(0, maxLength - 3) + "..."
        : label;
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
      backgroundGradientFrom: "#fff",
      backgroundGradientTo: "#fff",
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    };
  
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
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 50,
                }}
              >
                <Databoard
                  mainTitle={t("screens:activeRequests")}
                  number={activeRequests?.length || 0}
                  onPress={() =>
                    handlePresentModalPress(`${t("screens:activeRequests")}`)
                  }
                  color={colors.secondary}
                />
                <Databoard
                  mainTitle={t("screens:pastRequests")}
                  number={pastRequests?.length || 0}
                  onPress={() =>
                    handlePresentModalPress(`${t("screens:pastRequests")}`)
                  }
                  color={colors.secondary}
                />
              </View>
            </BasicView>
            <ScrollView horizontal={true} 
                      showsHorizontalScrollIndicator={false}
                    style={styles.chartContainer}>
            <View style={styles.chart}>
              <Text style={{ fontSize: 18, color: colors.alsoGrey, fontFamily: 'Prompt-Regular' }}>
                {t("screens:requestsVsSubserices")}
              </Text>
              {employeeTranferedRequests?.length ? (
                <PieChart
                  data={dataWithPercentage}
                  width={screenWidth}
                  height={screenHeight * 0.46}
                  chartConfig={chartConfig}
                  accessor="value"
                  backgroundColor="transparent"
                  paddingLeft="5"
                  absolute
                  style={{ marginVertical: 8, borderRadius: 16 }}
                />
              ) : (
                <Text style={styles.noDataText}>{t("screens:noDataAvailable")}</Text>
              )}
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
              <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
                <Text style={styles.title}>{sheetTitle}</Text>
                {(sheetTitle === "Active Requests" || sheetTitle === "Maombi yaliyopo"
                  ? activeRequests
                  : pastRequests
                )?.map((item) => (
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
                ))}
              </BottomSheetScrollView>
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
  
  export default EmployeeDashboard;
  