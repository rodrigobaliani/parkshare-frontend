import React, { useState } from 'react';
import { View, TouchableWithoutFeedback, KeyboardAvoidingView } from 'react-native';
import { Button, Datepicker, Divider, Icon, Input, Layout, StyleService, useStyleSheet, Select, SelectItem, IndexPath } from '@ui-kitten/components';
import TopHeader from './TopHeader';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { addVehicle } from '../controllers/vehicleController';


const AddVehicle = ({ navigation }) => {

    const styles = useStyleSheet(themedStyles);
    const { currentUser } = useAuth();
    const { state, dispatch } = useStore();

    const [brand, setBrand] = useState(new IndexPath(0));
    const [model, setModel] = useState('');
    const [licensePlate, setLicensePlate] = useState('');
    const [color, setColor] = useState('');

    const carBrands = [
        { type: 'Volkswagen', label: 'Volkswagen' },
        { type: 'Renault', label: 'Renault' },
    ]


    const handleAddButtonPress = async () => {
        const vehicles = state.userVehicles
        const vehicle = {
            brand: carBrands[brand.row].type,
            model: model,
            primary: vehicles.length === 0 ? true : false,
            color: color,
            licensePlate: licensePlate
        }
        try {
            const newVehicle = await addVehicle(currentUser.uid, vehicle)
            vehicles.push(newVehicle)
            dispatch({ type: 'setUserVehicles', payload: vehicles })
            navigation.goBack();
        } catch (error) {
            console.log(error)
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}>
            <TopHeader screenName='Agregar Nuevo Vehículo' />
            <Layout
                style={styles.form}
                level='1'>
                <Select
                    style={styles.select}
                    selectedIndex={brand}
                    label="MARCA"
                    value={carBrands[brand.row].label}
                    onSelect={index => setBrand(index)}
                >
                    <SelectItem title='Volkswagen' />
                    <SelectItem title='Renault' />
                </Select>
                <Input
                    style={styles.input}
                    label='MODELO'
                    placeholder='Gol Trend'
                    keyboardType='default'
                    maxLength={19}
                    value={model}
                    onChangeText={setModel}
                />
                <Input
                    style={styles.input}
                    label='PATENTE'
                    placeholder='AA-1234-BB'
                    value={licensePlate}
                    onChangeText={setLicensePlate}
                />
                <Input
                    style={styles.input}
                    label='COLOR'
                    placeholder='Blanco'
                    value={color}
                    onChangeText={setColor}
                />
            </Layout>
            <Divider />
            <Button
                style={styles.addButton}
                size='giant'
                onPress={handleAddButtonPress}>
                AGREGAR VEHÍCULO
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

export default AddVehicle
