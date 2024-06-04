// PackagePayments.js
import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import PaymentRadioButton from '../../components/PaymentRadioButton';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { colors } from '../../utils/colors';
import { BasicView } from '../../components/BasicView';
import Button from '../../components/Button';
import { ButtonText } from '../../components/ButtonText';
import { formatNumber } from '../../utils/utilts';
import { globalStyles } from '../../styles/global';
import ToastMessage from '../../components/ToastMessage';

const PackagePayments = ({route}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [phoneNumbers, setPhoneNumbers] = useState({});
  const [isValidNumber, setIsValidNumber] = useState(true); 

  const handleRadioButtonPress = (method) => {
    setSelectedPaymentMethod(method.id);
  };

  const { packageId,
    type,
    amount}=route.params


  const { t } = useTranslation();

  const handlePhoneNumberChange = (methodId, number) => {
    setPhoneNumbers({
      ...phoneNumbers,
      [methodId]: number,
    });
  };

  const paymentMethods = [
    { id: 1, label: 'M-Pesa', imageSource: require('../../../assets/images/mpesa.jpg'), hasInput: true },
    { id: 2, label: 'Tigo-Pesa', imageSource: require('../../../assets/images/tigo-pesa.png'), hasInput: true },
    { id: 3, label: 'Airtel-Money', imageSource: require('../../../assets/images/airtel.jpeg'), hasInput: true },
    { id: 4, label: 'Visa', imageSource: require('../../../assets/images/visa.png') },
    { id: 5, label: 'Master-card', imageSource: require('../../../assets/images/mastercard.png') },
  ];

  const { isDarkMode } = useSelector(
    (state: RootStateOrAny) => state.theme,
);

const [toastMessage, setToastMessage] = useState(''); 
const [showToast, setShowToast] = useState(false);
const toggleToast = () => {
  setShowToast(!showToast);
};


const showToastMessage = (message) => {
  setToastMessage(message);
  toggleToast(); 
  setTimeout(() => {
    toggleToast(); 
  }, 5000); 
};


const  submitPayment =()=>{

   

       if(selectedPaymentMethod==null){
        showToastMessage(t('screens:pleaseSelectPaymentMethod'));
       }

       if((selectedPaymentMethod==1 || selectedPaymentMethod==2 || selectedPaymentMethod==3)  && phoneNumbers[selectedPaymentMethod]==null){
        showToastMessage(t('screens:pleaseEnterMobileNetworkPhoneNumber'));
       }

       if (!isValidNumber) {
        showToastMessage(t('screens:invalidNumberFormat'));
        return;
      }
}

const stylesGlobal = globalStyles();
  return (
    <ScrollView style={stylesGlobal.scrollBg}>
      <View>
      {showToast && <View style={{marginBottom:'20%'}}>
   <ToastMessage message={toastMessage} onClose={toggleToast} />
   </View>}
        <Text style={{
            alignSelf:'center',
            marginVertical:10,
            fontWeight:'bold',
            fontSize:18,
            color:isDarkMode? colors.white:colors.black
        }}>{t('screens:pleaseSelectPaymentMethod')}</Text>
        {paymentMethods.map((method, index) => (
          <PaymentRadioButton
            key={index}
            method={method}
            isSelected={selectedPaymentMethod === method.id}
            onPress={handleRadioButtonPress}
            phoneNumber={phoneNumbers[method.id]}
            setPhoneNumber={(number) => handlePhoneNumberChange(method.id, number)}
            setIsValidNumber={setIsValidNumber}
            isValidNumber={isValidNumber}
          />
        ))}

        {/* <Text>Selected Payment Method: {selectedPaymentMethod}</Text>
        <Text>Entered Phone Number: {phoneNumbers[selectedPaymentMethod]}</Text> */}
        <Text style={{
             fontWeight:'bold',
             margin:15,
             fontSize:18,
             color:isDarkMode? colors.white:colors.black
        }}>{t('screens:amountToPay')}: {formatNumber(amount,2)}</Text>

        <BasicView>
            <Button loading={false} onPress={()=>submitPayment()}>
              <ButtonText>{t('screens:pay')}</ButtonText>
            </Button>
          </BasicView>
      </View>
    </ScrollView>
  );
};

export default PackagePayments;
