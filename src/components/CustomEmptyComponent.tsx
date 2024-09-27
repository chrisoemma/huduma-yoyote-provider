import React from 'react';
import { View, Text, Image, StyleSheet} from 'react-native';
import { useSelector } from 'react-redux';
import { colors } from '../utils/colors';


const CustomEmptyComponent = ({ imageSource, message, subMessage }) => {
  const { isDarkMode } = useSelector(
    (state: RootStateOrAny) => state.theme,
  );
  return (
    <View style={styles.emptyContainer}>
      {imageSource && <Image source={imageSource} style={styles.emptyImage} />}
      <Text style={[styles.emptyText,{color:isDarkMode?colors.white:'#333',}]}>{message}</Text>
      {subMessage && <Text style={[styles.emptyText,{color:isDarkMode?colors.white:'#333'}]}>{subMessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    marginTop:'20%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Prompt-Regular',
  },
  emptyImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
});

export default CustomEmptyComponent;
