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

const RouteParking = ({ navigation }) => {

    const initialLocation = {
        latitude: -34.587435,
        longitude: -58.400338,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
    }

    const initialCoordinates = {
        latitude: -34.587435,
        longitude: -58.400338,
    }

    const theme = useTheme();
    const [mapRegion, setMapRegion] = useState(initialLocation);
    const [hostCoordinates, setHostCoordinates] = useState(initialCoordinates);
    const [candidateCoordinates, setCandidateCoordinates] = useState(initialCoordinates);
    const [tripDuration, setTripDuration] = useState(0);
    const [tripDistance, setTripDistance] = useState(0);
    const [loadingTripInfo, setLoadingTripInfo] = useState(true);
    const mapRef = useRef();
    const { width, height } = Dimensions.get('window');
    const { state, dispatch } = useStore();



    useEffect(() => {
        const region = {
            latitude: state.currentParking.candidateLat,
            longitude: state.currentParking.candidateLng,
            latitudeDelta: state.currentParking.latDelta,
            longitudeDelta: state.currentParking.lngDelta,
        }
        setMapRegion(region)
        const hostCoordinates = {
            latitude: state.currentParking.hostLat,
            longitude: state.currentParking.hostLng
        }
        setHostCoordinates(hostCoordinates)
        const candidateCoordinates = {
            latitude: state.currentParking.candidateLat,
            longitude: state.currentParking.candidateLng
        }
        setCandidateCoordinates(candidateCoordinates)
    }, []);


    return (
        <React.Fragment>
            {state.currentParking &&
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    showsMyLocationButton={true}
                    region={mapRegion}
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
                        origin={candidateCoordinates}
                        destination={hostCoordinates}
                        apikey="AIzaSyBdTNWWsw0iktleWC1qKn3uVMmW-CfGqzQ"
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
                            setTripDistance(result.distance)
                            setTripDuration(result.duration)
                            setLoadingTripInfo(false)
                        }}
                    />
                    <Marker coordinate={candidateCoordinates}>
                        <Image
                            source={require('../assets/marker.png')}
                            style={{ width: 26, height: 28 }}
                            resizeMode="center"
                        />
                    </Marker>
                    <Marker coordinate={hostCoordinates}>
                        <Image
                            source={require('../assets/marker.png')}
                            style={{ width: 26, height: 28 }}
                            resizeMode="center"
                        />
                    </Marker>
                </MapView>
            }
            <View style={[styles.container, { backgroundColor: theme['background-basic-color-1'] }]}>
                {!loadingTripInfo &&
                    <View style={styles.textContainer}>
                        <Text style={styles.textInfo} category='h5' status='info'>Llegás en {Math.round(tripDuration)} minutos</Text>
                        <Text style={styles.textInfo} category='h6'>Distancia: {Math.round(tripDistance * 10) / 10} km</Text>
                    </View>
                }
                <View style={styles.buttonContainer}>
                    <Button size='small' onPress={() => navigation.navigate("Home")}>CANCELAR</Button>
                    <Button size='small'>CONFIRMAR</Button>
                </View>
            </View>
        </React.Fragment>
    )
}
const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
        height: '80%'
    },
    container: {
        top: "80%",
        flex: 1,
        height: "20%",
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
    }
})

export default RouteParking
