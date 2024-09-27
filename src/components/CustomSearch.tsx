import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { colors } from '../utils/colors';


const CustomSearch = React.memo(({ placeholder, value, onChangeText }) => {

    return (
        <View style={styles.searchContainer}>
            <TextInput
                placeholder={placeholder}
                style={[styles.searchInput,{ backgroundColor: colors.white, color: colors.alsoGrey }]}
                placeholderTextColor={colors.alsoGrey}
                value={value}
                onChangeText={onChangeText}
                blurOnSubmit={false}
            />
        </View>
  );
});

const styles = StyleSheet.create({
    searchContainer: {
        marginTop: 20,
        marginHorizontal: 20,
        justifyContent:'center',
        alignItems:'center'
    },
    searchInput: {
        height: 40,
        fontFamily: 'Prompt-Regular',
        borderColor: '#ccc',
        borderWidth: 1,
        justifyContent:'center',
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
});

export default CustomSearch;
