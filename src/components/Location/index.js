import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import {RootStateOrAny, useSelector} from 'react-redux';
import styles from './styles';
import {useAppDispatch} from '../../app/store';
import {
  getDistrictByRegion,
  getPlacesByWard,
  getRegions,
  getWardsByDistrict,
} from './LocationSlice';
import {colors} from '../../utils/colors';
import {transformArray} from '../../utils/utilts';
import {useTranslation} from 'react-i18next';

const Location = ({
  getRegionValue,
  getDistrictValue,
  getWardValue,
  getStreetValue,
  // getStreetInput,
  initialRegion,
  initialDistrict,
  initialWard,
  initialStreet,
  errors,
}) => {
  const WIDTH = Dimensions.get('window').width;
  const [RegionOpen, setRegionOpen] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);
  const [wardOpen, setWardOpen] = useState(false);
  const [streetOpen, setStreetOpen] = useState(false);
  const [districtValue, setDistrictValue] = useState(initialDistrict);
  const [wardValue, setWardValue] = useState(initialWard);
  const [streetValue, setStreetValue] = useState(initialStreet);
  const [RegionValue, setRegionValue] = useState(initialRegion);
  const [error, setError] = useState(null);
  const [streetChoosing, setStreetChoosing] = useState(true);

  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const {
    regions,
    regionsLoading,
    places,
    placesLoading,
    wards,
    wardsLoading,
    districts,
    districtsLoading,
  } = useSelector((state: RootStateOrAny) => state.locations);
  useEffect(() => {
    dispatch(getRegions());
  }, [dispatch]);

  useEffect(() => {
    if (RegionValue !== null) {
      dispatch(getDistrictByRegion(RegionValue));
    }
  }, [dispatch, RegionValue]);

  useEffect(() => {
    if (districtValue !== null) {
      dispatch(getWardsByDistrict(districtValue));
    }
  }, [dispatch, districtValue]);

  useEffect(() => {
    if (wardValue !== null) {
      dispatch(getPlacesByWard(wardValue));
    }
  }, [dispatch, wardValue]);

  const onChangeRegionValue = value => {
    // console.log('Regionvalue',value);
    if (value !== null && value !== RegionValue) {
      dispatch(getDistrictByRegion(value));
      setRegionValue(value);
    }
    if (error) {
      setError(null);
    }
  };

  const onChangeDistrictValue = value => {
    getDistrictValue(value);

    if (value !== null && value !== districtValue) {
      dispatch(getWardsByDistrict(value));
      setDistrictValue(value);
    }
    if (error) {
      setError(null);
      //   console.log(error);
    }
  };
  const onChangeWardValue = value => {
    getWardValue(value);

    if (value !== null && value !== wardValue) {
      dispatch(getPlacesByWard(value));
      setWardValue(value);
    }
    if (error) {
      setError(null);

      //   console.log(error);
    }
  };
  const onChangeStreetValue = value => {
    // alert('onchange strreet',value)

    ///  console.log('screet value',value)
    getStreetValue(value);
    setStreetValue(value);
    // setStreetChoosing(true)
    if (error) {
      setError(null);
      //   console.log(error);
    }
  };

  const onRegionOpen = useCallback(() => {
    setDistrictOpen(false);
    setWardOpen(false);
    setStreetOpen(false);
  }, []);
  const onDistrictOpen = useCallback(() => {
    setRegionOpen(false);
    setWardOpen(false);
    setStreetOpen(false);
  }, []);
  const onWardOpen = useCallback(() => {
    setRegionOpen(false);
    setDistrictOpen(false);
    setStreetOpen(false);
  }, []);
  const onStreetOpen = useCallback(() => {
    setRegionOpen(false);
    setDistrictOpen(false);
    setWardOpen(false);
  }, []);

  //   const onChange=({name,value})=>{
  //      getStreetInput(value);
  //   }

  //  const addStreetInput =()=>{
  //         setStreetOpen(false);
  //      setStreetValue(null);
  //      setStreetChoosing(false);

  //   }
  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          flex: 1,
          marginTop: 8,
        }}>
        {regionsLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <></>
        )}
        <DropDownPicker
          containerStyle={{
            width: WIDTH / 2.5,
            marginRight: 10,
          }}
          zIndex={6000}
          placeholder={t('screens:chooseRegion')}
          listMode="MODAL"
          searchable={true}
          open={RegionOpen}
          value={RegionValue}
          items={transformArray(regions, 'region_name', 'region_code')}
          setOpen={setRegionOpen}
          onOpen={onRegionOpen}
          setValue={setRegionValue}
          onChangeValue={onChangeRegionValue}
        />

        {districtsLoading ? (
          <View style={styles.loading2}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <></>
        )}
        <DropDownPicker
          containerStyle={{
            width: WIDTH / 2.5,
          }}
          zIndex={6000}
          placeholder={t('screens:chooseDistrict')}
          searchable={true}
          listMode="MODAL"
          open={districtOpen}
          value={districtValue}
          items={transformArray(districts, 'district_name', 'district_code')}
          setOpen={setDistrictOpen}
          onOpen={onDistrictOpen}
          setValue={setDistrictValue}
          onChangeValue={onChangeDistrictValue}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          flex: 1,
          marginVertical: 15,
        }}>
        {wardsLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <></>
        )}
        <DropDownPicker
          containerStyle={{
            width: WIDTH / 2.5,
            marginRight: 2,
          }}
          zIndex={5100}
          placeholder={t('screens:chooseWard')}
          searchable={true}
          open={wardOpen}
          listMode="MODAL"
          value={wardValue}
          items={transformArray(wards, 'ward_name', 'ward_code')}
          setOpen={setWardOpen}
          onOpen={onWardOpen}
          setValue={setWardValue}
          onChangeValue={onChangeWardValue}
        />
        {placesLoading ? (
          <View style={styles.loading2}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <></>
        )}
        <DropDownPicker
          containerStyle={{
            width: WIDTH / 2.5,
          }}
          zIndex={5100}
          placeholder={t('screens:chooseStreet')}
          searchable={true}
          listMode="MODAL"
          open={streetOpen}
          value={streetValue}
          items={transformArray(places, 'place_name', 'id')}
          setOpen={setStreetOpen}
          onOpen={onStreetOpen}
          setValue={setStreetValue}
          onChangeValue={onChangeStreetValue}
          onPress={() => setStreetChoosing(true)}
        />
      </View>

      {/* <TouchableOpacity 
     onPress={()=>addStreetInput()}
    >
        <Text style={{fontSize:15,marginLeft:3}}>+ New Street</Text>
    </TouchableOpacity>
    { streetChoosing==true? <View />:(
    <TextInput
        onChangeText={(value) => {
            onChange({ name: "location", value });
          }}
    placeholder="Street" />
        )}
      <Text style={{ color: "#f25d52",marginTop:10,marginLeft:5 }}>{errors?.street}</Text>
      */}
    </View>
  );
};

export default Location;
