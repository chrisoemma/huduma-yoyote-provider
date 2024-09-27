import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_URL } from '../../utils/config';
import * as RootNavigation from '../../navigation/RootNavigation';
import { authHeader } from '../../utils/auth-header';

export const getSubserviceByService = createAsyncThunk(
  'subservices/getSubserviceByService',
  async ({ serviceId }: any) => {

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
  async ({ providerId, serviceId }: any) => {

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
  async ({ data, providerId, businessId }: any) => {
    const response = await fetch(`${API_URL}/businesses/add_subservice/${providerId}/${businessId}`, {
      method: 'POST',
   
      body: data,
    });
    return (await response.json())
  },
);


export const deleteSubService = createAsyncThunk(
  'subservices/deleteSubService',
  async ({ providerId, id, type, providerList }: any) => {
    try {

      const header: any = await authHeader();
      const response = await fetch(`${API_URL}/businesses/delete_provider_sub_service/${providerId}/${id}/${type}/${providerList}`, {
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


export const updateSubService = createAsyncThunk(
  'businesses/updateSubService',
  async ({ data, id }: any) => {


    const response = await fetch(`${API_URL}/sub_services/update_mobile_sub_service/${id}`, {
      method: 'POST',
      body: data,
    });
    return (await response.json());
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
    subservices: [],
    providerSubServices: [],
    subServiceByService: [],
    subService: [],
    loading: false,
  },
  reducers: {
    clearMessage(state: any) {
      state.status = null;
    },
    clearSubServiceByService: (state) => {
      state.subServiceByService = [];
    },
    setServiceApproval: (state, action) => {
      const updatedSubservice =action.payload;
      const subserviceIndex = state.providerSubServices.findIndex(
        (subService) => subService.id === updatedSubservice.id
      );

      if (subserviceIndex !== -1) {
        state.providerSubServices = [
          ...state.providerSubServices.slice(0, subserviceIndex),
          { ...state.providerSubServices[subserviceIndex], status: updatedSubservice.status },
          ...state.providerSubServices.slice(subserviceIndex + 1)
        ];
      }
    }

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

      if (action.payload.status) {
        state.subservices = [...action.payload.data.sub_services];
        state.providerSubServices = [...action.payload.data.provider_sub_services];
      }
      state.loading = false
      updateStatus(state, '');

    });
    builder.addCase(createSubService.rejected, (state, action) => {
      console.log('Rejected');
      state.loading = false;
      updateStatus(state, '');
    });

    builder.addCase(deleteSubService.pending, (state) => {
      console.log('Delete Subservice Pending');
      state.loading = true;
      updateStatus(state, '');
    });

    builder.addCase(deleteSubService.fulfilled, (state, action) => {
      // console.log('Delete Subservice Fulfilled', action.payload);

      if ( action.payload && action.payload.status) {
        const deletedSubServiceId = action.payload.data.subService.id;
             if(action.payload.data.type=='subService'){
              state.subservices = state.subservices.filter((subservice) => subservice.id !== deletedSubServiceId);
             }else{
              state.providerSubServices= state.providerSubServices.filter((subservice) => subservice.id !== deletedSubServiceId);
             }
       
      }
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
        state.providerSubServices = action.payload.data.provider_sub_services;
      }
      state.loading = false;
    });

    builder.addCase(getBusinessSubservices.rejected, (state, action) => {
      console.log('Rejected');
      console.log(action.error);
      state.loading = false;
    });
    ///
    builder.addCase(updateSubService.pending, (state) => {
      state.loading = true;
      updateStatus(state, '');
    });

    builder.addCase(updateSubService.fulfilled, (state, action) => {

      const updatedSubService = action.payload.data.sub_service;
      const updatedProviderSubService = action.payload.data.provider_sub_service;

      if (updatedSubService) {
        const subServiceIndex = state.subservices.findIndex((subService) => subService.id === updatedSubService.id);

        if (subServiceIndex !== -1) {
          // Update the task in the array immutably

          state.subservices = [
            ...state.subservices.slice(0, subServiceIndex),
            updatedSubService,
            ...state.subservices.slice(subServiceIndex + 1),
          ];
        }

      } else {
        const providerSubServiceIndex = state.providerSubServices.findIndex((providerSubService) => providerSubService.id === updatedProviderSubService.id);

        if (providerSubServiceIndex !== -1) {
          // Update the task in the array immutably

          state.providerSubServices = [
            ...state.providerSubServices.slice(0, providerSubServiceIndex),
            updatedSubService,
            ...state.providerSubServices.slice(providerSubServiceIndex + 1),
          ];
        }
      }
      state.loading = false;
      updateStatus(state, '');
    });

    builder.addCase(updateSubService.rejected, (state, action) => {
      console.log('Update Business Rejected');
      state.loading = false;
      updateStatus(state, '');
    });
  },
});

export const { clearSubServiceByService, setServiceApproval, clearMessage } = ServiceSlice.actions;

export default ServiceSlice.reducer;