import React, { useState } from 'react';
import { View, TouchableWithoutFeedback, KeyboardAvoidingView } from 'react-native';
import { Button, Datepicker, Divider, Icon, Input, Layout, StyleService, useStyleSheet, Select, SelectItem, IndexPath } from '@ui-kitten/components';
import TopHeader from './TopHeader';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { addVehicle } from '../controllers/vehicleController';
import SnackBar from 'react-native-snackbar-component';


const AddVehicle = ({ navigation }) => {

    const styles = useStyleSheet(themedStyles);
    const { currentUser } = useAuth();
    const { state, dispatch } = useStore();

    const [brand, setBrand] = useState(new IndexPath(0));
    const [model, setModel] = useState('');
    const [licensePlate, setLicensePlate] = useState('');
    const [color, setColor] = useState('');
    const [error, setError] = useState('');

    const carBrands = [
        { type: 'Volkswagen', label: 'Volkswagen' },
        { type: 'Renault', label: 'Renault' },
    ]


    const handleAddButtonPress = async () => {
        const validation = validateCarData()
        if (validation) {
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
        }
    };

    const validateCarData = () => {
        let result = true;
        let errorMessage = '';
        if(licensePlate.length === 0) {
            result = false;
            errorMessage = addErrorToMessage(errorMessage, "Debe completar la patente del vehículo")
        }
        if(model.length === 0) {
            result = false;
            errorMessage = addErrorToMessage(errorMessage, "Debe completar el modelo del vehículo")
        }
        if(color.length === 0) {
            result = false;
            errorMessage = addErrorToMessage(errorMessage, "Debe completar el color del vehículo")
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
                    placeholder='AA-123-BB'
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

export default AddVehicle
