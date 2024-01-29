import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_URL } from '../../utils/config';
import * as RootNavigation from '../../navigation/RootNavigation';
import { authHeader } from '../../utils/auth-header';

export const getSubserviceByService = createAsyncThunk(
    'subservices/getSubserviceByService',
    async ({serviceId}:any) => {
      
      let header: any = await authHeader();
      const response = await fetch(`${API_URL}/sub_services/sub_services_by_service/${serviceId}`, {
        method: 'GET',
        headers: header,
      });
      return (await response.json()) as any;
    },
  );



  export const getBusinessSubservices = createAsyncThunk(
    'subservices/getBusinessSubservices',
    async ({providerId,serviceId}:any) => {

      console.log('providerid',providerId)
      console.log('serviceid',serviceId)
      
      let header: any = await authHeader();
      const response = await fetch(`${API_URL}/businesses/provider_businesses/${providerId}/${serviceId}`, {
        method: 'GET',
        headers: header,
      });
      return (await response.json()) as any;
    },
  );


  export const createSubService = createAsyncThunk(
    'subservices/createSubService',
    async ({data,providerId,businessId}:any) => {
      const response = await fetch(`${API_URL}/businesses/add_subservice/${providerId}/${businessId}`, {
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


  export const deleteSubService = createAsyncThunk(
    'subservices/deleteSubService',
    async ({providerId,subServiceId}:any) => {
      try {
        const header: any = await authHeader();
        const response = await fetch(`${API_URL}/businesses/delete_provider_sub_service/${providerId}/${subServiceId}`, {
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


  const ServiceSlice = createSlice({
    name: 'subservices',
    initialState: {
        subservices:[],
        subServiceByService:[],
        subService:[],
      loading: false,
    },
    reducers: {
      clearMessage(state: any) {
        state.status = null;
      },
      clearSubServiceByService: (state) => {
        state.subServiceByService = [];
      },
    },
    extraReducers: builder => {
       
        //businesses
      builder.addCase(getSubserviceByService.pending, state => {
       // console.log('Pending');
        state.loading = true;
      });
      builder.addCase(getSubserviceByService.fulfilled, (state, action) => {
        if (action.payload.status) {
          state.subServiceByService = action.payload.data.sub_services;
        }
        state.loading = false;
      });
      builder.addCase(getSubserviceByService.rejected, (state, action) => {
        console.log('Rejected');
        console.log(action.error);
        state.loading = false;
      });



      builder.addCase(createSubService.pending, state => {
        console.log('Pending');
        state.loading = true;
        updateStatus(state, '');
      });
      builder.addCase(createSubService.fulfilled, (state, action) => {
           console.log('sucesss')
           console.log('dayaa',action.payload)
        state.loading = false;
        updateStatus(state, '');
  
        // if (action.payload.status) {
        //   state.subService = { ...action.payload.data};
        //   updateStatus(state, '');
        // } else {
        //   updateStatus(state, action.payload.status);
        // }
        // state.business.push(state.business);
      });
      builder.addCase(createSubService.rejected, (state, action) => {
        console.log('Rejected');
        state.loading = false;
        updateStatus(state, '');
      });


      //delete sub services

      builder.addCase(deleteSubService.pending, (state) => {
        console.log('Delete Subservice Pending');
        state.loading = true;
        updateStatus(state, '');
      });
  
      builder.addCase(deleteSubService.fulfilled, (state, action) => {
        console.log('Delete Subservice Fulfilled',action.payload);
        const deletedSubServiceId =action.meta.arg;
  
        // Filter out the deleted Subservice from the Subservices array
        state.subService = state.subservices.filter((subservice) => subservice.id !== deletedSubServiceId);
  
        state.loading = false;
        updateStatus(state, '');
      });
  
      builder.addCase(deleteSubService.rejected, (state, action) => {
        console.log('Delete Subservice Rejected');
        state.loading = false;
        updateStatus(state, '');
      });


           //single business

           builder.addCase(getBusinessSubservices.pending, state => {
            // console.log('Pending');
             state.loading = true;
           });
           builder.addCase(getBusinessSubservices.fulfilled, (state, action) => {
             
             if (action.payload.status) {
               state.subservices = action.payload.data.sub_services;
             }
             state.loading = false;
           });
           builder.addCase(getBusinessSubservices.rejected, (state, action) => {
             console.log('Rejected');
             console.log(action.error);
             state.loading = false;
           });
    

    },
  });
  
  export const { clearMessage } = ServiceSlice.actions;
  export const { clearSubServiceByService } = ServiceSlice.actions;
  
  export default ServiceSlice.reducer;