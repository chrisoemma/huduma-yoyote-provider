import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DrawerNavigator from "./DrawerNavigator";
import RequestedServices from "../features/Service/RequestedServices";
import MyBusiness from "../features/business/MyBusiness";
import BusinessDetails from "../features/business/BusinessDetails";
import AddBusinessScreen from "../features/business/AddBusiness";
import AddSubServiceScreen from "../features/business/AddSubServiceScreen";
import Settings from "../features/settings/Settings";
import { useTranslation } from "react-i18next";
import Employees from "../features/employees/Employees";
import AddEmployees from "../features/employees/AddEmployees";
import EmployeeAccount from "../features/employees/EmployeeAccount";
import EditAccount from "../features/account/EditAccount";
import Documents from "../features/account/Documents";


const AppStack = () => {

  const { t } = useTranslation();

  const Stack = createNativeStackNavigator();
  const screenOptions = {
    headerShown: false,
  };

  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={DrawerNavigator}
        options={{ headerShown: false }}
      />

      <Stack.Screen name="Requested services"
        component={RequestedServices}
        options={{ title: t('navigate:requestedServices') }}
      />
      <Stack.Screen name="My Businesses" component={MyBusiness}
        options={{ title: t('navigate:business') }}
      />
      <Stack.Screen name="Business Details"
        component={BusinessDetails}
        options={{ title: t('navigate:businessDetails') }}
      />
      <Stack.Screen name="Add Business"
        component={AddBusinessScreen}
        options={{ title: t('navigate:addBusiness') }}
      />
      <Stack.Screen name="Add Sub Service"
        component={AddSubServiceScreen}
        options={{ title: t('navigate:addSubService') }}
      />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{ title: t('navigate:settings') }}
      />
      <Stack.Screen
        name="Employees"
        component={Employees}
        options={{ title: t('navigate:employees') }}
      />

      <Stack.Screen
        name="Add Employees"
        component={AddEmployees}
        options={{ title: t('navigate:addEmployee') }}
      />

      <Stack.Screen
        name="Employee Account"
        component={EmployeeAccount}
        options={{ title: t('navigate:employeeAccount') }}
      />
      
      <Stack.Screen name="Edit Account"
         component={EditAccount}
         options={{ title: t('navigate:editAccount') }}
          />

<Stack.Screen name="My Documents"
         component={Documents}
         options={{ title: t('screens:myDocuments') }}
          />

    </Stack.Navigator>

  );
};

export default AppStack