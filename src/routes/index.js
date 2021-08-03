import React from 'react';
import { StoreProvider } from '../contexts/StoreContext';
import { AuthProvider } from '../contexts/AuthContext';
import Routes from './Routes';

export default function Providers() {
    return (
        <AuthProvider>
            <StoreProvider>
                <Routes />
            </StoreProvider>
        </AuthProvider>
    );
}