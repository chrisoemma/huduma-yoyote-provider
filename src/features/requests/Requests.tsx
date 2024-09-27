import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { globalStyles } from '../../styles/global';
import { colors } from '../../utils/colors';
import RequestList from '../../components/RequestList';
import { useTranslation } from 'react-i18next';
import { useSelector, RootStateOrAny } from 'react-redux';
import { useAppDispatch } from '../../app/store';
import {
  getActiveRequests,
  getEmployeeActiveRequests,
  getEmployeePastRequests,
  getPastRequests,
} from './RequestSlice';

import CustomEmptyComponent from '../../components/CustomEmptyComponent';
import CustomSearch from '../../components/CustomSearch';
import ToastNotification from '../../components/ToastNotification/ToastNotification';

const Requests = React.memo(({ navigation }: any) => {
  const { user } = useSelector((state: RootStateOrAny) => state.user);
  const { isDarkMode } = useSelector((state: RootStateOrAny) => state.theme);
  const { loading, activeRequests, pastRequests } = useSelector(
    (state: RootStateOrAny) => state.requests
  );

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('current');
  const [searchText, setSearchText] = useState('');

  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const sortRequestsByRequestTime = (requests) => {
    return [...requests].sort(
      (a, b) =>
        new Date(b.request_time).getTime() - new Date(a.request_time).getTime()
    );
  };

  // Fetch active and past requests when the component mounts
  useEffect(() => {
    if (user.provider) {
      dispatch(getActiveRequests(user.provider.id));
      dispatch(getPastRequests(user.provider.id));
    } else if (user.employee) {
      dispatch(getEmployeeActiveRequests(user.employee.id));
      dispatch(getEmployeePastRequests(user.employee.id));
    }
  }, [dispatch, user.provider, user.employee]);

  // Fetch new data when tab is toggled
  useEffect(() => {
    const fetchRequests = () => {
      if (activeTab === 'current') {
        dispatch(user.provider ? getActiveRequests(user.provider.id) : getEmployeeActiveRequests(user.employee.id));
      } else {
        dispatch(user.provider ? getPastRequests(user.provider.id) : getEmployeePastRequests(user.employee.id));
      }
    };

    fetchRequests();
  }, [activeTab, dispatch, user.provider, user.employee]);

  const callGetRequests = useCallback(() => {
    setRefreshing(true);
    const requestsAction = user?.provider?.id
      ? getActiveRequests(user.provider.id)
      : getEmployeeActiveRequests(user.employee.id);
    dispatch(requestsAction);
    dispatch(getPastRequests(user?.provider?.id || user?.employee?.id))
      .unwrap()
      .then(() => {
        setRefreshing(false);
        ToastNotification(`${t('screens:dataRefreshed')}`, 'default', 'long');
      })
      .catch(() => setRefreshing(false));
  }, [dispatch, user]);

  const toggleTab = () => {
    setActiveTab((prevTab) => (prevTab === 'current' ? 'previous' : 'current'));
  };

  const handleSearchTextChange = useCallback((text) => {
    setSearchText(text);
  }, []);

  const stylesGlobal = globalStyles();

  // Search filtering function for client names
  const filterRequests = (requests) => {
    return requests.filter((item) => {
      const clientName = item?.client?.name?.toLowerCase() || '';
      const serviceName = item?.service?.name?.en?.toLowerCase() || '';
      const requestNumber = item?.request_number?.toString().toLowerCase() || '';
      const subServices = item?.sub_services
        ?.map(
          (subService) =>
            subService?.sub_service?.name?.en?.toLowerCase() || ''
        )
        .join(' ') || '';
      const requestTime = item?.request_time?.toLowerCase() || '';

      const searchTerm = searchText.toLowerCase();

      return (
        clientName.includes(searchTerm) ||
        serviceName.includes(searchTerm) ||
        requestNumber.includes(searchTerm) ||
        subServices.includes(searchTerm) ||
        requestTime.includes(searchTerm)
      );
    });
  };

  const renderRequestItem = ({ item }: any) => (
    <View style={styles.itemlistContainer}>
      <RequestList navigation={navigation} item={item} />
    </View>
  );

  const renderHeader = () => (
    <View>
      <View style={styles.container}>
        <TouchableOpacity style={styles.toggleButton} onPress={toggleTab}>
          <Text
            style={[
              styles.buttonText,
              activeTab === 'current' ? styles.activeToggleText : null,
            ]}
          >
            {t('screens:current')}
          </Text>
          <Text
            style={[
              styles.buttonText,
              activeTab === 'previous' ? styles.activeToggleText : null,
            ]}
          >
            {t('screens:previous')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const sortedActiveRequests = filterRequests(
    sortRequestsByRequestTime(activeRequests)
  );
  const sortedPastRequests = filterRequests(
    sortRequestsByRequestTime(pastRequests)
  );

  return (
    <SafeAreaView>
      <View style={[stylesGlobal.scrollBg]}>
        <View style={styles.listContainer}>
          {loading ? (
            <View style={stylesGlobal.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={isDarkMode ? colors.white : colors.black}
              />
            </View>
          ) : (
            <>
              <View>
                {renderHeader()}
                {/* Search input below the toggle buttons */}
                <CustomSearch
                  placeholder={`${t('screens:searchRequests')}`}
                  value={searchText}
                  onChangeText={handleSearchTextChange}
                />
              </View>
              <FlatList
                data={activeTab === 'current' ? sortedActiveRequests : sortedPastRequests}
                renderItem={renderRequestItem}
                keyExtractor={(item) => item?.id?.toString()}
                ListFooterComponent={<View style={{ marginBottom: '20%' }} />}
                ListEmptyComponent={
                  <CustomEmptyComponent
                    imageSource={''}
                    message={`${t('screens:noRequestFound')}`}
                    subMessage=""
                  />
                }
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={callGetRequests}
                  />
                }
              />
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  toggleButton: {
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
  },
  activeToggleText: {
    color: colors.white,
    backgroundColor: colors.secondary,
    borderRadius: 20,
  },
  buttonText: {
    color: colors.secondary,
    padding: 10,
    fontFamily: 'Prompt-Regular',
    marginRight: 5,
  },
  listContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  itemlistContainer: {
    marginTop: 20,
  },
});

export default Requests;
