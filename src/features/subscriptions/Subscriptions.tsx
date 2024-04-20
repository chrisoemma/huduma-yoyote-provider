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

const Subscriptions = () => {


  const { loading, subscriptions } = useSelector(
    (state: RootStateOrAny) => state.subscriptions,
  );

  const { user } = useSelector(
    (state: RootStateOrAny) => state.user,
  );

  const dispatch = useAppDispatch();
  const [selectedPackage, setSelectedPackage] = useState(null);

  const handlePackageSelect = (subPackage) => {
  
    setSelectedPackage(subPackage);
    
    if (subscriptions?.subscription?.status === 'Active') {
      const newSubscriptionAmount = (subPackage.package.amount * subPackage.duration) - (subPackage.amount * subPackage.duration);
      let amountToPay = 0;
      

      if (subscriptions?.subscription?.is_trial) {
        amountToPay = newSubscriptionAmount;
      } else {

        const currentDate = new Date();
        const endDate = new Date(subscriptions.subscription.end_date);
        
        const numberOfDaysRemaining = Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24)); // Calculate remaining days
        
        const amountRemainingPreviousSubscription = (numberOfDaysRemaining / (subscriptions?.subscription?.discount?.duration*30)) + subPackage?.amount*subPackage?.duration;
        // console.log('amount remaning',(amountRemainingPreviousSubscription));

        amountToPay = newSubscriptionAmount - amountRemainingPreviousSubscription;
      }
  
      amountToPay = Math.max(0, amountToPay); 
  
      //console.log('Amount to pay:', amountToPay);
    }
  };
  

  if (user.provider) {
    useEffect(() => {
      dispatch(getSubscriptions({ providerId: user.provider.id }));
    }, [])
  }

  const stylesGlobal = globalStyles();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={['#259CA2', '#ba34eb']} style={{ flex: 1 }}>
        <ScrollView>
          {/* Active Subscription */}
          {subscriptions?.subscription ? (
            <View style={styles.activePackage}>
              <Text style={styles.textActive}>
                {subscriptions?.subscription ? (subscriptions?.subscription?.status == 'Active' || subscriptions?.subscription?.status == 'Expired') ? 'Active subscription' : 'Expired Subscription' : ''}
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
                      <Text style={styles.freeTrial}>Trial:Free</Text>
                    </>
                  ) : (
                    <>
                      {subscriptions?.subscription?.discount ? (
                        <View>
                          <Text style={styles.realPrice}>
                            {subscriptions?.subscription?.package.amount - subscriptions?.subscription?.discount?.amount}
                          </Text>
                          <Text style={styles.freeTrial}>Duration: {subscriptions?.subscription?.discount?.duration}</Text>
                        </View>
                      ) : (
                        <View>
                          <Text style={styles.realPrice}>Price: {subscriptions?.subscription?.package?.amount}</Text>
                          <Text style={styles.freeTrial}>Duration: 1</Text>
                        </View>
                      )}
                    </>
                  )}
                </View>

                <View style={styles.dates}>
                  <Text style={styles.textDate}>Start: {formatDate(subscriptions?.subscription?.start_date)}</Text>
                  <Text style={styles.textDate}>End: {formatDate(subscriptions?.subscription?.end_date)}</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <></>
          )}

          {/* Upgrade Subscription */}
          <View style={{ marginTop: 20, marginBottom: 10 }}>
            <Text style={styles.textActive}>Upgrade Subscription</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {subscriptions?.provider_packages ? (
                <>
                  {subscriptions.provider_packages.map((subPackage) => (
                    <TouchableOpacity
                      style={[
                        styles.upPackage,
                        selectedPackage?.id === subPackage.id && { backgroundColor: 'white' },
                        subscriptions?.subscription?.discount_id === subPackage.id ||
                        (subscriptions?.subscription?.status == 'Active' && subscriptions?.subscription?.discount?.duration >= subPackage.duration)
                          ? { opacity: 0.5 }
                          : null,
                      ]}
                      key={subPackage.id}
                      onPress={() =>
                        !(subscriptions?.subscription?.discount_id === subPackage.id ||
                        (subscriptions?.subscription?.status == 'Active' && subscriptions?.subscription?.discount?.duration >= subPackage.duration))
                          ? handlePackageSelect(subPackage)
                          : null
                      }
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
                          Actual: {subPackage?.package.amount * subPackage.duration}
                        </Text>
                        <Text
                          style={[
                            styles.realPrice,
                            { color: selectedPackage?.id === subPackage.id ? 'black' : colors.white },
                          ]}
                        >
                          Price: {subPackage?.package.amount * subPackage.duration - subPackage.amount * subPackage.duration}
                        </Text>
                        <Text
                          style={[styles.freeTrial, { color: selectedPackage?.id === subPackage.id ? 'black' : colors.white }]}
                        >
                          Duration: {subPackage.duration}
                        </Text>
                      </View>
                      <TouchableOpacity style={styles.upgrade}>
                        <Text style={[styles.textUpgrade, { color: 'black' }]}>UPGRADE</Text>
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
    height: 200,
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