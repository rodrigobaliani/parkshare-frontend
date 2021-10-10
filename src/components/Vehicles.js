import React, { useEffect, useState } from 'react'
import { View, Image, TouchableWithoutFeedback } from 'react-native'
import { Button, Card, List, StyleService, Text, useStyleSheet, Icon, Toggle } from '@ui-kitten/components';
import TopHeader from './TopHeader';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { editVehicle, deleteVehicle } from '../controllers/vehicleController';

const Vehicles = ({ navigation }) => {

    const styles = useStyleSheet(themedStyles);
    const { currentUser } = useAuth();
    const { state, dispatch } = useStore();

    const renderTogglePrimary = (id, checked) => (
        <Toggle checked={checked} disabled={checked} onChange={() => handlePrimaryVehicleChange(id)} vehicleId={id}>
            {checked ? "Actual" : "Usar"}
        </Toggle>
    );

    const renderDeleteIcon = (props) => (
        <Icon {...props} name='trash-outline' />
    );

    const renderCardItem = (info) => (
        <View style={styles.cardItem}>
            <View style={styles.cardLogoContainer}>
                {info.item.brand === 'Volkswagen' &&
                    <Image
                        style={styles.cardLogo}
                        source={require('../assets/vw-logo.png')}
                    />
                }
                {info.item.brand === 'Renault' &&
                    <Image
                        style={styles.cardLogo}
                        source={require('../assets/renault-logo.png')}
                    />
                }
                <Button
                    style={styles.cardOptionsButton}
                    appearance='ghost'
                    status='control'
                    onPress={() => handleDeleteVehicle(info.item.id)}
                    accessoryLeft={() => renderTogglePrimary(info.item.id, info.item.primary)}
                    accessoryRight={renderDeleteIcon}
                />
            </View>
            <Text
                style={styles.cardBrandModel}
                category='h6'
                status='control'>
                {info.item.brand} {info.item.model}
            </Text>
            <View style={styles.cardLicensePlate}>
                <Text
                    style={styles.cardDetailsLabel}
                    category='p2'
                    status='control'>
                    Patente
                </Text>
                <Text
                    category='s1'
                    status='control'>
                    {info.item.licensePlate}
                </Text>
            </View>
            <View style={styles.cardColor}>
                <Text
                    style={styles.cardDetailsLabel}
                    category='p2'
                    status='control'>
                    Color
                </Text>
                <Text
                    category='s1'
                    status='control'>
                    {info.item.color}
                </Text>
            </View>
        </View>
    );

    const renderFooter = () => (
        <Card style={styles.placeholderCard} onPress={handlePlaceholderButtonPress}>
            <View>
                <Icon name='car' style={styles.carIcon} />
                <Text
                    appearance='hint'
                    category='s1'>
                    Agregar Nuevo Vehículo
                </Text>
            </View>
        </Card>
    );

    const handlePrimaryVehicleChange = async (id) => {
        const vehicles = state.userVehicles;
        vehicles.forEach(async (vehicle) => {
            if (vehicle.id === id) {
                vehicle.primary = !vehicle.primary;
                try {
                    await editVehicle(currentUser.uid, vehicle)
                } catch (error) {
                    console.log(error)
                }
            }
            else {
                if (vehicle.primary) {
                    vehicle.primary = !vehicle.primary
                    try {
                        await editVehicle(currentUser.uid, vehicle)
                    } catch (error) {
                        console.log(error)
                    }
                }
            }
        })
        dispatch({ type: 'setUserVehicles', payload: vehicles })
        dispatch({ type: 'setCurrentVehicle', payload: vehicles.filter(v => v.id === id)[0] })
    }

    const handleDeleteVehicle = async (id) => {
        var newPrimary = false;
        const vehicleToDelete = state.userVehicles.filter(v => v.id === id)
        if (vehicleToDelete[0].primary) {
            newPrimary = true;
        }
        const vehicles = state.userVehicles.filter(v => v.id !== id)
        try {
            if (newPrimary && vehicles.length > 0) {
                vehicles[0].primary = true;
                await editVehicle(currentUser.uid, vehicles[0])
            }
            await deleteVehicle(currentUser.uid, id)
        } catch (error) {
            console.log(error)
        }
        dispatch({ type: 'setUserVehicles', payload: vehicles })
    }

    const handlePlaceholderButtonPress = () => {
        navigation.navigate('AddVehicle')
    }

    useEffect(async () => {
        try {
            const userVehicles = [];
            const userVehiclesDb = await firestore()
                .collection('userData')
                .doc(`${currentUser.uid}`)
                .collection('userVehicles')
                .get();

            userVehiclesDb.forEach((doc) => {
                const vehicle = {
                    id: doc.id,
                    ...doc.data()
                }
                userVehicles.push(vehicle)
            })
            dispatch({ type: 'setUserVehicles', payload: userVehicles })
        } catch (error) {
            console.log(error)
        }
    }, [])

    return (
        <React.Fragment>
            {state.paymentMethods &&
                <React.Fragment>
                    <TopHeader screenName='Vehículos' />
                    <View style={styles.container}>
                        <List
                            style={styles.list}
                            contentContainerStyle={styles.listContent}
                            data={state.userVehicles}
                            renderItem={renderCardItem}
                            ListFooterComponent={renderFooter}
                        />
                    </View>
                </React.Fragment>
            }
        </React.Fragment>
    )
}

const themedStyles = StyleService.create({
    container: {
        flex: 1,
    },
    list: {
        flex: 1,
    },
    listContent: {
        padding: 16,
    },
    cardItem: {
        margin: 8,
        height: 192,
        padding: 24,
        borderRadius: 4,
        backgroundColor: 'color-primary-default',
    },
    cardLogoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardLogo: {
        height: 50,
        width: 50,
        tintColor: 'text-control-color',
    },
    cardOptionsButton: {
        position: 'absolute',
        right: -16,
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    cardBrandModel: {
        marginVertical: 24,
    },
    cardDetailsLabel: {
        marginVertical: 4,
    },
    cardLicensePlate: {
        position: 'absolute',
        left: 24,
        bottom: 24,
    },
    cardColor: {
        position: 'absolute',
        right: 24,
        bottom: 24,
    },
    placeholderCard: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 192,
        margin: 8,
        backgroundColor: 'background-basic-color-3',
    },
    carIcon: {
        alignSelf: 'center',
        width: 48,
        height: 48,
        tintColor: 'text-hint-color',
    },
    addButtonContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 16,
        paddingVertical: 24,
    },
});

export default Vehicles
