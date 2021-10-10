import React, { useState } from 'react';
import { View, TouchableWithoutFeedback, KeyboardAvoidingView } from 'react-native';
import { Button, Datepicker, Divider, Icon, Input, Layout, StyleService, useStyleSheet, Select, SelectItem, IndexPath } from '@ui-kitten/components';
import TopHeader from './TopHeader';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { addPaymentMethod } from '../controllers/paymentMethodController';


const AddPaymentMethod = ({ navigation }) => {

    const styles = useStyleSheet(themedStyles);
    const { currentUser } = useAuth();
    const { state, dispatch } = useStore();

    const [number, setNumber] = useState('');
    const [name, setName] = useState('');
    const [date, setDate] = useState();
    const [cvv, setCVV] = useState('');
    const [cvvVisible, setCVVVisible] = useState(false);
    const [cardType, setCardType] = useState(new IndexPath(0));

    const cardTypes = [
        { type: 'visa', label: 'Visa' },
        { type: 'master', label: 'MasterCard' },
        { type: 'amex', label: 'American Express' }
    ]


    const onCVVIconPress = () => {
        setCVVVisible(!cvvVisible);
    };

    const handleAddButtonPress = async () => {
        const card = {
            number: number,
            cardholderName: name,
            expireDate: date.getMonth() + 1 + '/' + date.getFullYear(),
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
    };

    const renderCVVIcon = (props) => (
        <TouchableWithoutFeedback onPress={onCVVIconPress}>
            <Icon {...props} name={cvvVisible ? 'eye' : 'eye-off'} />
        </TouchableWithoutFeedback>
    );

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
                    placeholder='1234 3456 5677 8907'
                    keyboardType='numeric'
                    maxLength={19}
                    value={number}
                    onChangeText={setNumber}
                />
                <View style={styles.middleContainer}>
                    <Datepicker
                        style={[styles.input, styles.middleInput]}
                        label='FECHA DE VENCIMIENTO'
                        placeholder='9/2024'
                        date={date}
                        onSelect={setDate}
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
                        onChangeText={setCVV}
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
