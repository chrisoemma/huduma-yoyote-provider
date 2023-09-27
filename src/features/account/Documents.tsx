import { View, Text,SafeAreaView,TouchableOpacity,StyleSheet,ScrollView } from 'react-native'
import React, { useState } from 'react'
import { globalStyles } from '../../styles/global'
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../utils/colors';
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
  } from 'react-native-popup-menu';


const Documents = () => {
    
    const { t } = useTranslation();

        const [uploadedDocument, setUploadedDocument] = useState(null);
    
        // Function to handle document upload
        const handleDocumentUpload = () => {
          // Implement your logic to upload the document here
          // You can use libraries like react-native-document-picker or other methods
          // Once uploaded, you can set the document information in the state
        };
    
  return (
    <SafeAreaView
    style={globalStyles.scrollBg}
  >
    <ScrollView style={globalStyles.appView}>

    <TouchableOpacity
        style={styles.uploadArea}
        onPress={handleDocumentUpload}
      >
        {uploadedDocument ? (
          <Text style={styles.uploadedFileName}>
            {uploadedDocument?.name}
          </Text>
        ) : (
          <>
            <Icon
              name="cloud-upload-outline"
              size={48}
              color="#888"
            />
            <Text style={styles.uploadText}>{t('screens:uploadDocument')}</Text>
          </>
        )}
        <View style={styles.dottedLine}></View>
      </TouchableOpacity>
      <View style={styles.listView}>
        <Text style={{
            color:colors.black,
            fontWeight:'bold'
        }}>{t('screens:uploadedDocuments')}</Text>
         <View style={styles.documentItem}>
            <View>
            <Icon
              name="folder"
              size={25}
              color={colors.secondary}
            />
            </View>
            <View>
                 <Text>Nyaraka ya mchezo mpya</Text>
            </View>
            <TouchableOpacity >
          
              <Menu>
           <MenuTrigger>
           <Icon
              name="ellipsis-horizontal-sharp"
              size={25}
              color={colors.black}
            />
           </MenuTrigger>
      <MenuOptions>
        <MenuOption onSelect={() => alert(`Save`)} text='Preview' />
        <MenuOption onSelect={() => alert(`Delete`)} >
          <Text style={{color: 'red'}}>Delete</Text>
        </MenuOption>
      </MenuOptions>
    </Menu>
            </TouchableOpacity>
        </View>
      </View>

    </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({

    uploadArea: {
      alignSelf:'center',
      width:'100%',
      height: 150,
      backgroundColor: '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: '#888',
    },
    uploadedFileName: {
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 5,
    },
    uploadText: {
      fontSize: 16,
      color: '#888',
      textAlign: 'center',
    },
    dottedLine: {
      borderStyle: 'dotted',
      borderWidth: 1,
      borderColor: '#888',
      width: '80%',
      marginTop: 10,
    },
    listView:{
     marginTop:30
    },
    documentItem:{
        flexDirection:'row',
        marginVertical:10,
        borderBottomWidth:0.5,
        borderBottomColor:'#888',
        paddingVertical:10,
        justifyContent:'space-between'
    }
  });

export default Documents