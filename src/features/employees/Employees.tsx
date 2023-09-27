import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native'
import React from 'react'
import { globalStyles } from '../../styles/global'
import { colors } from '../../utils/colors'
import FloatBtn from '../../components/FloatBtn';

const Employees = ({ navigation }: any) => {


    const data = [
        {
            id: 1,
            name: "James Aurthor",
            phone:"784567833",
            service:{
                id:1,
                name:"Kubandika kucha"
            },
            desc:"Works well under pressure"

        },
        {
            id: 2,
            name: "John cheo",
            phone:"756123455",
            service:{
                id:2,
                name:"Kuweka wigi"
            },
            desc:"Works well under pressure"
        },
        {
            id: "1",
            name: "Frank juma",
            phone:"756897467",
            service:{
                id:3,
                name:"Kubandika paka rangi kucha"
            },
            desc:"Works well under pressure"
        }
    ]
    const renderItem = ({ item }: any) => (

        <View style={styles.employeesContainer}>
            <TouchableOpacity
                style={styles.employees}
                onPress={() => navigation.navigate('Employee Account',{
                    employee:item
                })}
            >
                <Image
                    source={require('./../../../assets/images/Cleaning.jpg')}
                    style={{
                        resizeMode: 'cover',
                        width: 90,
                        height: 90,
                        borderRadius: 10,
                    }}
                />
                <View style={styles.textContainer}>
                    <Text style={styles.employeeName}>{item.name}</Text>
                    <Text style={styles.subservice}>{item.service.name}</Text>
                    <Text style={styles.desc}>{item.desc}</Text>
                </View>

            </TouchableOpacity>
        </View>

    )

    return (
        <View style={globalStyles.scrollBg}>
            <View style={globalStyles.appView}>
                <FlatList
                    data={data}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                />

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
        backgroundColor: colors.white,
        borderRadius: 10
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