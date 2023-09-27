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


  const AccountSlice = createSlice({
    name: 'account',
    initialState: {
      account:{},
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
    },
  });
  
  export const { clearMessage } = AccountSlice.actions;
  
  export default AccountSlice.reducer;