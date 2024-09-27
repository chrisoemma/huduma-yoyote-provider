import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import the icon library
import { colors } from '../utils/colors';
import { useSelector, RootStateOrAny } from 'react-redux';
import { combineSubServices, formatRequestTime, getStatusBackgroundColor } from '../utils/utilts';
import { useTranslation } from 'react-i18next';
import { selectLanguage } from '../costants/languangeSlice';

const width = Dimensions.get('window').width;

const RequestList = ({ item, navigation }: any) => {
  const selectedLanguage = useSelector(selectLanguage);

  const { isDarkMode } = useSelector(
    (state: RootStateOrAny) => state.theme,
  );

  const getStatusTranslation = (status: string) => {
    return t(`screens:${status}`);
  };

  const { t } = useTranslation();



  const request_status = item?.statuses[item?.statuses.length - 1].status;

  const subServices = combineSubServices(item);
  const maxItemsToShow = 2;

  return (
    <TouchableOpacity
      style={[
        styles.touchableOpacityStyles,
        { backgroundColor: isDarkMode ? colors.darkModeBackground : colors.white }
      ]}
      onPress={() => {
        navigation.navigate('Requested services', {
          request: item
        });
      }}
    >
      <View>
     
        <Text style={[styles.serviceName, { color: isDarkMode ? colors.white : colors.secondary }]}>
          {selectedLanguage === 'en' ? item?.service?.name?.en : item?.service?.name?.sw}
        </Text>
        {item?.request_number && (
       <View style={styles.header}>
        <Text style={[styles.requestNumber, { color: isDarkMode ? colors.white : colors.secondary }]}>
         {`#${item.request_number}`}
         </Text>
         </View>
        )}

        <Text style={[styles.providerName, { color: isDarkMode ? colors.white : colors.darkGrey }]}>
        <Icon name="person" size={20} color={isDarkMode ? colors.white : colors.darkGrey} />
          {' '}{item?.client?.name}
        </Text>

        {subServices.slice(0, maxItemsToShow).map((subService, index) => (
          <Text
            style={[styles.subServiceName, { color: isDarkMode ? colors.white : colors.darkGrey }]}
            key={subService.id}
          >
            - {subService.provider_sub_list?.name || selectedLanguage === 'en' ? subService?.sub_service?.name?.en : subService?.sub_service?.name?.sw || subService?.provider_sub_service?.name}
          </Text>
        ))}

        {subServices.length > maxItemsToShow && (
          <Text style={{ color: isDarkMode ? colors.white : colors.darkGrey }}>
            ...
          </Text>
        )}
        
      </View>
      <View style={styles.bottomView}>
        <View>
          <Text style={[styles.requestTime, { color: isDarkMode ? colors.white : colors.darkGrey }]}>
          {formatRequestTime(item?.request_time)}
          </Text>
        </View>
        <View style={[styles.status, { backgroundColor: getStatusBackgroundColor(request_status) }]}>
          <Text style={styles.statusText}>{getStatusTranslation(request_status)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchableOpacityStyles: {

    borderRadius: 20,
    padding: 15,
    marginHorizontal: 10,
    backgroundColor: colors.white,
    elevation:2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
  serviceName: {
    fontFamily: 'Prompt-SemiBold',
    fontSize: 15,
    marginBottom: 5,
  },
  providerName: {
    fontFamily: 'Prompt-Regular',
    fontSize: 13,
    paddingVertical: 10,
  },
  subServiceName: {
    fontFamily: 'Prompt-Regular',
    fontSize: 13,
  },
  bottomView: {
    flexDirection: 'row',
    paddingTop: 15,
    justifyContent:'space-between',
    alignItems: 'center',
  },
  requestTime: {
    fontFamily: 'Prompt-Regular',
    fontSize: 11,
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
  }
});

export default RequestList;
