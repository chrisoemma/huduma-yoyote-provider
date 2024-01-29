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
    async ({ data, providerId }: any) => {
        const response = await fetch(`${API_URL}/employees/store_employee/${providerId}`, {
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

const EmployeeSlice = createSlice({
    name: 'employees',
    initialState: {
        employees: [],
        employee: {},
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
            console.log('Fulfilled case111',action.payload);
              
           
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
            console.log('Pending');
            state.loading = true;
            updateStatus(state, '');
        });
        builder.addCase(createEmployee.fulfilled, (state, action) => {

            state.loading = false;
            updateStatus(state, '');

            if (action.payload.status) {
                state.employee = { ...action.payload.data.employee };
                updateStatus(state, '');
            } else {
                updateStatus(state, action.payload.status);
            }

            state.employees.push(state.employee);
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
          
            const updatedEmployee = action.payload.data.employee;

            const employeeIndex = state.employees.findIndex((employee) => employee.id === updatedEmployee.id);
            console.log('employeeindex', employeeIndex);
            if (employeeIndex !== -1) {
                // Update the task in the array immutably
                state.employees = [
                    ...state.employees.slice(0, employeeIndex),
                    updatedEmployee,
                    ...state.employees.slice(employeeIndex + 1),
                ];
            }

            state.loading = false;
            updateStatus(state, '');
        });
    },
});


export const { clearMessage } = EmployeeSlice.actions;

export default EmployeeSlice.reducer;