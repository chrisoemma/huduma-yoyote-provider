import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_URL } from '../../utils/config';
import * as RootNavigation from './../../navigation/RootNavigation';
import { authHeader } from '../../utils/auth-header';

export const getActiveRequests = createAsyncThunk(
    'requests/getActiveRequests',
    async (id) => {
     
      let header: any = await authHeader();
      const response = await fetch(`${API_URL}/requests/on_progress/provider/${id}`, {
        method: 'GET',
        headers: header,
      });
      return (await response.json()) as any;
    },
  );

  export const getPastRequests = createAsyncThunk(
    'requests/getPastRequests',
    async (id) => {
      let header: any = await authHeader();
      const response = await fetch(`${API_URL}/requests/past/provider/${id}`, {
        method: 'GET',
        headers: header,
      });
      return (await response.json()) as any;
    },
  );

  export const getEmployeeActiveRequests = createAsyncThunk(
    'requests/getEmployeeActiveRequests',
    async (employeeId) => {
     
      let header: any = await authHeader();
      const response = await fetch(`${API_URL}/requests/active/employee/${employeeId}`, {
        method: 'GET',
        headers: header,
      });
      return (await response.json()) as any;
    },
  );


  export const getEmployeePastRequests = createAsyncThunk(
    'requests/getEmployeePastRequests',
    async (employeeId) => {
     
      let header: any = await authHeader();
      const response = await fetch(`${API_URL}/requests/past/employee/${employeeId}`, {
        method: 'GET',
        headers: header,
      });
      return (await response.json()) as any;
    },
  );

  export const transferRequest = createAsyncThunk(
    'requests/transferRequest',
    async ({data,requestId}:any) => {
      console.log('data5678',data);
      console.log('requestsId',requestId)
      const response = await fetch(`${API_URL}/requests/transfer_request/${requestId}`, {
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


  export const updateRequestStatus = createAsyncThunk(
    'requests/updateRequestStatus',
    async ({ data, requestId }: any) => {

            console.log('dataaa',data)
            console.log('request_id',requestId);
         
        const response = await fetch(`${API_URL}/requests/update_status/${requestId}`, {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return (await response.json());
    });


    function updateStatus(state: any, status: any) {
      if (status === '' || status === null) {
          state.status = '';
          return;
      }
  
      if (status.error) {
          state.status = status.error;
          return;
      }
  
      state.status = 'Request failed. Please try again.';
      return;
  }

  const RequestSlice = createSlice({
    name: 'requests',
    initialState: {
      activeRequests: [],
      employeeActiveRequests:[],
      employeePastRequests:[],
      pastRequests:[],
      loading: false,
    },
    reducers: {
      clearMessage(state: any) {
        state.status = null;
      },
      setRequestStatus:(state,action)=>{
    
        const updatedRequest = action.payload;
        const requestIndex = state.activeRequests.findIndex(
          (request) => request.id === updatedRequest.id
        );
    
        if (requestIndex !== -1) {
          if (['Requested', 'Accepted', 'Confirmed'].includes(status)) {
            // Update the request in activeRequests
            state.activeRequests = [
              ...state.activeRequests.slice(0, requestIndex),
              updatedRequest,
              ...state.activeRequests.slice(requestIndex + 1),
            ];
          } else if (['Cancelled', 'Rejected', 'Completed'].includes(status)) {
            // Remove the request from activeRequests
            state.activeRequests = [
              ...state.activeRequests.slice(0, requestIndex),
              ...state.activeRequests.slice(requestIndex + 1),
            ];
            state.pastRequests = [...state.pastRequests, updatedRequest];
          }
        }
    
        },
    },
    extraReducers: builder => {
       
        //categories
      builder.addCase(getActiveRequests.pending, state => {
       // console.log('Pending');
        state.loading = true;
      });
      builder.addCase(getActiveRequests.fulfilled, (state, action) => {
  
        if (action.payload.status) {
          state.activeRequests = action.payload.data.requests;
        }
        state.loading = false;
      });
      builder.addCase(getActiveRequests.rejected, (state, action) => {
        console.log('Rejected');
        console.log(action.error);

        state.loading = false;
      });



      builder.addCase(getEmployeeActiveRequests.pending, state => {
        // console.log('Pending');
         state.loading = true;
       });
       builder.addCase(getEmployeeActiveRequests.fulfilled, (state, action) => {
   
         if (action.payload.status) {
           state.activeRequests = action.payload.data.requests;
         }
         state.loading = false;
       });
       builder.addCase(getEmployeeActiveRequests.rejected, (state, action) => {
         console.log('Rejected');
         console.log(action.error);
 
         state.loading = false;
       });


      builder.addCase(getPastRequests.pending, state => {
        // console.log('Pending');
         state.loading = true;
       });
       builder.addCase(getPastRequests.fulfilled, (state, action) => {
   
         if (action.payload.status) {
           state.pastRequests = action.payload.data.requests;
         }
         state.loading = false;
       });
       builder.addCase(getPastRequests.rejected, (state, action) => {
         console.log('Rejected');
         console.log(action.error);
 
         state.loading = false;
       });



       builder.addCase(getEmployeePastRequests.pending, state => {
        // console.log('Pending');
         state.loading = true;
       });
       builder.addCase(getEmployeePastRequests.fulfilled, (state, action) => {
   
         if (action.payload.status) {
           state.pastRequests = action.payload.data.requests;
         }
         state.loading = false;
       });
       builder.addCase(getEmployeePastRequests.rejected, (state, action) => {
         console.log('Rejected');
         console.log(action.error);
 
         state.loading = false;
       });


       builder.addCase(updateRequestStatus.pending, state => {
        // console.log('Pending');
         state.loading = true;
       });
       builder.addCase(updateRequestStatus.fulfilled, (state, action) => {
  
      
        const updatedRequest = action.payload.data.request;
        const status = updatedRequest.statuses[updatedRequest.statuses.length - 1].status;
      
        // Find the index of the updated request in activeRequests
        const requestIndex = state.activeRequests.findIndex(
          (request) => request.id === updatedRequest.id
        );
      
        if (requestIndex !== -1) {
          if (['Requested', 'Accepted', 'Confirmed'].includes(status)) {
            // Update the request in activeRequests
            state.activeRequests = [
              ...state.activeRequests.slice(0, requestIndex),
              updatedRequest,
              ...state.activeRequests.slice(requestIndex + 1),
            ];
          } else if (['Cancelled', 'Rejected', 'Completed'].includes(status)) {
            // Remove the request from activeRequests
            state.activeRequests = [
              ...state.activeRequests.slice(0, requestIndex),
              ...state.activeRequests.slice(requestIndex + 1),
            ];
      
            // Add the request to pastRequests
            state.pastRequests = [...state.pastRequests, updatedRequest];
          }
        }
      
        state.loading = false;
        updateStatus(state, '');
      });
    
      builder.addCase(updateRequestStatus.rejected, (state, action) => {
        console.log('Rejected');
        state.loading = false;
        updateStatus(state, '');
    });



    //transfer requests

    builder.addCase(transferRequest.pending, state => {
      // console.log('Pending');
       state.loading = true;
     });
     builder.addCase(transferRequest.fulfilled, (state, action) => {
    
      const updatedRequest = action.payload.data.request;
      const status = updatedRequest.statuses[updatedRequest.statuses.length - 1].status;
  
      //console.log('statttses',status);
    
      // Find the index of the updated request in activeRequests
      const requestIndex = state.activeRequests.findIndex(
        (request) => request.id === updatedRequest.id
      );
    
      if (requestIndex !== -1) {
        if (['Requested', 'Accepted', 'Confirmed'].includes(status)) {
          // Update the request in activeRequests
          state.activeRequests = [
            ...state.activeRequests.slice(0, requestIndex),
            updatedRequest,
            ...state.activeRequests.slice(requestIndex + 1),
          ];
        } else if (['Cancelled', 'Rejected', 'Completed'].includes(status)) {
          // Remove the request from activeRequests
          state.activeRequests = [
            ...state.activeRequests.slice(0, requestIndex),
            ...state.activeRequests.slice(requestIndex + 1),
          ];
    
          // Add the request to pastRequests
          state.pastRequests = [...state.pastRequests, updatedRequest];
        }
      }
    
      state.loading = false;
      updateStatus(state, '');
    });
  
    builder.addCase(transferRequest.rejected, (state, action) => {
      console.log('Rejected');
      state.loading = false;
      updateStatus(state, '');
  });

    },
  });
  
  export const { clearMessage,setRequestStatus } = RequestSlice.actions;
  
  export default RequestSlice.reducer;