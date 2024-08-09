import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_URL } from '../../utils/config';
import * as RootNavigation from '../../navigation/RootNavigation';
import { authHeader } from '../../utils/auth-header';

export const getAccount = createAsyncThunk(
    'requests/getAccount',
    async (userId) => {
      let header: any = await authHeader();
      const response = await fetch(`${API_URL}/users/provider/${userId}`, {
        method: 'GET',
        headers: header,
      });
      return (await response.json()) as any;
    },
  );


  
  export const getClientLastLocation = createAsyncThunk(
    'requests/getClientLastLocation',
    async (id) => {
      let header: any = await authHeader();
      const response = await fetch(`${API_URL}/clients/client_last_location/${id}`, {
        method: 'GET',
        headers: header,
      });
      return (await response.json()) as any;
    },
  );


  const AccountSlice = createSlice({
    name: 'account',
    initialState: {
      account:{},
      clientLastLocation:{},
      loading: false,
    },
    reducers: {
      clearMessage(state: any) {
        state.status = null;
      },
      
    },
    extraReducers: builder => {
       
        //categories
      builder.addCase(getAccount.pending, state => {
       // console.log('Pending');
        state.loading = true;
      });
      builder.addCase(getAccount.fulfilled, (state, action) => {
  
        if (action.payload.status) {
          state.account = action.payload.data.account;
        }
        state.loading = false;
      });
      builder.addCase(getAccount.rejected, (state, action) => {
        console.log('Rejected');
        console.log(action.error);
        state.loading = false;
      });

      //get

      builder.addCase(getClientLastLocation.pending, state => {
        // console.log('Pending');
         state.loading = true;
       });
       builder.addCase(getClientLastLocation.fulfilled, (state, action) => {
       // console.log('Fulfilled case');
        // console.log(action.payload);
         if (action.payload.status) {
           state.clientLastLocation = action.payload.data;
         }
         state.loading = false;
       });
       builder.addCase(getClientLastLocation.rejected, (state, action) => {
         console.log('Rejected');
         console.log(action.error);
 
         state.loading = false;
       });

    },
  });
  
  export const { clearMessage } = AccountSlice.actions;
  
  export default AccountSlice.reducer;