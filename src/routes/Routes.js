import React, { useContext, useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import AuthStack from './AuthStack';
import Loading from '../components/layout/Loading';
import { useAuth } from '../contexts/AuthContext';
import AppDrawer from './AppDrawer';
import firestore from '@react-native-firebase/firestore';

export default function Routes() {
    const { currentUser, setCurrentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [initializing, setInitializing] = useState(true);

    // Handle user state changes
    function onAuthStateChanged(user) {
        setCurrentUser(user);
        if (initializing) setInitializing(false);
        setLoading(false);
    }

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber; // unsubscribe on unmount
    }, []);

    if (loading) {
        return <Loading />;
    }

    return (
        <NavigationContainer>
            {currentUser ? <AppDrawer /> : <AuthStack />}
        </NavigationContainer>
    );
}