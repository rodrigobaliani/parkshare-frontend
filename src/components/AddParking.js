import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, PermissionsAndroid, View, ScrollView } from 'react-native'
import { useAuth } from '../contexts/AuthContext';
import { Icon, Button, useTheme, Select, SelectItem, IndexPath, Input } from '@ui-kitten/components';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps'
import Geolocation from '@react-native-community/geolocation';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { LogBox } from 'react-native';
import { useStore } from '../contexts/StoreContext';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment'



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
    const mapRef = useRef();

    useEffect(async () => {
        await handleLocationButtonPress();
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

    const handleAddParking = () => {
        const now = new Date()
        const expiryDate = new Date(now.getTime() + timeOptions[parkingTime.row].time * 60000);
        const parking = {
            lat: mapRegion.latitude,
            lng: mapRegion.longitude,
            creationDate: firestore.FieldValue.serverTimestamp(),
            expiryDate: firestore.Timestamp.fromDate(expiryDate),
            hostUser: currentUser.uid,
            carBrand: "Volkswagen",
            carModel: "Vento",
            carPlate: "PIH-372",
            candidateUser: '',
            status: '0'
        }
        firestore()
            .collection('parkings')
            .add(parking)
            .then((docRef) => {
                console.log("Parking added: " + JSON.stringify(parking));
                const stateParking = {
                    id: docRef.id,
                    ...parking
                }
                dispatch({ type: "addParking", payload: stateParking })
                navigation.navigate("HostWaiting", { parkingId: docRef.id })
            });
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
                        placeholder='Search'
                        onPress={(data, details = null) => {
                            // 'details' is provided when fetchDetails = true
                            console.log(data)
                            setMapRegion({
                                ...mapRegion,
                                latitude: details.geometry.location.lat,
                                longitude: details.geometry.location.lng,
                            })
                        }}
                        query={{
                            key: 'AIzaSyBdTNWWsw0iktleWC1qKn3uVMmW-CfGqzQ',
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
                    <Input
                        style={styles.formElement}
                        value="$50"
                        label="Ganancia"
                        disabled={true}
                    />
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
        </React.Fragment>
    )
}

const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
        height: "50%"
    },
    container: {
        top: "50%",
        flex: 1,
        height: "50%"
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
        top: 270,
        left: 350,
        width: 50,
        height: 50,
        lineHeight: 50,
        borderRadius: 50,
    },

});

export default AddParking
