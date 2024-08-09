import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_URL } from '../../utils/config';
import { authHeader } from '../../utils/auth-header';



  export const getRejectTemplate = createAsyncThunk(
    'feedbackTemplate/getRejectTemplate',
    async (context) => {
      let header: any = await authHeader();
      const response = await fetch(`${API_URL}/feedback_templates/provider_reject/${context}`, {
        method: 'GET',
        headers: header,
      });
      return (await response.json()) as any;
    },
  );

  const FeedbackTemplateSlice = createSlice({
    name: 'feedbackTemplate',
    initialState: {
      rejectTemplate:[],
      loading: false,
    },
    reducers: {
      clearMessage(state: any) {
        state.status = null;
      },
    },
    extraReducers: builder => {



      //Reject Template
      builder.addCase(getRejectTemplate.pending, state => {
        state.loading = true;
      });
      builder.addCase(getRejectTemplate.fulfilled, (state, action) => {

      
        if (action.payload.status) {
          state.rejectTemplate = action.payload.data.reject_template;
        }
        state.loading = false;
      });
      builder.addCase(getRejectTemplate.rejected, (state, action) => {
        console.log('Rejected');
        console.log(action.error);
        state.loading = false;
      });
    },
  });
  
  export const { clearMessage } = FeedbackTemplateSlice.actions;
  
  export default FeedbackTemplateSlice.reducer;