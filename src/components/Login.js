import React, { useState } from 'react';
import { Button, StyleSheet, Text, View, TextInput } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useAuth } from '../contexts/AuthContext';

const Login = ({ navigation }) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn, signInWithGoogle } = useAuth();

    async function signInUser(email, password) {
        try {
            await signIn(email, password)
        } catch (error) {
            alert(error.message)
        }
    }

    async function signInUserWithGoogle() {
        try {
            await signInWithGoogle();
        } catch (error) {
            alert(error.message)
        }
    }


    return (
        <View style={styles.container}>
            <Text>ParkShare</Text>
            <TextInput placeholder='Email' onChangeText={email => setEmail(email)} />
            <TextInput secureTextEntry placeholder='Contraseña' onChangeText={password => setPassword(password)} />
            <Button title="Iniciar Sesión" onPress={() => signInUser(email, password)} />
            <Button title="Iniciar Sesión con Google" onPress={() => signInUserWithGoogle()} />
            <Text>¿No tiene cuenta?</Text>
            <Button title="Registrarse" onPress={() => navigation.navigate('Signup')} />
        </View >
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

export default Login

