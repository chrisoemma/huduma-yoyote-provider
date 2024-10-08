import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_URL } from '../../utils/config';
import * as RootNavigation from '../../navigation/RootNavigation';
import { authHeader } from '../../utils/auth-header';

export const getBusinesses = createAsyncThunk(
    'businesses/businesses',
    async ({providerId}:any) => {
      
      let header: any = await authHeader();
      const response = await fetch(`${API_URL}/businesses/provider_businesses/${providerId}`, {
        method: 'GET',
        headers: header,
      });
      return (await response.json()) as any;
    },
  );


  export const getDocuments = createAsyncThunk(
    'businesses/getDocuments',
    async ({providerId}:any) => {
      // console.log('documemnyddId',providerId);
      let header: any = await authHeader();
      const response = await fetch(`${API_URL}/providers/documents/${providerId}`, {
        method: 'GET',
        headers: header,
      });
      return (await response.json()) as any;
    },
  );

  export const getRegDocs = createAsyncThunk(
    'businesses/getRegDocs',
    async () => {
       
      let header: any = await authHeader();
      const response = await fetch(`${API_URL}/admin/working_documents`, {
        method: 'GET',
        headers: header,
      });
      return (await response.json()) as any;
    },
  );


  export const createBusiness = createAsyncThunk(
    'businesses/createBusiness',
    async (data) => {
      const response = await fetch(`${API_URL}/businesses`, {
        method: 'POST',
        // headers: {
        //   Accept: 'application/json',
        //   'Content-Type': 'application/json',
        // },
        body: data,
      });
      return (await response.json()) 
    },
  );
  
  export const updateBusiness = createAsyncThunk(
    'businesses/updateBusiness',
    async ({ data, businessId }: any) => {
        // console.log('businessId111', businessId);
        // console.log('dtaaaa',data);

      
        const response = await fetch(`${API_URL}/businesses/update_business/${businessId}`, {
            method: 'POST',
            // headers: {
            //     Accept: 'application/json',
            //     'Content-Type': 'application/json',
            // },
            body:data,
        });
        return (await response.json());
    }
);


  export const createDocument = createAsyncThunk(
    'businesses/createDocument',
    async ({data,providerId}:any) => {
    
      const response = await fetch(`${API_URL}/providers/documents/${providerId}`, {
        method: 'POST',
        // headers: {
        //   Accept: 'application/json',
        //   'Content-Type': 'application/json',
        // },
        body:data,
      });
      return (await response.json()) 
    },
  );


  function updateStatus(state: any, status: any) {
    if (status === '' || status === null) {
      state.status = '';
      return;
    }
  
    if (status.error) {
      state.status = status.error;
      return;
    }
  }



  export const deleteDocument = createAsyncThunk(
    'businesses/deleteDocument',
    async ({documentId}:any) => {
      try {
       
        const header: any = await authHeader();
        const response = await fetch(`${API_URL}/providers/documents/delete_document/${documentId}`, {
          method: 'DELETE',
          headers: header,
        });
  
        if (!response.status) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete document');
        }
  
        return (await response.json())
      } catch (error) {
        throw error;
      }
    }
  );



  export const deleteBusiness = createAsyncThunk(
    'businesses/deleteBusiness',
    async ({businessId}:any) => {
      try {
       
        const header: any = await authHeader();
        const response = await fetch(`${API_URL}/businesses/${businessId}`, {
          method: 'DELETE',
          headers: header,
        });
  
        if (!response.status) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete businesses');
        }
  
        return (await response.json())
      } catch (error) {
        throw error;
      }
    }
  );

  const BusinessSlice = createSlice({
    name: 'businesses',
    initialState: {
        businesses:[],
        documents:[],
        regDocs:[],
        document:{},
        business:[],
        createLoading:false,
        loading: false,
    },
    reducers: {
      clearMessage(state: any) {
        state.status = null;
      },
      changeDocStatus: (state, action) => {

        const { docId, docStatus } = action.payload;

        const document = state.documents.find(doc => doc.id === Number(docId));
        if (document) {
          document.status = docStatus;
        }
      }
    },
    extraReducers: builder => {
       
        //businesses
      builder.addCase(getBusinesses.pending, state => {
       // console.log('Pending');
        state.loading = true;
      });
      builder.addCase(getBusinesses.fulfilled, (state, action) => {
  
        if (action.payload.status) {
          state.businesses = action.payload.data.businesses;
        }
        state.loading = false;
      });
      builder.addCase(getBusinesses.rejected, (state, action) => {
        console.log('Rejected');
        console.log(action.error);
        state.loading = false;
      });


      //Documents

      builder.addCase(getDocuments.pending, state => {
        // console.log('Pending');
         state.loading = true;
       });
       builder.addCase(getDocuments.fulfilled, (state, action) => {
   
         if (action.payload.status) {
           state.documents = action.payload.data.documents;
         }
         state.loading = false;
       });
       builder.addCase(getDocuments.rejected, (state, action) => {
         console.log('Rejected');
         console.log(action.error);
         state.loading = false;
       });


             //get reg docs
       builder.addCase(getRegDocs.pending, state => {
        // console.log('Pending');
         state.loading = true;
       });
       builder.addCase(getRegDocs.fulfilled, (state, action) => {
   
         if (action.payload.status) {
           state.regDocs = action.payload.data.docs;
         }
         state.loading = false;
       });
       builder.addCase(getRegDocs.rejected, (state, action) => {
         console.log('Rejected');
         console.log(action.error);
         state.loading = false;
       });

       //create Business

    builder.addCase(createBusiness.pending, state => {
      console.log('Pending');
      state.loading = true;
      updateStatus(state, '');
    });
    builder.addCase(createBusiness.fulfilled, (state, action) => {
         console.log('sucesss')
        //  console.log('dayaa',action.payload)

      state.loading = false;
      updateStatus(state, '');

      if (action.payload && action.payload.status) {
          state.business = { ...action.payload.data.business };
          state.businesses=[...state.businesses,{...action.payload.data.business}]
          updateStatus(state, '');
      } else {
          updateStatus(state, action.payload.status);
      }

      state.loading = false;

    });
    builder.addCase(createBusiness.rejected, (state, action) => {
      console.log('Rejected');
      state.loading = false;
      updateStatus(state, '');
    });

    //create document

    builder.addCase(createDocument.pending, state => {
      console.log('Pending');
      state.createLoading = true;
      updateStatus(state, '');
    });
    builder.addCase(createDocument.fulfilled, (state, action) => {
      state.createLoading = false;
      updateStatus(state, '');

      if (action.payload.status) {
          state.document = { ...action.payload.data.document };
          state.documents = [...state.documents, { ...state.document }];
          updateStatus(state, '');
      } else {
          updateStatus(state, action.payload.status);
      }
      state.loading = false;

    });
    builder.addCase(createDocument.rejected, (state, action) => {
      console.log('Rejected');
      state.createLoading = false;
      updateStatus(state, '');
    });

    //delete document 

    builder.addCase(deleteDocument.pending, (state) => {
    
      state.loading = true;
      updateStatus(state, '');
    });

    builder.addCase(deleteDocument.fulfilled, (state, action) => {

      if (action.payload.status) {
      const deletedDocumentId = action.payload.data.document.id;
          
      state.documents = state.documents.filter((document) => document.id !== deletedDocumentId);
      }
      state.loading = false;
      updateStatus(state, '');
    });

    builder.addCase(deleteDocument.rejected, (state, action) => {
      console.log('Delete Business Rejected');
      state.loading = false;
      updateStatus(state, '');
    });


       //delete business

       builder.addCase(deleteBusiness.pending, (state) => {
        console.log('Delete Business Pending');
        state.loading = true;
        updateStatus(state, '');
      });
  
      builder.addCase(deleteBusiness.fulfilled, (state, action) => {

        if (action.payload.status) {
        const deletedBusinessId = action.payload.data.business.id;
            
        state.businesses = state.businesses.filter((business) => business.id !== deletedBusinessId);
        }
        state.loading = false;
        updateStatus(state, '');
      });
  
      builder.addCase(deleteBusiness.rejected, (state, action) => {
        console.log('Delete Business Rejected');
        state.loading = false;
        updateStatus(state, '');
      });

      //Bussiness update 
      builder.addCase(updateBusiness.pending, (state) => {
        state.loading = true;
        updateStatus(state, '');
    });

    builder.addCase(updateBusiness.fulfilled, (state, action) => {
     
      if (action.payload.status) { 
        const updatedBusiness = action.payload.data.business;
        const businessIndex = state.businesses.findIndex((business) => business.id === updatedBusiness.id);
          
        if (businessIndex !== -1) {      
            state.businesses = [
                ...state.businesses.slice(0, businessIndex),
                updatedBusiness,
                ...state.businesses.slice(businessIndex + 1),
            ];
        }
      }
        state.loading = false;
        updateStatus(state, '');
    });

    builder.addCase(updateBusiness.rejected, (state, action) => {
      console.log('Update Business Rejected');
      state.loading = false;
      updateStatus(state, '');
    });
    },
  });
  
  export const { clearMessage,changeDocStatus } = BusinessSlice.actions;
  
  export default BusinessSlice.reducer;