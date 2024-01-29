import React from 'react'
import { View } from 'react-native'
import { globalStyles } from '../styles/global'


const Divider = () => {
    const stylesGlobal=globalStyles();
    return (
      <>
      <View  style={stylesGlobal.separator}/>
      </>
    )
}

export default Divider
