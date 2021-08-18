import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../components/Login';
import Signup from '../components/Signup';


const Stack = createStackNavigator();

export default function AuthStack() {
    return (
        <Stack.Navigator initialRouteName='Login'>
            <Stack.Screen
                name='Login'
                component={Login}
                options={{ header: () => null }}
            />
            <Stack.Screen
                name='Signup'
                component={Signup}
                options={{ header: () => null }} />
        </Stack.Navigator>
    );
}