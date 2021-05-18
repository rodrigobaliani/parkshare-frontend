import React, { useContext, useState, useEffect } from "react"
import auth from '@react-native-firebase/auth';

const AuthContext = React.createContext()

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }) {

    const [currentUser, setCurrentUser] = useState()

    function signUp(email, password) {
        return auth().createUserWithEmailAndPassword(email, password)
    }

    function signIn(email, password) {
        return auth().signInWithEmailAndPassword(email, password)
    }

    function signOut() {
        return auth().signOut();
    }

    const value = {
        currentUser,
        setCurrentUser,
        signUp,
        signIn,
        signOut
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}