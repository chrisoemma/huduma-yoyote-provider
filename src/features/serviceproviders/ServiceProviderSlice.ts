import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_URL } from '../../utils/config';
import * as RootNavigation from './../../navigation/RootNavigation';
import { authHeader } from '../../utils/auth-header';

export const getBestProviders = createAsyncThunk(
    'services/bestProviders',
    async (id) => {
    
      let header: any = await authHeader();
      const response = await fetch(`${API_URL}/providers/best_providers/${id}`, {
        method: 'GET',
        headers: header,
      });
      return (await response.json()) as any;
    },
  );

  export const getNearProviders = createAsyncThunk(
    'services/nearProviders',
    async (id) => {
      let header: any = await authHeader();
      const response = await fetch(`${API_URL}/providers/near_me/${id}`, {
        method: 'GET',
        headers: header,
      });
      return (await response.json()) as any;
    },
  );


  export const getProviderDocumentToRegister = createAsyncThunk(
    'services/getProviderDocumentToRegister',
    async (id) => {
      let header: any = await authHeader();
      const response = await fetch(`${API_URL}/providers/provider_working_documents_by_type/${id}`, {
        method: 'GET',
        headers: header,
      });
      return (await response.json()) as any;
    },
  );


  export const getProviderSubServices = createAsyncThunk(
    'services/providerServiceInfo',
    async ({providerId,serviceId}) => {
      let header: any = await authHeader();
      const response = await fetch(`${API_URL}/providers/sub_services/${providerId}/${serviceId}`, {
        method: 'GET',
        headers: header,
      });
      return (await response.json()) as any;
    },
  );

  const ServiceProviderSlice = createSlice({
    name: 'providers',
    initialState: {
      bestProviders: [],
      nearProviders:[],
      subServices:[],
      documentForRegister:[],
      documentForBusiness:[],
      providerSubServices:[],
      loading: false,
    },
    reducers: {
      clearMessage(state: any) {
        state.status = null;
      },
    },
    extraReducers: builder => {
 
      builder.addCase(getBestProviders.pending, state => {
       // console.log('Pending');
        state.loading = true;
      });
      builder.addCase(getBestProviders.fulfilled, (state, action) => {
      // console.log('Fulfilled case');
      //  console.log(action.payload);
  
        if (action.payload.status) {
          state.bestProviders = action.payload.data.best_providers;
        }
        state.loading = false;
      });
      builder.addCase(getBestProviders.rejected, (state, action) => {
        console.log('Rejected');
        console.log(action.error);

        state.loading = false;
      });


      builder.addCase(getNearProviders.pending, state => {
        // console.log('Pending');
         state.loading = true;
       });
       builder.addCase(getNearProviders.fulfilled, (state, action) => {
       // console.log('Fulfilled case');
        // console.log(action.payload);
         if (action.payload.status) {
           state.nearProviders = action.payload.data.nearby_providers;
         }
         state.loading = false;
       });
       builder.addCase(getNearProviders.rejected, (state, action) => {
         console.log('Rejected');
         console.log(action.error);
 
         state.loading = false;
       });


       builder.addCase(getProviderSubServices.pending, state => {
        // console.log('Pending');
         state.loading = true;
       });
       builder.addCase(getProviderSubServices.fulfilled, (state, action) => {
  
          if (action.payload.status) {
           state.subServices = action.payload.data.sub_services;
           state.providerSubServices=action.payload.data.provider_sub_services;
          }
          state.loading = false;
        });
       builder.addCase(getProviderSubServices.rejected, (state, action) => {
         console.log('Rejected');
         console.log(action.error);
 
         state.loading = false;
       });



       //data 

       builder.addCase(getProviderDocumentToRegister.pending, state => {
        // console.log('Pending');
         state.loading = true;
       });
       builder.addCase(getProviderDocumentToRegister.fulfilled, (state, action) => {
  
          if (action.payload.status) {
          // state.subServices = action.payload.data.sub_services;
           state.documentForRegister=action.payload.data.documents.registration;
           state.documentForBusiness=action.payload.data.documents.business;
          }
          state.loading = false;
        });
       builder.addCase(getProviderDocumentToRegister.rejected, (state, action) => {
         console.log('Rejected');
         console.log(action.error);
 
         state.loading = false;
       });
    },
  });
  
  export const { clearMessage } = ServiceProviderSlice.actions;
  
  export default ServiceProviderSlice.reducer;