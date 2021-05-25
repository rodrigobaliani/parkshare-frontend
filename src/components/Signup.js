import React, { useState } from 'react';
import { View, KeyboardAvoidingView, TouchableWithoutFeedback } from 'react-native';
import {
    Button,
    Input,
    StyleService,
    Text,
    useStyleSheet,
    Icon,
} from '@ui-kitten/components';
import ImageOverlay from "react-native-image-overlay";
import { useAuth } from '../contexts/AuthContext';
import { getFirebaseErrorMessage } from '../constants/ErrorMessages'

const Signup = ({ navigation }) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

    const { signUp, signInWithGoogle } = useAuth();

    const styles = useStyleSheet(themedStyles);

    async function registerUser(email, password) {
        try {
            if (email === '' || password === '') {
                return alert('No puede dejar campos vacios')
            }
            if (password !== confirmPassword) {
                return alert('Las contraseñas no coinciden')
            }
            await signUp(email, password);
        }
        catch (error) {
            const errorMessage = getFirebaseErrorMessage(error.code)
            alert(errorMessage)
        }
    }

    async function registerUserWithGoogle() {
        try {
            await signInWithGoogle();
        } catch (error) {
            const errorMessage = getFirebaseErrorMessage(error.code)
            alert(errorMessage)
        }
    }

    const onPasswordIconPress = () => {
        setPasswordVisible(!passwordVisible);
    };

    const onConfirmPasswordIconPress = () => {
        setConfirmPasswordVisible(!confirmPasswordVisible);
    };

    const renderPasswordIcon = (props) => (
        <TouchableWithoutFeedback onPress={onPasswordIconPress}>
            <Icon {...props} name={passwordVisible ? 'eye-off' : 'eye'} />
        </TouchableWithoutFeedback>
    );

    const renderConfirmPasswordIcon = (props) => (
        <TouchableWithoutFeedback onPress={onConfirmPasswordIconPress}>
            <Icon {...props} name={confirmPasswordVisible ? 'eye-off' : 'eye'} />
        </TouchableWithoutFeedback>
    );

    const renderEmailIcon = (props) => (
        <Icon {...props} name='email' />
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
                <View style={styles.headerContainer}>
                    <Text category='h1' status='control'>
                        Parkshare
                        </Text>
                    <Text style={styles.signUpLabel} category='s1' status='control'>
                        Crear una cuenta
                        </Text>
                </View>
                <View style={styles.formContainer}>
                    <Input
                        style={styles.formInput}
                        status='control'
                        autoCapitalize='none'
                        placeholder='Email'
                        accessoryRight={renderEmailIcon}
                        value={email}
                        onChangeText={email => setEmail(email)}
                    />
                    <Input
                        style={styles.formInput}
                        status='control'
                        autoCapitalize='none'
                        secureTextEntry={!passwordVisible}
                        placeholder='Contraseña'
                        accessoryRight={renderPasswordIcon}
                        value={password}
                        onChangeText={password => setPassword(password)}
                    />
                    <Input
                        style={styles.formInput}
                        status='control'
                        autoCapitalize='none'
                        secureTextEntry={!confirmPasswordVisible}
                        placeholder='Confirme contraseña'
                        accessoryRight={renderConfirmPasswordIcon}
                        value={confirmPassword}
                        onChangeText={confirmPassword => setConfirmPassword(confirmPassword)}
                    />
                </View>
                <Button
                    style={styles.signUpButton}
                    size='giant'
                    onPress={() => registerUser(email, password)}
                >
                    CREAR CUENTA
                </Button>
                <View style={styles.socialAuthContainer}>
                    <Text style={styles.socialAuthHintText} status='control'>
                        O registrese usando redes sociales:
                    </Text>
                    <View style={styles.socialAuthButtonsContainer}>
                        <Button
                            appearance='ghost'
                            size='giant'
                            status='control'
                            accessoryLeft={renderGoogleIcon}
                            onPress={() => registerUserWithGoogle()}
                        />
                        <Button
                            appearance='ghost'
                            size='giant'
                            status='control'
                            accessoryLeft={renderFacebookIcon}
                        />
                    </View>
                </View>
                <Button
                    style={styles.signInButton}
                    appearance='ghost'
                    status='control'
                    onPress={() => navigation.navigate('Login')}
                >
                    ¿Ya tiene una cuenta? Inicie sesión
                </Button>
            </ImageOverlay>
        </KeyboardAvoidingView>
    )
}

const themedStyles = StyleService.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 176,
    },
    formContainer: {
        flex: 1,
        paddingTop: 32,
        paddingHorizontal: 16,
    },
    formInput: {
        marginTop: 16,
        width: '80%'
    },
    termsCheckBox: {
        marginTop: 24,
    },
    termsCheckBoxText: {
        color: 'text-control-color',
        marginLeft: 10,
    },
    signUpButton: {
        marginHorizontal: 16,
    },
    signInButton: {
        marginVertical: 12,
        marginHorizontal: 16,
    },
    socialAuthContainer: {
        marginTop: 24,
    },
    socialAuthButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    socialAuthHintText: {
        alignSelf: 'center',
        marginBottom: 16,
    },
    signUpLabel: {
        marginTop: 16,
    },
});

export default Signup
