import React, { useContext, useState, useEffect } from "react"
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';



const AuthContext = React.createContext()

export function useAuth() {
    return useContext(AuthContext)
}

GoogleSignin.configure({
    webClientId: '841200999064-1dqu7ut22543otu9qd3lj897aev8jfq1.apps.googleusercontent.com'
});

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

    async function signInWithGoogle() {
        // Get the users ID token
        const { idToken } = await GoogleSignin.signIn();

        // Create a Google credential with the token
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);

        // Sign-in the user with the credential
        return auth().signInWithCredential(googleCredential);
    }

    const value = {
        currentUser,
        setCurrentUser,
        signUp,
        signIn,
        signOut,
        signInWithGoogle
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}