import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { colors } from '../utils/colors'

const Databoard = ({ onPress, mainTitle, number, color }: any) => {

    const styles = StyleSheet.create({
        
        dataBoard: {
            backgroundColor: `${color}`,
            marginTop: 12,
            height: 110,
            width: 145,
            padding: 10,
            marginHorizontal: 8,
            borderRadius: 15,
            shadowColor: '#000',
            justifyContent: 'center',
            alignItems: 'center',
            shadowOffset: {
                width: 0,
                height: 2
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5
        },
        headText: {
            fontSize: 15,
            color: '#ffff',
            textAlign: 'center'

        },
        middleText: {
            fontSize: 18,
            fontWeight: 'bold',
            marginTop: 5,
            color: '#ffff',
        }

    })



    const Divider = () => {
        return <View style={{ borderBottomWidth: 1, borderColor: 'white', marginVertical: 4 }} />;
    };

    return (
        <TouchableOpacity
            style={styles.dataBoard}
            onPress={() => { onPress() }}
        >
            <Text style={styles.middleText}>{number}</Text>
           
             <Divider />
             <Text style={styles.headText}>{mainTitle}</Text>

        </TouchableOpacity>
    )
}



export default Databoard