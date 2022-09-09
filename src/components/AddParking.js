import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, PermissionsAndroid, View, ScrollView } from 'react-native'
import { useAuth } from '../contexts/AuthContext';
import { Icon, Button, useTheme, Select, SelectItem, IndexPath, Input, Text } from '@ui-kitten/components';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps'
import Geolocation from '@react-native-community/geolocation';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { LogBox } from 'react-native';
import { useStore } from '../contexts/StoreContext';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment'
import { addColabParking } from '../controllers/colabParkingController';
import SnackBar from 'react-native-snackbar-component'
import * as env from "../../config"
import { CommonActions } from '@react-navigation/native';


const AddParking = ({ navigation }) => {

    const initialLocation = {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
    }

    const timeOptions = [
        { label: "10 minutos", time: 10 },
        { label: "15 minutos", time: 15 },
        { label: "20 minutos", time: 20 }
    ]

    const theme = useTheme();
    const { state, dispatch } = useStore();
    const { currentUser } = useAuth();
    const [mapRegion, setMapRegion] = useState(initialLocation);
    const [parkingTime, setParkingTime] = useState(new IndexPath(0));
    const [vehicle, setVehicle] = useState({});
    const mapRef = useRef();
    const [currency, setCurrency] = useState(0);
    const [error, setError] = useState('');
    const [currencyStatus, setCurrencyStatus] = useState('basic');

    useEffect(async () => {
        await handleLocationButtonPress();
        try {
            const unsubscribe = navigation.addListener('focus', () => {
                setCurrency(0)
            });
            const defaultVehicle = await firestore()
                .collection('userData')
                .doc(`${currentUser.uid}`)
                .collection('userVehicles')
                .where('primary', '==', true)
                .get()
            dispatch({ type: 'setCurrentVehicle', payload: defaultVehicle.docs[0].data() })
            return unsubscribe;
        } catch (error) {
            console.log(error)
        }

    }, [])

    const renderLocationIcon = (props) => (
        <Icon {...props} name='navigation-2-outline' size='giant' />
    );

    const handleLocationButtonPress = async () => {
        const chckLocationPermission = PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (chckLocationPermission !== PermissionsAndroid.RESULTS.GRANTED) {
            await requestLocationPermission();
        }
        Geolocation.getCurrentPosition((pos) => {
            const crd = pos.coords;
            const newRegion = {
                latitude: crd.latitude,
                longitude: crd.longitude,
                latitudeDelta: mapRegion.latitudeDelta,
                longitudeDelta: mapRegion.longitudeDelta
            }
            setMapRegion(newRegion)
            mapRef.current.animateToRegion(newRegion)
        }, error => alert(JSON.stringify(error)),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
        );
    }

    const requestLocationPermission = async () => {

        try {
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    'title': 'Permisos de Localización',
                    'message': 'Necesitamos permisos de localización para esta funcionalidad '
                }
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("Permiso de localización obtenido exitosamente")
            } else {
                setError("No se tienen permisos de localización")
            }
        } catch (err) {
            alert(err)
        }

    };

    const handleAddParking = async () => {
        const validateData = validateParkingForm();
        console.log(validateData)
        if (validateData) {
            const now = new Date()
            const expiryDate = new Date(now.getTime() + timeOptions[parkingTime.row].time * 60000);
            const parking = {
                lat: mapRegion.latitude,
                lng: mapRegion.longitude,
                creationDate: firestore.FieldValue.serverTimestamp(),
                expiryDate: firestore.Timestamp.fromDate(expiryDate),
                hostUser: currentUser.uid,
                hostVehicle: state.currentVehicle,
                candidateUser: '',
                status: '0',
                price: currency
            }
            firestore()
                .collection('parkings')
                .add(parking)
                .then((docRef) => {
                    const stateParking = {
                        id: docRef.id,
                        ...parking
                    }
                    console.log("Id: "+ docRef.id)
                    console.log("Parking added: " + JSON.stringify(stateParking));
                    dispatch({ type: "addParking", payload: stateParking })
                    dispatch({ type: "setHostCurrentParking", payload: docRef.id })
                    navigation.navigate("HostWaiting")
                });
        }
    }

    const validateParkingForm = () => {
        let result = true;
        setCurrencyStatus('basic')
        if (!mapRegion.latitude || !mapRegion.longitude) {
            setError('Debe definir la ubicación del estacionamiento')
            result = false;
        }
        if (!timeOptions[parkingTime.row].time) {
            setError('Debe definir cuando estará disponible el estacionamiento')
            result = false;
        }
        if (!currency) {
            setError('Debe definir el precio del estacionamiento')
            setCurrencyStatus('danger')
            result = false;
        }
        else {
            if(currency <= 0) {
                setError('El precio del estacionamiento debe ser mayor a 0')
                setCurrencyStatus('danger')
                result = false;
            }
            else if(currency % 1 !== 0) {
                setError('El precio del estacionamiento no puede contener centavos')
                setCurrencyStatus('danger')
                result = false;
            }
        }
        return result;
    }

    return (
        <React.Fragment>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                showsMyLocationButton={true}
                initialRegion={mapRegion}
                showsPointsOfInterest={false}
                customMapStyle={[
                    {
                        "featureType": "poi.business",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "poi.park",
                        "elementType": "labels.text",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    }
                ]}
                onPress={(e) => {
                    setMapRegion({
                        latitude: e.nativeEvent.coordinate.latitude,
                        longitude: e.nativeEvent.coordinate.longitude,
                        latitudeDelta: mapRegion.latitudeDelta,
                        longitudeDelta: mapRegion.longitudeDelta
                    })
                    console.log(e.nativeEvent);
                }}
                onRegionChangeComplete={(region) => setMapRegion(region)}
                ref={mapRef}
            >
                <Marker coordinate={{ latitude: mapRegion.latitude, longitude: mapRegion.longitude }} />
            </MapView>
            <Button style={styles.locationButton} appearance='filled' status='primary' accessoryLeft={renderLocationIcon} onPress={() => handleLocationButtonPress()} />
            <View style={[styles.container, { backgroundColor: theme['background-basic-color-1'] }]}>
                <ScrollView style={styles.form} keyboardShouldPersistTaps='always'>
                    <GooglePlacesAutocomplete
                        style={styles.searchBar}
                        onPress={(data, details = null) => {
                            setMapRegion({
                                ...mapRegion,
                                latitude: details.geometry.location.lat,
                                longitude: details.geometry.location.lng,
                            })
                        }}
                        query={{
                            key: env.GOOGLE_API_KEY,
                            language: 'en',
                        }}
                        fetchDetails={true}
                        GooglePlacesDetailsQuery={{ fields: 'geometry', }}
                        onFail={error => console.error(error)}
                        textInputProps={{
                            InputComp: Input,
                        }}
                        styles={{
                            textInput: {
                                backgroundColor: theme['background-basic-color-2'],
                            },
                        }}
                        placeholder="Ingrese la dirección"
                    />
                    <View style={styles.inputContainer}>
                        <Text style={styles.prefix}>AR$</Text>
                        <Input
                            label="Ingrese precio a recibir por el lugar:"
                            keyboardType="numeric"
                            autoComplete="cc-exp"
                            value={currency}
                            status = {currencyStatus}
                            onChangeText={(value) => setCurrency(value)}
                        />
                    </View>
                    <Select
                        style={styles.formElement}
                        selectedIndex={parkingTime}
                        label="El lugar estará disponible en:"
                        value={timeOptions[parkingTime.row].label}
                        onSelect={index => setParkingTime(index)}>
                        <SelectItem title='10 minutos' />
                        <SelectItem title='15 minutos' />
                        <SelectItem title='20 minutos' />
                    </Select>
                    <View style={styles.vehicleContainer}>
                        <Text style={styles.textElement} category='h6'>
                            Vehículo: {state.currentVehicle.brand} {state.currentVehicle.model}
                        </Text>
                        <Button
                            style={styles.formElement}
                            size='small'
                            appearance='ghost'
                            onPress={() => navigation.navigate("Vehicles")}
                        >
                            CAMBIAR
                        </Button>
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button
                            style={styles.formElement}
                            size='medium'
                            onPress={() => navigation.navigate("Home")}
                        >
                            CANCELAR
                        </Button>
                        <Button
                            style={styles.formElement}
                            size='medium'
                            onPress={() => handleAddParking()}
                        >
                            AGREGAR
                        </Button>
                    </View>
                </ScrollView>
            </View>
            <SnackBar
                visible={error.length > 0}
                textMessage={error}
                actionHandler={() => { setError('') }}
                actionText="OK"
                backgroundColor='#990000'
                accentColor='#ffffff'
                autoHidingTime={5000}
            />
        </React.Fragment>
    )
}

const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
        height: "40%"
    },
    container: {
        top: "40%",
        flex: 1,
        height: "60%"
    },
    vehicleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    form: {
        flex: 1,
        paddingHorizontal: 4,
        paddingVertical: 24,
    },
    formElement: {
        marginTop: 20,
        marginHorizontal: 10,
    },
    textElement: {
        marginTop: 20,
        marginHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBar: {
        height: "10%"
    },
    buttonContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-around",
    },
    locationButton: {
        position: 'absolute',
        top: 200,
        left: 350,
        width: 50,
        height: 50,
        lineHeight: 50,
        borderRadius: 50,
    },
    inputContainer: {
        flexDirection: 'row',
        marginHorizontal: 10,
        borderRadius: 10,
        marginTop: 20,
        alignItems: "center"
    },
    prefix: {
        marginTop: 18,
        paddingHorizontal: 10,
    }

});

export default AddParking
