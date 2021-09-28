import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, PermissionsAndroid, Image, View, ScrollView, FlatList, Dimensions } from 'react-native'
import { useAuth } from '../contexts/AuthContext';
import { Icon, TopNavigation, TopNavigationAction, Button, Modal, Text, Card, useTheme, Select, SelectItem, IndexPath, Input } from '@ui-kitten/components';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps'
import SnackBar from 'react-native-snackbar-component'
import Geolocation from '@react-native-community/geolocation';
import { ScrollView as GestureHandlerScrollView } from 'react-native-gesture-handler'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { LogBox } from 'react-native';
import { useStore } from '../contexts/StoreContext';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment'
import MapViewDirections from 'react-native-maps-directions';
import TopMenu from './TopMenu';

const CandidateGoing = ({ navigation, route }) => {

    const [currentLatitude, setCurrentLatitude] = useState(0);
    const [currentLongitude, setCurrentLongitude] = useState(0);
    const [currentTimestamp, setCurrentTimestamp] = useState(0);
    const [currentDistance, setCurrentDistance] = useState('');
    const [currentDuration, setCurrentDuration] = useState('');
    const [nearDestination, setNearDestination] = useState(false);

    const theme = useTheme();
    const mapRef = useRef();
    const { width, height } = Dimensions.get('window');
    const { state, dispatch } = useStore();
    const { currentUser } = useAuth();
    const { parkingId } = route.params

    useEffect(() => {
        const watchId = Geolocation.watchPosition(
            async (position) => {
                setCurrentLongitude(position.coords.longitude);
                setCurrentLatitude(position.coords.latitude);
                setCurrentTimestamp(position.timestamp);
                const urlToFetchDistance = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=' + position.coords.latitude + ',' + position.coords.longitude
                    + '&destinations=' + state.currentParking.hostLat + '%2C' + state.currentParking.hostLng
                    + '&key=' + "AIzaSyBdTNWWsw0iktleWC1qKn3uVMmW-CfGqzQ";
                console.log(urlToFetchDistance)
                try {
                    let res = await fetch(urlToFetchDistance)
                    res = await res.json();
                    console.log(res.rows[0].elements[0])
                    const distanceMeters = res.rows[0].elements[0].distance.value
                    const distanceText = res.rows[0].elements[0].distance.text
                    const durationText = res.rows[0].elements[0].duration.text
                    setCurrentDistance(distanceText)
                    setCurrentDuration(durationText)
                    const candidateTripInfo = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        latDelta: state.currentParking.latDelta,
                        lngDelta: state.currentParking.lngDelta,
                        distance: distanceText,
                        duration: durationText,
                        timestamp: position.timestamp
                    }
                    if (distanceMeters <= 400 && distanceMeters >= 100) {
                        if (!nearDestination) setNearDestination(true)
                        await firestore()
                            .collection('parkings')
                            .doc(parkingId)
                            .update({
                                candidateTripInfo: candidateTripInfo,
                                status: '3'
                            })

                    }
                    else if (distanceMeters < 100) {
                        await firestore()
                            .collection('parkings')
                            .doc(parkingId)
                            .onSnapshot((documentSnapshot => {
                                if (documentSnapshot.data().status === '5') {
                                    dispatch({ type: "deleteParking", payload: parkingId })
                                    navigation.navigate('CandidateRate', { mode: '1', parkingId: parkingId, afterRate: false })
                                }
                                else {
                                    firestore()
                                        .collection('parkings')
                                        .doc(parkingId)
                                        .update({
                                            candidateTripInfo: candidateTripInfo,
                                        })
                                }

                            }))

                    }
                    else {
                        await firestore()
                            .collection('parkings')
                            .doc(parkingId)
                            .update({
                                candidateTripInfo: candidateTripInfo,
                                status: '2'

                            })
                    }
                }
                catch (error) {
                    console.log(error)
                }
            },
            error => alert(error.message),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000, distanceFilter: 100 }
        );

        return () => Geolocation.clearWatch(watchId);
    }, []);

    const handleEndButtonClick = async () => {
        try {
            await firestore()
                .collection('parkings')
                .doc(parkingId)
                .update({
                    status: '4'
                })
            dispatch({ type: "deleteParking", payload: parkingId })
            navigation.navigate('CandidateRate', { mode: '2', parkingId: parkingId, afterRate: false })
        }
        catch (error) {
            console.log(error)
        }
    }

    return (
        <React.Fragment>
            {state.currentParking &&
                <React.Fragment>
                    <MapView
                        provider={PROVIDER_GOOGLE}
                        style={styles.map}
                        showsMyLocationButton={true}
                        region={{
                            latitude: currentLatitude,
                            longitude: currentLongitude,
                            latitudeDelta: state.currentParking.latDelta,
                            longitudeDelta: state.currentParking.lngDelta,
                        }}
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
                        ref={mapRef}
                    >
                        <MapViewDirections
                            origin={{
                                latitude: state.currentParking.candidateLat,
                                longitude: state.currentParking.candidateLng
                            }}
                            destination={{
                                latitude: state.currentParking.hostLat,
                                longitude: state.currentParking.hostLng
                            }}
                            apikey="AIzaSyBdTNWWsw0iktleWC1qKn3uVMmW-CfGqzQ"
                            strokeWidth={4}
                            strokeColor="#111111"
                        />
                        <Marker coordinate={{
                            latitude: currentLatitude,
                            longitude: currentLongitude
                        }}>
                            <Image
                                source={require('../assets/car.png')}
                                style={{ width: 26, height: 28 }}
                                resizeMode="center"
                            />
                        </Marker>
                        <Marker coordinate={{
                            latitude: state.currentParking.hostLat,
                            longitude: state.currentParking.hostLng
                        }}>
                            <Image
                                source={require('../assets/marker.png')}
                                style={{ width: 26, height: 28 }}
                                resizeMode="center"
                            />
                        </Marker>
                    </MapView>

                    <View style={[styles.container, { backgroundColor: theme['background-basic-color-1'] }]}>
                        <View style={styles.textContainer}>
                            {!nearDestination ?
                                <Text style={styles.textInfo} category='h4' status='info'>Estás en camino</Text>
                                :
                                <Text style={styles.textInfo} category='h4' status='info'>Llegando a destino</Text>
                            }
                            <Text style={styles.textInfo} category='h5' status='info'>Llegás en {currentDuration}</Text>
                            <Text style={styles.textInfo} category='h5'>Distancia: {currentDistance}</Text>
                            <Text style={styles.textInfo} category='h6'>Anfitrión: {state.currentParking.hostVehicle.brand} {state.currentParking.hostVehicle.model} - {state.currentParking.hostVehicle.licensePlate}</Text>
                        </View>
                        <View style={styles.buttonContainer}>
                            <Button size='small'>CANCELAR</Button>
                            {nearDestination ? <Button size='small' onPress={handleEndButtonClick}>FINALIZAR</Button> : <></>}
                        </View>
                    </View>
                </React.Fragment>
            }
        </React.Fragment>

    )
}
const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
        height: '70%'
    },
    container: {
        top: "70%",
        flex: 1,
        height: "30%",
    },
    textContainer: {
        marginVertical: 10,
    },
    textInfo: {
        marginHorizontal: 10,
        textAlign: 'center'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginHorizontal: 30,
        marginVertical: 10
    }
})

export default CandidateGoing
