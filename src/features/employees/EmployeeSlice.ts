import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_URL } from '../../utils/config';
import { authHeader } from '../../utils/auth-header';


export const getEmployees = createAsyncThunk(
    'employees/getEmployees',
    async ({ providerId }: any) => {

        let header: any = await authHeader();
        const response = await fetch(`${API_URL}/employees/provider_employees/${providerId}`, {
            method: 'GET',
            headers: header,
        });
        return (await response.json()) as any;
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

    state.status = 'Request failed. Please try again.';
    return;
}



export const createEmployee = createAsyncThunk(
    'employees/createEmployee',
    async (data) => {
        const response = await fetch(`${API_URL}/employees/store_employee`, {
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

export const deleteEmployee = createAsyncThunk(
    'employees/deleteEmployee',
    async ({ employeeId }: any) => {
        try {
            const header: any = await authHeader();
            const response = await fetch(`${API_URL}/employees/${employeeId}`, {
                method: 'DELETE',
                headers: header,
            });

            if (!response.status) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete task');
            }

            return (await response.json());
        } catch (error) {
            throw error;
        }
    }
);



export const updateEmployee = createAsyncThunk(
    'employees/updateEmployee',
    async ({ data, employeeId }: any) => {
        console.log('employeeId', employeeId);
        const response = await fetch(`${API_URL}/employees/${employeeId}`, {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return (await response.json());
    }
);

export const getEmployeeRequests = createAsyncThunk(
    'employees/getEmployeeRequests',
    async ({ employeeId }: any) => {

        let header: any = await authHeader();
        const response = await fetch(`${API_URL}/requests/employee/${employeeId}`, {
            method: 'GET',
            headers: header,
        });
        return (await response.json()) as any;
    },
);


const EmployeeSlice = createSlice({
    name: 'employees',
    initialState: {
        employees: [],
        employee: {},
        employee_requests: [],
        loading: false,
    },
    reducers: {
        clearMessage(state: any) {
            state.status = null;
        },
    },
    extraReducers: builder => {

        builder.addCase(getEmployees.pending, state => {
            console.log('Pending');
            state.loading = true;
        });
        builder.addCase(getEmployees.fulfilled, (state, action) => {
       
            if (action.payload.status) {
                state.employees = action.payload.data.employees;
            }
            state.loading = false;
        });
        builder.addCase(getEmployees.rejected, (state, action) => {
            console.log('Rejected');
            state.loading = false;
        });

        //ADD Employee

        builder.addCase(createEmployee.pending, state => {
            console.log('Pending2222222');
            state.loading = true;
            updateStatus(state, '');
        });
        builder.addCase(createEmployee.fulfilled, (state, action) => {
                   console.log('fullddududu')
            if (action.payload.status) {
                state.employee = { ...action.payload.data.employee };
                state.employees=[...state.employees,{...action.payload.data.employee}]
                updateStatus(state, action.payload.status);
               
            } else {
                updateStatus(state, '');
            }

            state.loading = false;
        });
        builder.addCase(createEmployee.rejected, (state, action) => {
            console.log('Rejected');
            state.loading = false;
            updateStatus(state, '');
        });

        builder.addCase(deleteEmployee.pending, (state) => {
            console.log('Delete Employee Pending');
            state.loading = true;
            updateStatus(state, '');
        });

        builder.addCase(deleteEmployee.fulfilled, (state, action) => {
            console.log('Delete Employee Fulfilled');
            const deletedEmployeeId = action.payload.data.employee.id;

            state.employees = state.employees.filter((employee) => employee.id !== deletedEmployeeId);

            state.loading = false;
            updateStatus(state, '');
        });

        builder.addCase(deleteEmployee.rejected, (state, action) => {
            console.log('Delete Task Rejected');
            state.loading = false;
            updateStatus(state, '');
        });


        //update Employee

        builder.addCase(updateEmployee.pending, (state) => {
            console.log('Update Task Pending');
            state.loading = true;
            updateStatus(state, '');
        });

        builder.addCase(updateEmployee.fulfilled, (state, action) => {
            console.log('Update Task Fulfilled');

             if(action.payload.status){
            const updatedEmployee = action.payload.data.employee;

            const employeeIndex = state.employees.findIndex((employee) => employee.id === updatedEmployee.id);
            
            if (employeeIndex !== -1) {
               
                state.employees = [
                    ...state.employees.slice(0, employeeIndex),
                    updatedEmployee,
                    ...state.employees.slice(employeeIndex + 1),
                ];
            }
            
        }
            state.loading = false;
            updateStatus(state, '');
        });

        builder.addCase(updateEmployee.rejected, (state) => {
            console.log('Update Rejected');
            state.loading = true;
            updateStatus(state, '');
        });

        //employees sub services 

        builder.addCase(getEmployeeRequests.pending, state => {
            console.log('Pending');
            state.loading = true;
        });
        builder.addCase(getEmployeeRequests.fulfilled, (state, action) => {
            if (action.payload.status) {
                state.employee_requests = action.payload.data.requests;
            }
            state.loading = false;
        });
        builder.addCase(getEmployeeRequests.rejected, (state, action) => {
            console.log('Rejected');
            state.loading = false;
        });
    },
});


export const { clearMessage } = EmployeeSlice.actions;

export default EmployeeSlice.reducer;