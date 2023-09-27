import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_URL } from '../../utils/config';
import * as RootNavigation from '../../navigation/RootNavigation';
import { authHeader } from '../../utils/auth-header';

export const getBusinesses = createAsyncThunk(
    'businesses/businesses',
    async ({providerId}:any) => {
      
      let header: any = await authHeader();
      const response = await fetch(`${API_URL}/businesses/provider_businesses/${providerId}`, {
        method: 'GET',
        headers: header,
      });
      return (await response.json()) as any;
    },
  );


  export const createBusiness = createAsyncThunk(
    'businesses/createBusiness',
    async (data) => {
      const response = await fetch(`${API_URL}/businesses`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return (await response.json()) 
    },
  );


  export const getBusiness = createAsyncThunk(
    'businesses/getBusiness',
    async ({providerId,serviceId}:any) => {
      let header: any = await authHeader();
      const response = await fetch(`${API_URL}/businesses/provider_businesses/${providerId}/${serviceId}`, {
        method: 'GET',
        headers: header,
      });
      return (await response.json()) as any;
    },
  );


  function updateStatus(state: any, status: any) {
    if (status === '' || status === null) {
      state.status = '';
      return;
    }
  
    if (status.error) {
      state.status = status.error;
      return;
    }
  }


  export const deleteBusiness = createAsyncThunk(
    'businesses/deleteBusiness',
    async ({businessId}:any) => {
      try {
       
        const header: any = await authHeader();
        const response = await fetch(`${API_URL}/businesses/${businessId}`, {
          method: 'DELETE',
          headers: header,
        });
  
        if (!response.status) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete businesses');
        }
  
        return (await response.json())
      } catch (error) {
        throw error;
      }
    }
  );

  const BusinessSlice = createSlice({
    name: 'businesses',
    initialState: {
        businesses:[],
        business:[],
      loading: false,
    },
    reducers: {
      clearMessage(state: any) {
        state.status = null;
      },
    },
    extraReducers: builder => {
       
        //businesses
      builder.addCase(getBusinesses.pending, state => {
       // console.log('Pending');
        state.loading = true;
      });
      builder.addCase(getBusinesses.fulfilled, (state, action) => {
  
        if (action.payload.status) {
          state.businesses = action.payload.data.businesses;
        }
        state.loading = false;
      });
      builder.addCase(getBusinesses.rejected, (state, action) => {
        console.log('Rejected');
        console.log(action.error);
        state.loading = false;
      });


       //single business

       builder.addCase(getBusiness.pending, state => {
        // console.log('Pending');
         state.loading = true;
       });
       builder.addCase(getBusiness.fulfilled, (state, action) => {
         
         if (action.payload.status) {
           state.business = action.payload.data.sub_services;
         }
         state.loading = false;
       });
       builder.addCase(getBusiness.rejected, (state, action) => {
         console.log('Rejected');
         console.log(action.error);
         state.loading = false;
       });


       //create Business

       
    builder.addCase(createBusiness.pending, state => {
      console.log('Pending');
      state.loading = true;
      updateStatus(state, '');
    });
    builder.addCase(createBusiness.fulfilled, (state, action) => {
         console.log('sucesss')
         console.log('dayaa',action.payload)
      state.loading = false;
      updateStatus(state, '');

      // if (action.payload.status) {
      //   state.business = { ...action.payload.data};
      //   updateStatus(state, '');
      // } else {
      //   updateStatus(state, action.payload.status);
      // }

      // state.business.push(state.business);
    });
    builder.addCase(createBusiness.rejected, (state, action) => {
      console.log('Rejected');
      state.loading = false;
      updateStatus(state, '');
    });

       //delete business

       builder.addCase(deleteBusiness.pending, (state) => {
        console.log('Delete Business Pending');
        state.loading = true;
        updateStatus(state, '');
      });
  
      builder.addCase(deleteBusiness.fulfilled, (state, action) => {
        console.log('Delete Business Fulfilled',action.payload);
        const deletedBusinessId =action.meta.arg;
  
        // Filter out the deleted Business from the Businesss array
        state.business = state.businesses.filter((business) => business.id !== deletedBusinessId);
  
        state.loading = false;
        updateStatus(state, '');
      });
  
      builder.addCase(deleteBusiness.rejected, (state, action) => {
        console.log('Delete Business Rejected');
        state.loading = false;
        updateStatus(state, '');
      });
    },
  });
  
  export const { clearMessage } = BusinessSlice.actions;
  
  export default BusinessSlice.reducer;