import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LanguageState {
  selectedLanguageCode: string;
}

const initialState: LanguageState = {
  selectedLanguageCode: 'en',
};

const languageSlice = createSlice({
  name: 'language', // The name of the slice
  initialState,     // The initial state of the slice
  reducers: {
    setLanguageCode: (state, action: PayloadAction<string>) => {
      state.selectedLanguageCode = action.payload;
    },
  },
});

export const { setLanguageCode } = languageSlice.actions;

export default languageSlice.reducer;
