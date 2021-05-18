import React from 'react'
import { View, Text, StyleSheet, Button } from 'react-native'
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-community/async-storage';
import Login from './Login';
import { useAuth } from '../contexts/AuthContext';


const Home = () => {

    const { currentUser, signOut } = useAuth();

    async function logout() {
        try {
            await signOut();
        }
        catch (error) {
            alert(error.message);
        }
    }

    return (
        <View style={styles.container}>
            <Text>Welcome {currentUser.email}</Text>
            <Button title="Logout" onPress={() => logout()} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Home
