import React, { useContext, useState } from "react"
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';



const AuthContext = React.createContext()

export function useAuth() {
    return useContext(AuthContext)
}

GoogleSignin.configure({
    webClientId: '318604435769-9sd20lovb5k8th6p9if3sl0ps7a2gkm2.apps.googleusercontent.com',
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
        const { idToken, accessToken } = await GoogleSignin.signIn();

        // Create a Google credential with the token
        const googleCredential = auth.GoogleAuthProvider.credential(idToken, accessToken);

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