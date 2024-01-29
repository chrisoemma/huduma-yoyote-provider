import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_URL } from '../../utils/config';
import { authHeader } from '../../utils/auth-header';

export const getRegions = createAsyncThunk(
  'locations/getRegions',
  async () => {
   // console.log('getting regions::::::')
    let header: any = await authHeader();
    const response = await fetch(`${API_URL}/locations/regions/`, {
      method: 'GET',
      headers: header,
    });
    return (await response.json()) as any;
  },
);

export const getDistrictByRegion = createAsyncThunk(
  'locations/getDistrictByRegion',
  async (id) => {
    console.log('region id',id)
    let header: any = await authHeader();
    const response = await fetch(`${API_URL}/locations/districts_by_region/${id}`, {
      method: 'GET',
      headers: header,
    });
    return (await response.json()) as any;
  },
);

export const getWardsByDistrict = createAsyncThunk(
  'locations/getWardsByDistrict',
  async (id) => {
    let header: any = await authHeader();
    const response = await fetch(`${API_URL}/locations/wards_by_district/${id}`, {
      method: 'GET',
      headers: header,
    });
    return (await response.json()) as any;
  },
);


export const getPlacesByWard = createAsyncThunk(
  'locations/getPlacesByWard',
  async (id) => {
    let header: any = await authHeader();
    const response = await fetch(`${API_URL}/locations/places_by_ward/${id}`, {
      method: 'GET',
      headers: header,
    });
    return (await response.json()) as any;
  },
);


const LocationSlice = createSlice({
  name: 'locations',
  initialState: {
    regions: [],
    regionsLoading: false,
    places: [],
    placesLoading: false,
    wards: [],
    wardsLoading: false,
    districts: [],
    districtsLoading: false
  },
  reducers: {
    clearMessage(state: any) {
      state.status = null;
    },
  },
  extraReducers: builder => {

    //get regions
    builder.addCase(getRegions.pending, state => {
      state.regionsLoading = true;
    });
    builder.addCase(getRegions.fulfilled, (state, action) => {
      if (action.payload.status) {
        state.regions = action.payload.data.regions;
      }
      state.regionsLoading = false;
    });
    builder.addCase(getRegions.rejected, (state, action) => {
      state.regionsLoading = false;
    });

    //get districts

    builder.addCase(getDistrictByRegion.pending, state => {
      state.districtsLoading = true;
    });
    builder.addCase(getDistrictByRegion.fulfilled, (state, action) => {
      if (action.payload.status) {
        state.districts = action.payload.data.districts;
      }
      state.districtsLoading = false;
    });
    builder.addCase(getDistrictByRegion.rejected, (state, action) => {
      state.districtsLoading = false;
    });

    //wards 
    builder.addCase(getWardsByDistrict.pending, state => {
      state.wardsLoading = true;
    });
    builder.addCase(getWardsByDistrict.fulfilled, (state, action) => {
      if (action.payload.status) {
        state.wards = action.payload.data.wards;
      }
      state.wardsLoading = false;
    });
    builder.addCase(getWardsByDistrict.rejected, (state, action) => {
      state.wardsLoading = false;
    });

    //places

    builder.addCase(getPlacesByWard.pending, state => {
      state.placesLoading = true;
    });
    builder.addCase(getPlacesByWard.fulfilled, (state, action) => {
      if (action.payload.status) {
        state.places = action.payload.data.places;
      }
      state.placesLoading = false;
    });
    builder.addCase(getPlacesByWard.rejected, (state, action) => {
      state.placesLoading = false;
    });


  },
});

export const { clearMessage } = LocationSlice.actions;

export default LocationSlice.reducer;