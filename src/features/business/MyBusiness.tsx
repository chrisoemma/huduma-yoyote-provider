import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native'
import React, { useEffect } from 'react'
import { globalStyles } from '../../styles/global'
import { colors } from '../../utils/colors'
import FloatBtn from '../../components/FloatBtn';
import { useSelector,RootStateOrAny } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../app/store';
import { getBusinesses } from './BusinessSlice';
import { selectLanguage } from '../../costants/languangeSlice';

const MyBusiness = ({navigation }: any) => {

    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    const selectedLanguage = useSelector(selectLanguage);

    const stylesGlobal = globalStyles();

    const {user } = useSelector(
        (state: RootStateOrAny) => state.user,
    );
    
    const { loading, businesses } = useSelector(
      (state: RootStateOrAny) => state.businesses,
    );
    
    useEffect(() => {
       dispatch(getBusinesses({providerId:user?.provider?.id}));
    }, [dispatch])
    
    const renderItem = ({ item }: any) => (

        <View style={styles.businessContainer}>
            <TouchableOpacity
                style={styles.business}
                onPress={() => navigation.navigate('Business Details',{
                    service:item
                })}
            >
                <Image
                    source={{ uri: item.img_url || (item?.service?.images[0]?.img_url) }}
                    style={{
                        resizeMode: 'cover',
                        width: 90,
                        height: 90,
                        borderRadius: 10,
                    }}
                />
                <View style={styles.textContainer}>
                    <Text style={styles.categoryService}>{selectedLanguage=='en'?item?.service?.name?.en:item?.service?.name?.sw}</Text>
                    <Text style={styles.subservice}>{selectedLanguage=='en'? item?.service?.category?.name?.en:item?.service?.category?.name?.sw}</Text>
                    <Text style={styles.desc}>{item?.description==null?selectedLanguage=='en'? item?.service.description?.en:item?.service.description?.sw:item?.description}</Text>
                </View>

            </TouchableOpacity>
        </View>

    )

    return (
        <View style={[stylesGlobal.scrollBg,{flex:1}]}>
             <View style={stylesGlobal.appView}>
             <View>
                <FlatList
                    data={businesses}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                />
            </View>
             </View>

               {user.provider && user.status!=='In Active'?(
            <FloatBtn
                    onPress={() => { navigation.navigate('Add Business') }
                    }
                    iconType='add'
                />):(<View />)}
        </View>
    )
}

const styles = StyleSheet.create({

    businessContainer: {
        justifyContent: 'center'
    },

    business: {
        marginVertical: 8,
        alignItems: 'center',
        flexDirection: 'row',
        height: 150,
        padding: 10,
        elevation:2,
        backgroundColor: colors.white,
        borderRadius: 25
    },
    textContainer: {
        margin: 5
    },
    categoryService: {
        textTransform: 'uppercase',
        color: colors.secondary
    },
    service: {
        paddingTop: 5
    },
    subservice: {
        paddingTop: 5,
        fontWeight: 'bold',
        color: colors.black
    },
    desc: {
        paddingRight: '15%',
        color:colors.alsoGrey
    }

})

export default MyBusiness