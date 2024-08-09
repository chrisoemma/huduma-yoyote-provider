import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_URL } from '../../utils/config';
import * as RootNavigation from '../../navigation/RootNavigation';
import { authHeader } from '../../utils/auth-header';

export const getCategories = createAsyncThunk(
    'categories/categories',
    async () => {
      let header: any = await authHeader();
      const response = await fetch(`${API_URL}/categories/`, {
        method: 'GET',
        headers: header,
      });
      return (await response.json()) as any;
    },
  );




//   export const getBusiness = createAsyncThunk(
//     'businesses/getBusiness',
//     async ({providerId,serviceId}:any) => {
//       let header: any = await authHeader();
//       const response = await fetch(`${API_URL}/providers/sub_services/${providerId}/${serviceId}`, {
//         method: 'GET',
//         headers: header,
//       });
//       return (await response.json()) as any;
//     },
//   );


  const CategorySlice = createSlice({
    name: 'categories',
    initialState: {
        categories:[],
      loading: false,
    },
    reducers: {
      clearMessage(state: any) {
        state.status = null;
      },
      setCategoryChanges(state,action){
       // state.categories=
      }
    },
    extraReducers: builder => {
       
        //businesses
      builder.addCase(getCategories.pending, state => {
       // console.log('Pending');
        state.loading = true;
      });
      builder.addCase(getCategories.fulfilled, (state, action) => {
  
          
        if (action.payload.status) {
          state.categories = action.payload.data.categories;
        }
        state.loading = false;
      });
      builder.addCase(getCategories.rejected, (state, action) => {
        console.log('Rejected');
        console.log(action.error);
        state.loading = false;
      });


       //single business

    //    builder.addCase(getBusiness.pending, state => {
    //     // console.log('Pending');
    //      state.loading = true;
    //    });
    //    builder.addCase(getBusiness.fulfilled, (state, action) => {
         
    //      if (action.payload.status) {
    //        state.business = action.payload.data.sub_services;
    //      }
    //      state.loading = false;
    //    });
    //    builder.addCase(getBusiness.rejected, (state, action) => {
    //      console.log('Rejected');
    //      console.log(action.error);
    //      state.loading = false;
    //    });
    },
  });
  
  export const { clearMessage } = CategorySlice.actions;
  
  export default CategorySlice.reducer;