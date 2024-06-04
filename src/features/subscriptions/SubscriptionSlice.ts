import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_URL } from '../../utils/config';
import { authHeader } from '../../utils/auth-header';


export const getSubscriptions = createAsyncThunk(
    'subscriptions/getSubscriptions',
    async ({providerId}:any) => {
   
      let header: any = await authHeader();
      const response = await fetch(`${API_URL}/subscriptions/provider/${providerId}`, {
        method: 'GET',
        headers: header,
      });
      return (await response.json()) as any;
    },
  );


  export const paySubscription = createAsyncThunk(
    'subscriptions/paySubscription',
    async ({providerId}:any) => {
   
      let header: any = await authHeader();
      const response = await fetch(`${API_URL}/subscriptions/provider/mobile_subscription/${providerId}`, {
        method: 'POST',
        headers: header,
      });
      return (await response.json()) as any;
    },
  );






  const SubscriptionsSlice = createSlice({
    name: 'subscriptions',
    initialState: {
        subscriptions:[],
     loading: false,
    },
    reducers: {
      clearMessage(state: any) {
        state.status = null;
      },
    },
    extraReducers: builder => {
       

      builder.addCase(getSubscriptions.pending, state => {
    
        state.loading= true;
      });
      builder.addCase(getSubscriptions.fulfilled, (state, action) => {
  
        if (action.payload.status) {
          state.subscriptions = action.payload.data;
        }
        state.loading= false;
      });
      builder.addCase(getSubscriptions.rejected, (state, action) => {
        console.log('Rejected');
        console.log(action.error);
        state.loading= false;
      });

    },
  });
  
  export const { clearMessage } = SubscriptionsSlice.actions;
  
  export default SubscriptionsSlice.reducer;