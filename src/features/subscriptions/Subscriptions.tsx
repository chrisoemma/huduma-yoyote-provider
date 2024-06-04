import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { globalStyles } from '../../styles/global';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../utils/colors';
import Icon from 'react-native-vector-icons/AntDesign';
import { useSelector, RootStateOrAny } from 'react-redux';
import { useAppDispatch } from '../../app/store';
import { getSubscriptions } from './SubscriptionSlice';
import { formatDate } from '../../utils/utilts';
import { useTranslation } from 'react-i18next';

const Subscriptions = ({navigation}:any) => {


  const { loading, subscriptions } = useSelector(
    (state: RootStateOrAny) => state.subscriptions,
  );

  const { user } = useSelector(
    (state: RootStateOrAny) => state.user,
  );

  const dispatch = useAppDispatch();
  const [selectedPackage, setSelectedPackage] = useState(null);

  const handlePackageSelect = (packageId,type,packageName,amount) => {
      
    const formattedPackageName = packageName.toUpperCase();

    Alert.alert(
      'Confirm Action',
      `Are you sure you want to ${type} the ${formattedPackageName} package?`,
      [
          {
              text: 'Cancel',
              style: 'cancel',
          },
          {
              text: 'Confirm',
              onPress: () => {

                              navigation.navigate('Package Payments', {
                                  packageId: packageId,
                                  type:type,
                                  amount:amount
                              });
                         
              },
          },
      ]
  );
};
   


  if (user.provider) {
    useEffect(() => {
      dispatch(getSubscriptions({ providerId: user.provider.id }));
    }, [])
    
  }

  const { t } = useTranslation();
  const stylesGlobal = globalStyles();
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={['#259CA2', '#ba34eb']} style={{ flex: 1 }}>
        <ScrollView>
          {/* Active Subscription */}
          {subscriptions?.subscription ? (
            <View style={styles.activePackage}>
              <Text style={styles.textActive}>
                {subscriptions?.subscription ? (subscriptions?.subscription?.status == 'Active' || subscriptions?.subscription?.status == 'Expired') ? t('screens:activeSubscription') : t('screens:expiredSubscriptions'): ''}
              </Text>

              <TouchableOpacity style={styles.subpackage} disabled={subscriptions?.subscription?.is_trial || subscriptions?.subscription?.status == 'Expired'}>
                <View style={styles.firstBlock}>
                  <View>
                    <Text style={styles.textPackage}>
                      {subscriptions?.subscription?.is_trial
                        ? subscriptions?.subscription.package.name
                        : subscriptions?.subscription.discount.name}
                    </Text>
                  </View>
                  <View style={styles.circle}>
                    <Icon name="check" color={colors.white} size={16} />
                  </View>
                </View>

                <View style={styles.price}>
                  {subscriptions?.subscription?.is_trial ? (
                    <>
                      <Text style={styles.priceText}>{subscriptions?.subscription?.package?.amount}</Text>
                      <Text style={styles.freeTrial}>{t('screens:trialFree')}</Text>
                    </>
                  ) : (
                    <>
                      {subscriptions?.subscription?.discount ? (
                        <View>
                          <Text style={styles.realPrice}>
                            {subscriptions?.subscription?.package.amount - subscriptions?.subscription?.discount?.amount}
                          </Text>
                          <Text style={styles.freeTrial}>{t('screens:duration')}: {subscriptions?.subscription?.discount?.duration}</Text>
                        </View>
                      ) : (
                        <View>
                          <Text style={styles.realPrice}>{t('screens:price')}: {subscriptions?.subscription?.package?.amount}</Text>
                          <Text style={styles.freeTrial}>{t('screens:duration')}: 1</Text>
                        </View>
                      )}
                    </>
                  )}
                </View>

                <View style={styles.dates}>
                  <Text style={styles.textDate}>{t('screens:start')}: {formatDate(subscriptions?.subscription?.start_date)}</Text>
                  <Text style={styles.textDate}>{t('screens:end')}: {formatDate(subscriptions?.subscription?.end_date)}</Text>
                </View>
                {subscriptions?.subscription?.is_trial ? (
                  <></>
                ) : (<TouchableOpacity style={[styles.upgrade, { backgroundColor: colors.black }]}
                    onPress={()=>handlePackageSelect(subscriptions?.subscription?.discount.id,'renew',subscriptions?.subscription?.is_trial
                    ? subscriptions?.subscription.package.name
                    : subscriptions?.subscription.discount.name,(subscriptions?.subscription?.package.amount - subscriptions?.subscription?.discount?.amount))}
                >
                  <Text style={[styles.textUpgrade, { color: 'white' }]}>{t('screens:renew')}</Text>
                </TouchableOpacity>)}
              </TouchableOpacity>
            </View>
          ) : (
            <></>
          )}

          <View style={{ marginTop: 20, marginBottom: 10 }}>
            <Text style={styles.textActive}>{t('screens:subscriptionOptions')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {subscriptions?.provider_packages ? (
                <>
                  {subscriptions.provider_packages.map((subPackage) => (
                    <TouchableOpacity
                      style={[
                        styles.upPackage,
                        selectedPackage?.id === subPackage.id && { backgroundColor: 'white' },
                        (subscriptions?.subscription?.discount_id === subPackage.id && selectedPackage?.id !== subPackage.id)
                          ? { backgroundColor: colors.gray, opacity: 0.5 } 
                          : null,
                      ]}
                      key={subPackage.id}
                      onPress={() =>
                        !(subscriptions?.subscription?.discount_id === subPackage.id)
                          ? handlePackageSelect(subPackage?.id,'select',subPackage?.name,(subPackage?.package.amount * subPackage.duration - subPackage.amount * subPackage.duration))
                          : null
                      }
                      disabled={subscriptions?.subscription?.discount_id === subPackage.id}
                    >
                      <View style={styles.firstBlock}>
                        <View>
                          <Text
                            style={[
                              styles.textPackage,
                              { color: selectedPackage?.id === subPackage.id ? 'black' : colors.white },
                            ]}
                          >
                            {subPackage?.name}
                          </Text>
                        </View>
                        {selectedPackage?.id === subPackage.id && (
                          <View style={styles.circle}>
                            <Icon name="check" color={colors.white} size={16} />
                          </View>
                        )}
                      </View>
                      <View style={styles.price}>
                        <Text
                          style={[
                            styles.priceText,
                            { color: selectedPackage?.id === subPackage.id ? 'black' : colors.white },
                          ]}
                        >
                          {t('screens:actual')}: {subPackage?.package.amount * subPackage.duration}
                        </Text>
                        <Text
                          style={[
                            styles.realPrice,
                            { color: selectedPackage?.id === subPackage.id ? 'black' : colors.white },
                          ]}
                        >
                          {t('screens:price')}: {subPackage?.package.amount * subPackage.duration - subPackage.amount * subPackage.duration}
                        </Text>
                        <Text
                          style={[styles.freeTrial, { color: selectedPackage?.id === subPackage.id ? 'black' : colors.white }]}
                        >
                         {t('screens:duration')}: {subPackage.duration}
                        </Text>
                      </View>
                      <TouchableOpacity style={styles.upgrade}
                       onPress={()=>handlePackageSelect(subPackage?.id,'select',subPackage?.name,(subPackage?.package.amount * subPackage.duration - subPackage.amount * subPackage.duration))}
                      >
                        <Text style={[styles.textUpgrade, { color: 'black' }]}>{t('screens:select')}</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </>
              ) : (
                <></>
              )}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({

  subpackage: {
    alignSelf: 'center',
    width: '50%',
    backgroundColor: colors.white,
    borderRadius: 25,
    padding: 15
  },
  upPackage: {
    width: '45%',
    borderRadius: 25,
    padding: 15,
    marginHorizontal: 8,
    marginTop: 8,
    borderWidth: 2,
    borderColor: colors.white
  },
  activePackage: {
    marginTop: 20
  },
  textActive: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
    color: colors.white,
    fontSize: 18,
    elevation: 4
  },
  firstBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  upgrade: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.whiteBackground,
    borderRadius: 20,
    elevation: 4
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 30,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center'
  },
  textPackage: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.black
  },
  textUpgrade: {
    color: colors.black
  },
  price: {
    marginVertical: 10
  },
  dates: {
    marginVertical: 2
  },
  priceText: {
    color: colors.black,
    paddingVertical: 3,
    fontWeight: 'bold',
    fontSize: 18,
    textDecorationLine: 'line-through',
  },
  realPrice: {
    color: colors.black,
    paddingVertical: 3,
    fontWeight: 'bold',
    fontSize: 18,
  },
  freeTrial: {
    color: colors.black,
    paddingVertical: 3,
    fontSize: 18,
  },
  textDate: {
    color: colors.black,
    paddingVertical: 1.5,
    fontSize: 16
  }
});

export default Subscriptions