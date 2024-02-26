import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_URL } from '../../utils/config';
import { authHeader } from '../../utils/auth-header';

export const getProviderRequestVsSubservice = createAsyncThunk(
    'charts/getProviderRequestVsSubservice',
    async ({providerId}:any) => {
      
      let header: any = await authHeader();
      const response = await fetch(`${API_URL}/providers/service_requests/${providerId}`, {
        method: 'GET',
        headers: header,
      });
      return (await response.json()) as any;
    },
  );


  export const getEmployeeTranferRequests = createAsyncThunk(
    'charts/getEmployeeTranferRequests',
    async (employeeId:any) => {
      
      let header: any = await authHeader();
      const response = await fetch(`${API_URL}/employees/service_requests/${employeeId}`, {
        method: 'GET',
        headers: header,
      });
      return (await response.json()) as any;
    },
  );


  const ChartSlice = createSlice({
    name: 'charts',
    initialState: {
        providerServiceRequests:[],
        employeeTranferedRequests:[],
        loading: false,
    },
    reducers: {
      clearMessage(state: any) {
        state.status = null;
      },
    },
    extraReducers: builder => {
       
      builder.addCase(getProviderRequestVsSubservice.pending, state => {
        state.loading = true;
      });
      builder.addCase(getProviderRequestVsSubservice.fulfilled, (state, action) => {

        console.log('full fiels',action.payload.data.requests_vs_sub_services);
        if (action.payload.status) {
          state.providerServiceRequests = action.payload.data.requests_vs_sub_services;
        }
        state.loading = false;
      });
      builder.addCase(getProviderRequestVsSubservice.rejected, (state, action) => {
        console.log('Rejected');
        console.log(action.error);
        state.loading = false;
      });

      //Employees

      builder.addCase(getEmployeeTranferRequests.pending, state => {
        state.loading = true;
      });
      builder.addCase(getEmployeeTranferRequests.fulfilled, (state, action) => {
        if (action.payload.status) {
          state.employeeTranferedRequests = action.payload.data.requests_vs_sub_services;
        }
        state.loading = false;
      });
      builder.addCase(getEmployeeTranferRequests.rejected, (state, action) => {
        console.log('Rejected');
        console.log(action.error);
        state.loading = false;
      });
    },
       
  });



  export const { clearMessage } = ChartSlice.actions;
  
  export default ChartSlice.reducer;