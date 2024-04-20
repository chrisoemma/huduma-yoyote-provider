import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_URL } from '../utils/config';
import { authHeader } from '../utils/auth-header';

export const getProfessions = createAsyncThunk(
    'professions/professions',
    async ({language}:any) => {
   
      let header: any = await authHeader();
      const response = await fetch(`${API_URL}/businesses/designations/${language}`, {
        method: 'GET',
        headers: header,
      });
      return (await response.json()) as any;
    },
  );






  const ProfessionsSlice = createSlice({
    name: 'professions',
    initialState: {
        professions:[],
      professionsLoading: false,
    },
    reducers: {
      clearMessage(state: any) {
        state.status = null;
      },
    },
    extraReducers: builder => {
       

      builder.addCase(getProfessions.pending, state => {
    
        state.professionsLoading = true;
      });
      builder.addCase(getProfessions.fulfilled, (state, action) => {
  
        if (action.payload.status) {
          state.professions = action.payload.data.designations;
        }
        state.professionsLoading = false;
      });
      builder.addCase(getProfessions.rejected, (state, action) => {
        console.log('Rejected');
        console.log(action.error);
        state.professionsLoading = false;
      });

    },
  });
  
  export const { clearMessage } = ProfessionsSlice.actions;
  
  export default ProfessionsSlice.reducer;