import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_URL } from '../../utils/config';
import { clearNotifications } from '../Notifications/NotificationProviderSlice';
import { authHeader } from '../../utils/auth-header';

interface User {
  id: number;
  phone: string;
  name: string;
  nida: string;

}

interface UserData {
  status: boolean;
  user: User;
  token: string;
  config: Object;
}

interface UserLoginDTO {
  phone: string;
  password: string;
}

interface UserRegisterDTO {
  name: string;
  phone: string;
  password: string;
  nida: string;
}

interface PhoneVerificationDTO {
  user_id: string;
  code: string;
}

interface ForgotPasswordDTO {
  phone: string;
}

interface ResetPasswordDTO {
  phone: string;
  code: string;
  password: string;
}

export const userLogin = createAsyncThunk(
  'users/userLogin',
  async (data: UserLoginDTO) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return (await response.json()) as UserData;
  },
);


export const resendOTP = createAsyncThunk(
  'users/resendOTP',
  async (data: PhoneVerificationDTO) => {
    const response = await fetch(`${API_URL}/auth/resendOTP`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return (await response.json()) as UserData;
  },
);


export const updateProfile = createAsyncThunk(
  'users/updateProfile',
  async ({ data, userId }: any) => {
    try {
      console.log('user', userId);
      const response = await fetch(`${API_URL}/users/change_profile_picture/${userId}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      return await response.json();
    } catch (error) {
      // Handle the error gracefully, e.g., log the error and return an appropriate response
      console.error('Error in updateProviderInfo:', error);
      throw error; // Rethrow the error to be caught by Redux Toolkit
    }
  }
);




export const getUserData = createAsyncThunk(
  'users/getUserData',
  async (userId,appType) => {
    let header: any = await authHeader();
    const response = await fetch(`${API_URL}/users/getUserData/${userId}/${appType}`, {
      method: 'GET',
      headers: header,
    });
    return (await response.json()) as any;
  },
);


export const postUserDeviceToken = createAsyncThunk(
  'users/postUserDeviceToken',
  async ({ userId, data }:any) => {
    // console.log('user device token sent',deviceToken);
    const response = await fetch(`${API_URL}/users/device_token/${userId}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
);


export const updateProviderInfo = createAsyncThunk(
  'users/updateProviderInfo',
  async ({data, userType,userId }: any) => {
    try {
      
      const response = await fetch(`${API_URL}/users/update_account/${userType}/${userId}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Request failed: ${errorData.message}`);
      }

      return await response.json();
    } catch (error) {
      // Handle the error gracefully, e.g., log the error and return an appropriate response
      console.error('Error in updateProviderInfo:', error);
      throw error; // Rethrow the error to be caught by Redux Toolkit
    }
  }
);



export const userRegiter = createAsyncThunk(
  'users/userRegister',
  async (data: UserRegisterDTO) => {
    console.log('data from useregister', data)
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return (await response.json()) as UserData;
  },
);


export const multiRegister = createAsyncThunk(
  'users/multiRegister',
  async ({data,userId}) => {
     
    const response = await fetch(`${API_URL}/auth/multiaccount_register/${userId}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return (await response.json()) as UserData;
  },
);

export const userVerify = createAsyncThunk(
  'users/userVerify',
  async (data: PhoneVerificationDTO) => {
    const response = await fetch(`${API_URL}/auth/verify-phone`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return (await response.json()) as UserData;
  },
);

export const forgotPassword = createAsyncThunk(
  'users/forgotPassword',
  async (data: ForgotPasswordDTO) => {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return (await response.json()) as any;
  },
);



export const findNumber = createAsyncThunk(
  'users/findNumber',
  async (data: findNumberDTO) => {
    const response = await fetch(`${API_URL}/auth/find_number`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return (await response.json()) as any;
  },
);

export const resetPassword = createAsyncThunk(
  'users/resetPassword',
  async (data: ResetPasswordDTO) => {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return (await response.json()) as UserData;
  },
);


export const multiAccountByRegister = createAsyncThunk(
  'users/multiAccountByRegister',
  async (data) => {
    const response = await fetch(`${API_URL}/auth/multiaccount_register_password`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return (await response.json());
  },
);


export const createAccountPassword = createAsyncThunk(
  'users/createAccountPassword',
  async (data: createAccountPasswordDTO) => {
    const response = await fetch(`${API_URL}/auth/create-account-password`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return (await response.json()) as UserData;
  },
);


export const postUserOnlineStatus = createAsyncThunk(
  'users/postUserOnlineStatus',
  async ({userId, data}: any) => {
      const response = await fetch(`${API_URL}/users/update_user_online_status/${userId}`, {
          method: 'PUT',
          headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
      });
      return (await response.json());
  },
);


export const changePassword = createAsyncThunk(
  'users/changePassword',
  async ({ data, userId }: any) => {
    const response = await fetch(`${API_URL}/auth/change_password/${userId}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return (await response.json()) as UserData;
  },
);

export const userLogoutThunk = createAsyncThunk(
  'users/userLogoutThunk',
  async (_, { dispatch }) => {
    dispatch(clearNotifications());
    return;
  }
);

function logout(state: any) {
  console.log('::: USER LOGOUT CALLED :::');
  state.user = {};
  state.residence={};
}

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

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: {} as UserData,
    config: {},
    residence:{},
    loading: false,
    isOnline: false,
    deviceToken:'',
    isFirstTimeUser:true,
    status: '',
  },
  reducers: {
    userLogout(state: any) {
      logout(state);
    },
    clearMessage(state: any) {
      state.status = null;
    },
    setFirstTime: (state, action) => {
      state.isFirstTimeUser = action.payload;
    },
    setUserOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    // setUserAccountStatus:(state,action)=>{
    //   state.user.status=action.payload.userStatus
    //   state.user.provider.status=action.payload.modalStatus
    // },
    setUserSubcriptionStatus:(state,action)=>{
      state.user.provider.subscription_status=action.payload
    },

    setChangeProfession: (state, action) => {
      const { pendingProfession, profession, status } = action.payload;  // Adding status to payload
    

      console.log('action payload',action.payload);
      if (state.user.provider) {
        // Handle pending profession
        state.user.provider.pending_profession = pendingProfession || null;  // Set to null if pending profession is missing
    
        // Handle approved profession
        if (profession) {
          state.user.provider.designation = profession;
        }
    
        // Update profession_change_status based on status (approved or rejected)
        state.user.provider.profession_change_status = status || 'pending';  // Default to 'pending' if no status is provided
      }
    },
    
    logoutOtherDevice(state:any){
      logout(state);
    },
    setUserChanges: (state, action) => {
      if (Object.keys(action.payload).length > 0) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
      }
    },

    changeNidaStatus: (state, action) => {
      const latestStatus = state?.user?.provider.nida_statuses[state?.user?.provider?.nida_statuses?.length - 1];
      if (latestStatus) {
        latestStatus.status = action.payload;
      }
    },

    updateProviderChanges: (state, action) => {
      if (Object.keys(action.payload).length > 0) {
        state.user.provider = {
          ...state.user.provider,
          ...action.payload,
        };
      }
    },
  },
  extraReducers: builder => {
    //LOGIN
    builder.addCase(userLogin.pending, state => {
      console.log('Pending');
      updateStatus(state, '');
      state.loading = true;
    });
    builder.addCase(userLogin.fulfilled, (state, action) => {
    //  console.log('Fulfilled case');
     // console.log('payload dataaaa',action.payload.user);

      
      if (action.payload.status) {
        state.user = action.payload.user as any;
        state.user.token = action.payload.token;
        state.residence=action.payload.location;
        state.config = action.payload.config;
        AsyncStorage.setItem('token', action.payload.token);
        updateStatus(state, '');
      } else {
        updateStatus(state, action.payload);
      }

      state.loading = false;
    });
    builder.addCase(userLogin.rejected, (state, action) => {
      console.log('Rejected');
      console.log(action.error);
      updateStatus(state, 'Something went wrong, please try again later');
      state.loading = false;
    });


        //DevicToken
        builder.addCase(postUserDeviceToken.pending, state => {
          state.loading = true;
        });
        builder.addCase(postUserDeviceToken.fulfilled, (state, action) => {
          if (action.payload && action.payload.status) {
            state.deviceToken = action.payload.data.token;
          }
          state.loading = false;
        });
        builder.addCase(postUserDeviceToken.rejected, (state, action) => {
          console.log('Rejected');
          console.log(action.error);
          state.loading = false;
        })

    //REGISTER
    builder.addCase(userRegiter.pending, state => {
      console.log('Pending');
      state.loading = true;
      updateStatus(state, '');
    });
    builder.addCase(userRegiter.fulfilled, (state, action) => {
      console.log('Fulfilled case122');
      console.log('Action payload data', action.payload);

      state.loading = false;
      updateStatus(state, '');

      if (action.payload.status) {
        state.user = action.payload.user as any;
        state.config = action.payload.config;
        updateStatus(state, '');
      } else {
        updateStatus(state, action.payload);
      }
    });
    builder.addCase(userRegiter.rejected, (state, action) => {
      console.log('Rejected');
      console.log(action.error);
      state.loading = false;
      updateStatus(state, '');
    });




       //Multi account  by register

       builder.addCase(multiAccountByRegister.pending, state => {
        console.log('Pending');
        state.loading = true;
        updateStatus(state, '');
      });
      builder.addCase(multiAccountByRegister.fulfilled, (state, action) => {
  
        state.loading = false;
        updateStatus(state, '');
  
        if (action.payload.status) {
          state.user = action.payload.user as any;
          updateStatus(state, '');
        } else {
          updateStatus(state, action.payload);
        }
      });
      builder.addCase(multiAccountByRegister.rejected, (state, action) => {
        console.log('Rejected');
        console.log(action.error);
        state.loading = false;
        updateStatus(state, '');
      });





        //get user Data

    builder.addCase(getUserData.pending, state => {
      console.log('Pending');
      updateStatus(state, '');
      state.loading = true;
    });
    builder.addCase(getUserData.fulfilled, (state, action) => {
      //console.log('Fulfilled sapnaaa');
      console.log(action.payload?.data?.user);

      if (action.payload.status){
        state.user = {
          ...state.user,
          ...action.payload.data.user,
        };
  
        state.residence={
          ...state.residence,
          ...action.payload.data.location
         }
  
        if (action.payload.data.token) {
          state.user.token = action.payload.data.token;
        }
      }

      state.loading = false;
    });
    builder.addCase(getUserData.rejected, (state, action) => {
      console.log('Rejected');
      console.log(action.error);
      updateStatus(state, 'Something went wrong, please try again later');
      state.loading = false;
    });


        //RESEND OTP
        builder.addCase(resendOTP.pending, state => {
          state.loading = true;
          updateStatus(state, '');
        });
        builder.addCase(resendOTP.fulfilled, (state, action) => {
           
          if (action.payload.status) {
            updateStatus(state, '');
          } else {
            updateStatus(state, '');
          }
          state.loading = false;
          
        });
        builder.addCase(resendOTP.rejected, (state, action) => {
          updateStatus(state, '');
          state.loading = false;
        });

    //multi account 


    builder.addCase(multiRegister.pending, state => {
      console.log('Pending');
      state.loading = true;
      updateStatus(state, '');
    });
    builder.addCase(multiRegister.fulfilled, (state, action) => {

      state.loading = false;
      updateStatus(state, '');

      if (action.payload.status) {
        state.user = action.payload.user as any;
        state.user.token = action.payload.token;
        AsyncStorage.setItem('token', action.payload.token);
        updateStatus(state, '');
      } else {
        updateStatus(state, action.payload);
      }
    });
    builder.addCase(multiRegister.rejected, (state, action) => {
      console.log('Rejected');
      console.log(action.error);
      state.loading = false;
      updateStatus(state, '');
    });

    //VERIFY
    builder.addCase(userVerify.pending, state => {
      console.log('Pending');
      state.loading = true;
      updateStatus(state, '');
    });
    builder.addCase(userVerify.fulfilled, (state, action) => {
      console.log('Fulfilled case');
      console.log(action.payload);

      state.loading = false;
      updateStatus(state, '');

      if (action.payload.status && action.payload.token) {
        state.user.token = action.payload.token as any;
        updateStatus(state, '');
      } else {
        updateStatus(state, action.payload);
      }
    });
    builder.addCase(userVerify.rejected, (state, action) => {
      console.log('Rejected');
      console.log(action.error);
      state.loading = false;
      updateStatus(state, '');
    });

    //FORGOT PASSWORD
    builder.addCase(forgotPassword.pending, state => {
      console.log('Pending');
      state.loading = true;
      updateStatus(state, '');
    });
    builder.addCase(forgotPassword.fulfilled, (state, action) => {
      console.log('Fulfilled case');
      console.log(action.payload);

      state.loading = false;
      updateStatus(state, '');

      if (action.payload.status) {
        state.user = action.payload.user;
        updateStatus(state, '');
      } else {
        updateStatus(state, action.payload);
      }
    });
    builder.addCase(forgotPassword.rejected, (state, action) => {
      console.log('Rejected');
      console.log(action.error);
      state.loading = false;
      updateStatus(state, '');
    });

    //RESET PASSWORD
    builder.addCase(resetPassword.pending, state => {
      console.log('Pending');
      state.loading = true;
      updateStatus(state, '');
    });
    builder.addCase(resetPassword.fulfilled, (state, action) => {
      console.log('Fulfilled case');
      console.log(action.payload);

      state.loading = false;
      updateStatus(state, '');

      if (action.payload.status) {
        state.user.token = action.payload.token as any;
        updateStatus(state, '');
      } else {
        updateStatus(state, action.payload);
      }
    });
    builder.addCase(resetPassword.rejected, (state, action) => {
      console.log('Rejected');
      console.log(action.error);
      state.loading = false;
      updateStatus(state, '');
    });




    //create Account Password

    builder.addCase(createAccountPassword.pending, state => {
      console.log('Pending');
      state.loading = true;
      updateStatus(state, '');
    });
    builder.addCase(createAccountPassword.fulfilled, (state, action) => {
      console.log('Fulfilled case');
      console.log(action.payload);

      state.loading = false;
      updateStatus(state, '');

      if (action.payload.status) {
        state.user = action.payload.user as any;
        state.user.token = action.payload.token;
        AsyncStorage.setItem('token', action.payload.token);
        updateStatus(state, '');
      } else {
        updateStatus(state, action.payload);
      }
    });
    builder.addCase(createAccountPassword.rejected, (state, action) => {
      console.log('Rejected');
      console.log(action.error);
      state.loading = false;
      updateStatus(state, '');
    });


    //Change password

    builder.addCase(changePassword.pending, state => {
      console.log('Pending');
      state.loading = true;
      updateStatus(state, '');
    });
    builder.addCase(changePassword.fulfilled, (state, action) => {
      console.log('Fulfilled case');
      console.log(action.payload);

      state.loading = false;
      updateStatus(state, '');

      if (action.payload.status) {
        state.user.token = action.payload.token as any;
        updateStatus(state, '');
      } else {
        updateStatus(state, action.payload);
      }
    });
    builder.addCase(changePassword.rejected, (state, action) => {
      console.log('Rejected');
      console.log(action.error);
      state.loading = false;
      updateStatus(state, '');
    });

    builder.addCase(updateProviderInfo.pending, (state) => {
      console.log('Update Provider Pending');
      state.loading = true;
      updateStatus(state, '');
    });
    builder.addCase(updateProviderInfo.fulfilled, (state, action) => {

     // console.log('dataaaa errorr',action.payload)

      if (action.payload.status) {
      state.user = {
        ...state.user,
        ...action.payload.data.user,
      };
      state.residence={
       ...state.residence,
       ...action.payload.data.location
      }

      // Update token if it's received in the response
      if (action.payload.data.token) {
        state.user.token = action.payload.data.token;
      }

    }
      state.loading = false;
      updateStatus(state, '');
    });
    builder.addCase(updateProviderInfo.rejected, (state, action) => {
      console.log('Rejected');
      state.loading = false;
      updateStatus(state, '');
    });


    //

    builder.addCase(updateProfile.pending, (state) => {
      console.log('Update Provider Pending');
      state.loading = true;
      updateStatus(state, '');
    });

    builder.addCase(updateProfile.fulfilled, (state, action) => {
      console.log('Update Task Fulfilled');
      console.log('dataaa1234', action.payload.data)

      state.user = {
        ...state.user,
        ...action.payload.data.user,
      };

      // Update token if it's received in the response
      if (action.payload.data.token) {
        state.user.token = action.payload.data.token;
      }

      state.loading = false;
      updateStatus(state, '');
    });
    builder.addCase(updateProfile.rejected, (state, action) => {
      console.log('Rejected');
      state.loading = false;
      updateStatus(state, '');
    });


    builder.addCase(postUserOnlineStatus.pending, state => {
      state.loading = true;
    });
    builder.addCase(postUserOnlineStatus.fulfilled, (state, action) => {
  
      if (action.payload.status) {
        state.isOnline = action.payload.data.isOnline;
      }
      state.loading = false;
    });
    builder.addCase(postUserOnlineStatus.rejected, (state, action) => {
      console.log('Rejected');
      state.loading = false;
    });



    //findNumber

    builder.addCase(findNumber.pending, state => {
      console.log('Pending');
      state.loading = true;
      updateStatus(state, '');
    });
    builder.addCase(findNumber.fulfilled, (state, action) => {
      console.log('Fulfilled case');
      console.log(action.payload);

      state.loading = false;
      updateStatus(state, '');

      if (action.payload.status) {
        state.user = action.payload.user;
        updateStatus(state, '');
      } else {
        updateStatus(state, action.payload);
      }
    });
    builder.addCase(findNumber.rejected, (state, action) => {
      console.log('Rejected');
      console.log(action.error);
      state.loading = false;
      updateStatus(state, '');
    });

    builder.addCase(userLogoutThunk.fulfilled, (state) => {
      logout(state);
    });
  },
});

export const { setChangeProfession,userLogout,changeNidaStatus,logoutOtherDevice,setUserChanges,updateProviderChanges, clearMessage,setFirstTime,setUserOnlineStatus,setUserAccountStatus,setUserSubcriptionStatus } = userSlice.actions;

export default userSlice.reducer;
