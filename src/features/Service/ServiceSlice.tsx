import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_URL } from '../../utils/config';
import * as RootNavigation from '../../navigation/RootNavigation';
import { authHeader } from '../../utils/auth-header';

export const getServicesByCategory = createAsyncThunk(
    'services/getServicesByCategory',
    async ({categoryId}:any) => {
      
      let header: any = await authHeader();
      const response = await fetch(`${API_URL}/categories/${categoryId}`, {
        method: 'GET',
        headers: header,
      });
      return (await response.json()) as any;
    },
  );


  const ServiceSlice = createSlice({
    name: 'services',
    initialState: {
        services:[],
        servicesByCategory:[],
      loading: false,
    },
    reducers: {
      clearMessage(state: any) {
        state.status = null;
      },
    },
    extraReducers: builder => {
       
        //businesses
      builder.addCase(getServicesByCategory.pending, state => {
       // console.log('Pending');
        state.loading = true;
      });
      builder.addCase(getServicesByCategory.fulfilled, (state, action) => {
  
        if (action.payload.status) {
          state.servicesByCategory = action.payload.data.category.services;
        }
        state.loading = false;
      });
      builder.addCase(getServicesByCategory.rejected, (state, action) => {
        console.log('Rejected');
        console.log(action.error);
        state.loading = false;
      });

    },
  });
  
  export const { clearMessage } = ServiceSlice.actions;
  
  export default ServiceSlice.reducer;