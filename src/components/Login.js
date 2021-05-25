import React, { useState } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback, KeyboardAvoidingView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getFirebaseErrorMessage } from '../constants/ErrorMessages'
import { Button, Input, Text, Icon } from '@ui-kitten/components';
import ImageOverlay from "react-native-image-overlay";

const Login = ({ navigation }) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const { signIn, signInWithGoogle } = useAuth();

    async function signInUser(email, password) {
        try {
            if (email === '' || password === '') {
                return alert('No puede dejar campos vacios')
            }
            await signIn(email, password)
        } catch (error) {
            const errorMessage = getFirebaseErrorMessage(error.code)
            alert(errorMessage)
        }
    }

    async function signInUserWithGoogle() {
        try {
            await signInWithGoogle();
        } catch (error) {
            const errorMessage = getFirebaseErrorMessage(error.code)
            alert(errorMessage)
        }
    }

    const toggleSecureEntry = () => {
        setSecureTextEntry(!secureTextEntry);
    };

    const renderPasswordIcon = (props) => (
        <TouchableWithoutFeedback onPress={toggleSecureEntry}>
            <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'} />
        </TouchableWithoutFeedback>
    );

    const renderGoogleIcon = (props) => (
        <Icon {...props} name='google' />
    );

    const renderFacebookIcon = (props) => (
        <Icon {...props} name='facebook' />
    );


    return (
        <KeyboardAvoidingView>
            <ImageOverlay source={{ uri: "https://somethingoffreedom.com/wp-content/uploads/2017/09/Obelisk-Buenos-Aires-Sights.jpg" }} height={660} contentPosition="bottom">
                <View style={styles.container}>
                    <View style={styles.headerContainer}>
                        <Text category='h1' status='control'>
                            Parkshare
                        </Text>
                        <Text style={styles.signInLabel} category='s1' status='control'>
                            Ingrese a su cuenta
                        </Text>
                    </View>
                    <View style={styles.formContainer}>
                        <Input
                            status='control'
                            placeholder='Email'
                            value={email}
                            onChangeText={email => setEmail(email)}
                        />
                        <Input
                            style={styles.passwordInput}
                            status='control'
                            placeholder='Contraseña'
                            value={password}
                            accessoryRight={renderPasswordIcon}
                            secureTextEntry={secureTextEntry}
                            onChangeText={password => setPassword(password)}
                        />
                        <View style={styles.forgotPasswordContainer}>
                            <Button style={styles.forgotPasswordButton} appearance='ghost' status='control'>
                                ¿Olvidaste tu contraseña?
                            </Button>
                        </View>
                    </View>
                    <Button
                        style={styles.signInButton}
                        size='giant'
                        onPress={() => signInUser(email, password)}
                    >
                        INICIAR SESIÓN
                    </Button>
                    <View style={styles.socialAuthContainer}>
                        <Text style={styles.socialAuthHintText} status='control'>
                            O inicie sesión con redes sociales
                        </Text>
                        <View style={styles.socialAuthButtonsContainer}>
                            <Button
                                appearance='ghost'
                                status='control'
                                size='giant'
                                accessoryLeft={renderGoogleIcon}
                                onPress={() => signInUserWithGoogle()}
                            />
                            <Button appearance='ghost'
                                status='control'
                                size='giant'
                                accessoryLeft={renderFacebookIcon}
                            />
                        </View>
                    </View>
                    <Button style={styles.signUpButton}
                        appearance='ghost'
                        status='control'
                        onPress={() => navigation.navigate('Signup')}
                    >
                        ¿No tiene una cuenta? Registrese
                    </Button>
                </View>
            </ImageOverlay>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        minHeight: 216,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    signInLabel: {
        marginTop: 16,
    },
    passwordInput: {
        marginTop: 16,
    },
    signInButton: {
        marginHorizontal: 1,
    },
    forgotPasswordContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    forgotPasswordButton: {
        paddingHorizontal: 0,
    },
    signUpButton: {
        marginVertical: 12,
    },
    socialAuthContainer: {
        marginTop: 32,
    },
    socialAuthButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    socialAuthHintText: {
        alignSelf: 'center',
        marginBottom: 16,
    },
});


export default Login

