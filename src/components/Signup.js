import React, { useState, useEffect } from 'react';
import { Button, StyleSheet, Text, View, TextInput } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useAuth } from '../contexts/AuthContext';

const Signup = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signUp } = useAuth();

    async function registerUser(email, password) {
        try {
            await signUp(email, password);
        }
        catch (error) {
            alert(error.message);
        }
    }

    return (
        <View style={styles.container}>
            <TextInput placeholder='Email' onChangeText={email => setEmail(email)} />
            <TextInput secureTextEntry placeholder='Contraseña' onChangeText={password => setPassword(password)} />
            <Button title="Registrarse" onPress={() => registerUser(email, password)} />
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


export default Signup
