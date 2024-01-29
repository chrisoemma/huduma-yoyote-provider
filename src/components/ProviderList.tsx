import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'
import React from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../utils/colors';
import RatingStars from './RatinsStars';
import { globalStyles } from '../styles/global';

const ProviderList = ({ navigation,onPress, iconType, service }: any) => {

    const stylesGlobal=globalStyles();

    return (
        <TouchableOpacity
            onPress={()=>navigation.navigate("Service request")}
            style={styles.touchableOpacityStyles}
        >
         <View style={stylesGlobal.circle}>
         <Image
                source={require('./../../assets/images/profile.png')}
                style={{
                    resizeMode: "cover",
                    width: 60,
                    height: 80,
                    borderRadius: 20,
                    alignSelf:'center'
                }}
            />
         </View>
         <View style={styles.divContent}>
            <Text>Frank John</Text>
            <View style={{flexDirection:'row'}}>
            <Ionicons name="location-outline" color={colors.primary} size={17}  />
            <Text>Mwananyamala</Text>
            </View>
            <View style={{flexDirection:'row'}}>
            <Ionicons name="pin" color={colors.primary} size={20}  />
            <Text>3Km</Text>
            </View>
            <RatingStars  rating={2}/>
         </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    touchableOpacityStyles: {
        width: '42%',
        height: 200,
        borderRadius: 18,
        paddingVertical: 8,
        marginHorizontal: 5,
        marginVertical: 5,
        backgroundColor:colors.white
    },
    divContent:{
        margin:10,

    }
})

export default ProviderList;
