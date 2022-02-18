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
import { editColabParking } from '../controllers/colabParkingController';
import * as env from "../../config"

const RouteParking = ({ navigation }) => {

    const initialLocation = {
        latitude: -34.587435,
        longitude: -58.400338,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
    }


    const theme = useTheme();
    const mapRef = useRef();
    const { width, height } = Dimensions.get('window');
    const { state, dispatch } = useStore();
    const { currentUser } = useAuth();

    const cardTypes = {
        visa: 'Visa',
        master: 'MasterCard',
        amex: 'American Express'
    }

    const handleCancelButtonClick = () => {
        const cleanParking = {
            hostLat: initialLocation.latitude,
            hostLng: initialLocation.longitude,
            candidateLat: initialLocation.latitude,
            candidateLng: initialLocation.longitude,
            latDelta: initialLocation.latitudeDelta,
            lngDelta: initialLocation.longitudeDelta,
            distance: 0,
            duration: 0,
        }
        dispatch({ type: "setCurrentParking", payload: cleanParking })
        navigation.navigate("Home")
    }

    const handleConfirmButtonClick = async () => {
        try {
            const candidateTripInfo = {
                lat: state.currentParking.candidateLat,
                lng: state.currentParking.candidateLng,
                latDelta: state.currentParking.latDelta,
                lngDelta: state.currentParking.lngDelta,
                distance: state.currentParking.distance,
                duration: state.currentParking.duration
            }
            const updateParking = {
                candidateUser: currentUser.uid,
                status: '1',
                candidateTripInfo: candidateTripInfo,
                paymentMethod: state.currentPaymentMethod,
                candidateVehicle: state.currentVehicle
            }
            await editColabParking(state.currentParking.parkingId, updateParking)
            /*await firestore()
                .collection('parkings')
                .doc(state.currentParking.parkingId)
                .update({
                    candidateUser: currentUser.uid,
                    status: '1',
                    candidateTripInfo: candidateTripInfo,
                    paymentMethod: state.currentPaymentMethod,
                    candidateVehicle: state.currentVehicle
                })*/
            navigation.navigate("CandidateGoing", { parkingId: state.currentParking.parkingId })
        }
        catch (error) {
            console.log(error)
        }
    }

    const handleChangePaymentButtonClick = () => {
        navigation.navigate("PaymentMethods")
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
                            latitude: state.currentParking.candidateLat,
                            longitude: state.currentParking.candidateLng,
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
                            apikey={env.GOOGLE_API_KEY}
                            strokeWidth={4}
                            strokeColor="#111111"
                            onReady={result => {
                                mapRef.current.fitToCoordinates(result.coordinates, {
                                    edgePadding: {
                                        right: (width / 20),
                                        bottom: (height / 20),
                                        left: (width / 20),
                                        top: (height / 20),
                                    }
                                })

                            }}
                        />
                        <Marker coordinate={{
                            latitude: state.currentParking.candidateLat,
                            longitude: state.currentParking.candidateLng
                        }}>
                            <Image
                                source={require('../assets/marker.png')}
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
                            <Text style={styles.textInfo} category='h5' status='info'>Llegás en {state.currentParking.duration}</Text>
                            <Text style={styles.textInfo} category='h6'>Distancia: {state.currentParking.distance}</Text>
                            <View style={styles.paymentContainer}>
                                <Text style={styles.textInfo} category='h6'>Pago: {cardTypes[`${state.currentPaymentMethod.type}`]} {state.currentPaymentMethod.number.substring(0, 4)}...</Text>
                                <Button size='tiny' onPress={handleChangePaymentButtonClick} appearance='ghost'>CAMBIAR</Button>
                            </View>
                        </View>
                        <View style={styles.buttonContainer}>
                            <Button size='small' onPress={handleCancelButtonClick}>CANCELAR</Button>
                            <Button size='small' onPress={handleConfirmButtonClick}>CONFIRMAR</Button>
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
        height: '75%'
    },
    container: {
        top: "75%",
        flex: 1,
        height: "25%",
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
        justifyContent: 'space-between',
        marginHorizontal: 30,
    },
    paymentContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    }
})

export default RouteParking
