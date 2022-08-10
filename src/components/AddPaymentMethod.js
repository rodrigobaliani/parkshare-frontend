import React, { useState } from 'react';
import { View, TouchableWithoutFeedback, KeyboardAvoidingView } from 'react-native';
import { Button, Datepicker, Divider, Icon, Input, Layout, StyleService, useStyleSheet, Select, SelectItem, IndexPath } from '@ui-kitten/components';
import TopHeader from './TopHeader';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { addPaymentMethod } from '../controllers/paymentMethodController';
import SnackBar from 'react-native-snackbar-component'


const AddPaymentMethod = ({ navigation }) => {

    const styles = useStyleSheet(themedStyles);
    const { currentUser } = useAuth();
    const { state, dispatch } = useStore();

    const [number, setNumber] = useState('');
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [cvv, setCVV] = useState('');
    const [cvvVisible, setCVVVisible] = useState(false);
    const [cardType, setCardType] = useState(new IndexPath(0));
    const [numberStatus, setNumberStatus] = useState('basic');
    const [nameStatus, setNameStatus] = useState('basic');
    const [dateStatus, setDateStatus] = useState('basic');
    const [cvvStatus, setCvvStatus] = useState('basic');


    const [error, setError] = useState('');

    const cardTypes = [
        { type: 'visa', label: 'Visa' },
        { type: 'master', label: 'MasterCard' },
        { type: 'amex', label: 'American Express' }
    ]


    const onCVVIconPress = () => {
        setCVVVisible(!cvvVisible);
    };

    const renderCVVIcon = (props) => (
        <TouchableWithoutFeedback onPress={onCVVIconPress}>
            <Icon {...props} name={cvvVisible ? 'eye' : 'eye-off'} />
        </TouchableWithoutFeedback>
    );

    const handleAddButtonPress = async () => {

        const validateData = validateCardData();
        if (validateData) {
            const card = {
                number: number,
                cardholderName: name,
                expireDate: date,
                cvv: cvv,
                primary: false,
                type: cardTypes[cardType.row].type
            }

            try {
                const payment = await addPaymentMethod(currentUser.uid, card)
                const paymentMethods = state.paymentMethods
                if (paymentMethods.length === 0) {
                    payment.primary = true;
                }
                paymentMethods.push(payment)
                dispatch({ type: 'setPaymentMethods', payload: paymentMethods })
                navigation.goBack();
            } catch (error) {
                console.log(error)
            }
        }
    };

    const validateCardData = () => {
        let result = true;
        let errorMessage = '';
        setNameStatus('basic');
        setNumberStatus('basic');
        setDateStatus('basic');
        setCvvStatus('basic');
        //Card number validations
        if (number.length === 0) {
            errorMessage = addErrorToMessage(errorMessage,'Debe completar el número de tarjeta');
            setNumberStatus('danger');
            result = false;
        }
        else if (number.length < 19) {
            errorMessage = addErrorToMessage(errorMessage,'Número de tarjeta inválido');
            setNumberStatus('danger');
            result = false;
        }

        //Expiry date validations
        if (date.length === 0) {
            errorMessage = addErrorToMessage(errorMessage,'Debe completar la fecha de vencimiento de la tarjeta');
            setDateStatus('danger');
            result = false;
        }
        else {
            const month = date.substring(0, 2);
            const year = date.substring(3, 5);
            if (date.length < 5 || month > 12 || year < 22) {
                errorMessage = addErrorToMessage(errorMessage, 'Fecha de vencimiento inválida');
                setDateStatus('danger');
                result = false;
            }
        }

        //CVV and name validations
        if (name.length === 0) {
            errorMessage = addErrorToMessage(errorMessage, 'Debe completar el nombre del titular de la tarjeta');
            setNameStatus('danger');
            result = false;
        }

        if (cvv.length === 0) {
            errorMessage = addErrorToMessage(errorMessage, 'Debe completar el codigo de seguridad de la tarjeta');
            setCvvStatus('danger');
            result = false;
        }
        else if (cvv.length < 3) {
            errorMessage = addErrorToMessage(errorMessage, 'Codigo de seguridad inválido');
            result = false;
        }
        if(!result) {
            setError(errorMessage)
        }
        return result;
    }

    const addErrorToMessage = (msg, error) => {
        if(msg.length === 0) 
            return msg + error;
        else return msg + '\n\n' + error;
    }

    const handleCardNumberChange = (number) => {

        // Do not allow users to write invalid characters
        number = number.replace(/[^\d]/g, "");
        number = number.substring(0, 16);

        // Split the card number is groups of 4
        var newNumberSections = number.match(/\d{1,4}/g);
        if (newNumberSections !== null) {
            number = newNumberSections.join(' ');
        }

        setNumber(number)
    }

    const handeExpiryDateChange = (date) => {

        //Add or remove slash
        if (date.length === 3) {
            if(date.charAt(2) === '/') {
                date = date.replace('/', '');
            }
            else if(date.charAt(2) !== '') {
                date = date.substring(0, 2) + '/' + date.charAt(2);
            }
        }

        setDate(date);
    }

    const handleCvvChange = (number) => {

        // Do not allow users to write invalid characters
        number = number.replace(/[^\d]/g, "");
        number = number.substring(0, 16);

        setCVV(number);
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}>
            <TopHeader screenName='Agregar Nueva Tarjeta' />
            <Layout
                style={styles.form}
                level='1'>
                <Input
                    style={styles.input}
                    label='NÚMERO DE TARJETA'
                    placeholder='XXXX XXXX XXXX XXXX'
                    keyboardType='numeric'
                    maxLength={19}
                    value={number}
                    status={numberStatus}
                    onChangeText={(number) => handleCardNumberChange(number)}
                />
                <View style={styles.middleContainer}>
                    <Input
                        style={[styles.input, styles.middleInput]}
                        label='FECHA DE VENCIMIENTO'
                        placeholder='MM/YY'
                        value={date}
                        maxLength={5}
                        keyboardType='numeric'
                        status={dateStatus}
                        onChangeText={(date) => handeExpiryDateChange(date)}
                    />
                    <Input
                        style={[styles.input, styles.middleInput]}
                        label='CODIGO DE SEGURIDAD'
                        keyboardType='numeric'
                        placeholder='***'
                        maxLength={3}
                        value={cvv}
                        secureTextEntry={!cvvVisible}
                        accessoryRight={renderCVVIcon}
                        status={cvvStatus}
                        onChangeText={(number) => handleCvvChange(number)}
                    />

                </View>
                <Select
                    style={styles.select}
                    selectedIndex={cardType}
                    label="TIPO DE TARJETA"
                    value={cardTypes[cardType.row].label}
                    onSelect={index => setCardType(index)}
                >
                    <SelectItem title='Visa' />
                    <SelectItem title='MasterCard' />
                    <SelectItem title='American Express' />
                </Select>
                <Input
                    style={styles.input}
                    label='NOMBRE DEL TITULAR'
                    placeholder='Nombre'
                    value={name}
                    status={nameStatus}
                    onChangeText={setName}
                />
            </Layout>
            <Divider />
            <Button
                style={styles.addButton}
                size='giant'
                onPress={handleAddButtonPress}>
                AGREGAR TARJETA
            </Button>
            <SnackBar
                visible={error.length > 0}
                textMessage={error}
                actionHandler={() => { setError('') }}
                actionText="OK"
                backgroundColor='#990000'
                accentColor='#ffffff'
            />
        </KeyboardAvoidingView>
    );
};

const themedStyles = StyleService.create({
    container: {
        flex: 1,
        backgroundColor: 'background-basic-color-2',
    },
    form: {
        flex: 1,
        paddingHorizontal: 4,
        paddingVertical: 24,
    },
    input: {
        marginHorizontal: 12,
        marginVertical: 8,
    },
    select: {
        marginHorizontal: 12,
        marginVertical: 8,
    },
    middleContainer: {
        flexDirection: 'row',
    },
    middleInput: {
        width: 128,
    },
    addButton: {
        marginHorizontal: 16,
        marginVertical: 24,
    },
});

export default AddPaymentMethod
