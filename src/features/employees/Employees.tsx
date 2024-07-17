import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native'
import React, { useEffect } from 'react'
import { globalStyles } from '../../styles/global'
import { colors } from '../../utils/colors'
import FloatBtn from '../../components/FloatBtn';
import { useTranslation } from 'react-i18next';
import { useSelector,RootStateOrAny } from 'react-redux';
import { removeEmptyObjects } from '../../utils/utilts';
import { getEmployees } from './EmployeeSlice';
import { useAppDispatch } from '../../app/store';

const Employees = ({ navigation }: any) => {


    const { t } = useTranslation();


    const {user } = useSelector((state: RootStateOrAny) => state.user);
    const { isDarkMode } = useSelector((state: RootStateOrAny) => state.theme);

    const {loading,employees } = useSelector(
        (state: RootStateOrAny) => state.employees,
    );
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(getEmployees({ providerId:user.provider.id }));
        
      }, [])
  
    const renderItem = ({ item }: any) => (

        <View style={styles.employeesContainer}>
            <TouchableOpacity
               key={item?.id}
                style={[styles.employees,{backgroundColor:isDarkMode?colors.blackBackground:colors.white}]}
                onPress={() => navigation.navigate('Employee Account',{
                    employee:item
                })}
            >
                <Image
                    source={
                        item?.profile_img?.startsWith('https://')
                          ? { uri: item.profile_img }
                          : item?.user_img?.startsWith('https://')
                          ? { uri: item.user_img }
                          : require('./../../../assets/images/profile.png')
                      }
                  
                    style={{
                        resizeMode: 'cover',
                        width: 90,
                        height: 90,
                        borderRadius: 90,
                    }}
                />
                <View style={styles.textContainer}>
                    <Text style={[styles.employeeName,{color:isDarkMode?colors.black:colors.primary,fontWeight:'bold'}]}>{item.name}</Text>
                    <Text style={[styles.subservice,{color:isDarkMode?colors.white:colors.black}]}>{t('screens:requests')}: {item?.request_transfers?.length || 0}</Text>
                </View>

            </TouchableOpacity>
        </View>

    )

    const stylesGlobal = globalStyles();

    return (
        <View style={stylesGlobal.scrollBg}>
            <View style={[stylesGlobal.appView,{flex:1}]}>
                <View>
                <FlatList
                    data={removeEmptyObjects(employees)}
                    keyExtractor={(item) => item?.id}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                />
                </View>
                <FloatBtn
                    onPress={() => { navigation.navigate('Add Employees') }
                    }
                    iconType='add'
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({

    employeesContainer: {
        justifyContent: 'center'
    },

    employees: {
        marginVertical: 8,
        alignItems: 'center',
        flexDirection: 'row',
        height: 150,
        padding: 10,
        borderRadius: 30,
        elevation:2
    },
    textContainer: {
        margin: 5
    },
    employeeName: {
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
    }

})

export default Employees