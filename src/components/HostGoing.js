import React, { useState, useEffect, useRef, useCallback } from 'react'
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
import { editColabParking } from '../controllers/colabParkingController';
import * as env from "../../config"

const HostGoing = ({ navigation, route }) => {

    const [currentLatitude, setCurrentLatitude] = useState(0);
    const [currentLongitude, setCurrentLongitude] = useState(0);
    const [currentLatitudeDelta, setCurrentLatitudeDelta] = useState(0);
    const [currentLongitudeDelta, setCurrentLongitudeDelta] = useState(0);
    const [candidateVehicle, setCandidateVehicle] = useState({ model: '', brand: '', licensePlate: '' })
    const [currentDistance, setCurrentDistance] = useState('');
    const [currentDuration, setCurrentDuration] = useState('');
    const [nearDestination, setNearDestination] = useState(false);

    const theme = useTheme();
    const mapRef = useRef();
    const { width, height } = Dimensions.get('window');
    const { state, dispatch } = useStore();
    const { currentUser } = useAuth();
    const { parkingId } = route.params
    let unsubscribe = {};

    const onSnapshot = useCallback((documentSnapshot) => {
        const data = documentSnapshot.data().candidateTripInfo;
        const status = documentSnapshot.data().status
        setCurrentLongitude(data.lng);
        setCurrentLatitude(data.lat);
        setCurrentLongitudeDelta(data.lngDelta)
        setCurrentLatitudeDelta(data.latDelta)
        setCurrentDuration(data.duration)
        setCurrentDistance(data.distance)
        setCandidateVehicle(documentSnapshot.data().candidateVehicle)
        if (status === '3') {
            setNearDestination(true)
        }
        if (status === '4') {
            dispatch({ type: "deleteParking", payload: parkingId })
            navigation.navigate('HostRate', { mode: '1', parkingId: parkingId, afterRate: false })
            unsubscribe()
        }
    })

    useEffect(() => {
        unsubscribe = firestore()
            .collection('parkings')
            .doc(parkingId)
            .onSnapshot(onSnapshot)
        return () => unsubscribe()
    }, [navigation]);

    const handleEndButtonClick = async () => {
        try {
            const updateParking = {
                status: '5',
            }
            await editColabParking(parkingId, updateParking)
            /*await firestore()
                .collection('parkings')
                .doc(parkingId)
                .update({
                    status: '5'
                })*/
            dispatch({ type: "deleteParking", payload: parkingId })
            navigation.navigate('HostRate', { mode: '2', parkingId: parkingId, afterRate: false })
        }
        catch (error) {
            console.log(error)
        }
    }

    return (
        <React.Fragment>
            <React.Fragment>
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    showsMyLocationButton={true}
                    region={{
                        latitude: currentLatitude,
                        longitude: currentLongitude,
                        latitudeDelta: currentLatitudeDelta,
                        longitudeDelta: currentLongitudeDelta,
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
                            latitude: state.hostInitialData.candidateLat,
                            longitude: state.hostInitialData.candidateLng
                        }}
                        destination={{
                            latitude: state.hostInitialData.hostLat,
                            longitude: state.hostInitialData.hostLng,
                        }}
                        apikey={env.GOOGLE_API_KEY}
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
                        latitude: state.hostInitialData.hostLat,
                        longitude: state.hostInitialData.hostLng
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
                            <Text style={styles.textInfo} category='h4' status='info'>Candidato en camino</Text>
                            :
                            <Text style={styles.textInfo} category='h4' status='info'>Candidato llegando a destino</Text>
                        }
                        <Text style={styles.textInfo} category='h5' status='info'>Llega en {currentDuration}</Text>
                        <Text style={styles.textInfo} category='h5'>Distancia: {currentDistance}</Text>
                        <Text style={styles.textInfo} category='h6'>Candidato: {candidateVehicle.brand} {candidateVehicle.model} - {candidateVehicle.licensePlate}</Text>

                    </View>
                    <View style={styles.buttonContainer}>
                        <Button size='small'>CANCELAR</Button>
                        {nearDestination ? <Button size='small' onPress={handleEndButtonClick}>FINALIZAR</Button> : <></>}
                    </View>
                </View>
            </React.Fragment>
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

export default HostGoing
