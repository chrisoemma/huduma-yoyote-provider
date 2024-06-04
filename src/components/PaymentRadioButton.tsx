import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { colors } from '../utils/colors';
import { useTranslation } from 'react-i18next';

const PaymentRadioButton = ({ isValidNumber, setIsValidNumber, phoneNumber, setPhoneNumber, method, isSelected, onPress }: any) => {


    const handleRadioPress = () => {
        onPress(method);
    };

    const { isDarkMode } = useSelector(
        (state: RootStateOrAny) => state.theme,
    );

    const { t } = useTranslation();

    useEffect(() => {
        // Reset validity flag when a different payment method is selected
        setIsValidNumber(true);
    }, [isSelected]);



    const handleChangeText = (text) => {
        let maxLength;
        let validNumber = true;

        // Determine maximum length based on phone number prefix
        if (text.startsWith('0')) {
            maxLength = 10;
        } else if (text.startsWith('255')) {
            maxLength = 12;
        } else {
            maxLength = 12;
        }

        // Truncate the input if it exceeds the maximum length
        if (text.length > maxLength) {
            text = text.slice(0, maxLength);
        }

        // Validate the phone number format
        switch (method.label) {
            case 'M-Pesa':
                validNumber = /^(255|0)7[4-7]\d{7}$/.test(text);
                break;
            case 'Tigo-Pesa':
                validNumber = /^(255|0)65\d{6,7}$|^(255|0)67\d{6,7}$|^(255|0)71\d{6,7}$/.test(text);
                break;
            case 'Airtel-Money':
                validNumber = /^(255|0)68\d{6,7}$|^(255|0)69\d{6,7}$|^(255|0)78\d{6,7}$/.test(text);
                break;
            default:
                validNumber = true;
                break;
        }

        setPhoneNumber(text);
        setIsValidNumber(validNumber); // Update isValidNumber state based on phone number validity
    };


    return (
        <View style={{ flexDirection: 'column', margin: 15 }}>
            <TouchableOpacity onPress={handleRadioPress}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: isDarkMode ? colors.white : 'black', justifyContent: 'center', alignItems: 'center' }}>
                        {isSelected && <Text style={{ color: isDarkMode ? colors.white : 'black' }}>✔</Text>}
                    </View>
                    <Text style={{ fontSize: 18, marginLeft: 8, color: isDarkMode ? colors.white : 'black' }}>{method.label}</Text>
                    <Image source={method.imageSource} style={{ width: 70, height: 70, marginLeft: 8, resizeMode: 'contain' }} />
                </View>
            </TouchableOpacity>
            {isSelected && method.hasInput && (
                <View>
                    <TextInput
                        style={{
                            borderWidth: 1,
                            borderColor: isDarkMode ? colors.white : 'black',
                            color: isDarkMode ? colors.white : 'black',
                            padding: 4,
                            marginTop: 8
                        }}
                        placeholder="Enter phone number"
                        placeholderTextColor={isDarkMode ? colors.white : 'black'}
                        keyboardType="numeric"
                        onChangeText={handleChangeText}
                        value={phoneNumber}
                        maxLength={12} // Default to 12 characters maximum
                    />
                    {!isValidNumber && <Text style={{ color: 'red' }}>{t('screens:invalidNumberFormat')}</Text>}
                </View>
            )}
        </View>
    );
};

export default PaymentRadioButton;
