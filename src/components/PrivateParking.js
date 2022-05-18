import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, PermissionsAndroid, Image, View } from 'react-native'
import { useAuth } from '../contexts/AuthContext';
import { Icon, Button, Modal, Text, Card, Spinner, Divider, Layout } from '@ui-kitten/components';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps'
import SnackBar from 'react-native-snackbar-component'
import Geolocation from '@react-native-community/geolocation';
import TopMenu from './TopMenu';
import { useStore } from '../contexts/StoreContext';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment'

const PrivateParking = ({ navigation }) => {

    const initialLocation = {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
    }

    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const { currentUser } = useAuth();
    const [mapRegion, setMapRegion] = useState(initialLocation)
    const [modalInfo, setModalInfo] = useState({ name: '', closeHour: 0, openHour: 0, pricePerDay: 0, parkingId: '' ,
                                                streetAddress: '', pricePerHour: 0})
    const [visibleModal, setVisibleModal] = useState(false)
    const { state, dispatch } = useStore();
    const mapRef = useRef();

    const renderLocationIcon = (props) => (
        <Icon {...props} name='navigation-2-outline' size='giant' />
    );

    const renderAddIcon = (props) => (
        <Icon {...props} name='plus-outline' size='giant' />
    );

    const cardHeader = (props) => (
        <View style = {styles.name}>
            <Text category='h3' status='control'>{modalInfo.name}</Text>
        </View>
    );
    
    const cardFooter = (props) => (
        <View {...props} style={[props.style, styles.cardFooterContainer]}>
            <Button
                style={styles.cardFooterControl}
                size='small'
                onPress={() => setVisibleModal(false)}
            >
                Cerrar
            </Button>
        </View>
    );

    const handleBookingButtonPress = async () => {
        setVisibleModal(false)
        Geolocation.getCurrentPosition(async (pos) => {
            const crd = pos.coords;
            const parking = state.parkings.filter((doc) => doc.id === modalInfo.parkingId)
            await setConfirmParkingData(crd.latitude, crd.longitude, parking[0].lat, parking[0].lng)
            navigation.navigate("RouteParking")

        }, error => alert(JSON.stringify(error)),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
        );
    }

    const setConfirmParkingData = async (lat1, lng1, lat2, lng2) => { // Pass Latitude & Longitude of both points as a parameter
        const urlToFetchDistance = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=' + lat1 + ',' + lng1
            + '&destinations=' + lat2 + '%2C' + lng2
            + '&key=' + "AIzaSyBdTNWWsw0iktleWC1qKn3uVMmW-CfGqzQ";
        try {
            let res = await fetch(urlToFetchDistance)
            res = await res.json();
            const currentParking = {
                hostLat: lat2,
                hostLng: lng2,
                candidateLat: lat1,
                candidateLng: lng1,
                latDelta: mapRegion.latitudeDelta,
                lngDelta: mapRegion.longitudeDelta,
                distance: res.rows[0].elements[0].distance.text,
                duration: res.rows[0].elements[0].duration.text,
                parkingId: modalInfo.parkingId
            }
            dispatch({ type: "setCurrentParking", payload: currentParking })
        }
        catch (error) {
            console.log(error)
        }
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

useEffect(async () => {
    await handleLocationButtonPress();
    let privatePark = [];
    const unsubscribe =
        (await firestore()
        .collection('privateParkings').get())
        .forEach((doc) => {
                    const parking = {
                        id: doc.id,
                        ...doc.data()
                    }
                        privatePark.push(parking);
                    
                }
            );
            dispatch({ type: "privateParkings", payload: privatePark })
    return () => unsubscribe();
}, [currentUser]); 


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

    const test = () => {
        console.log(state.privateParkings);
       }
    
    const getParkingInfo = (parkingId) => {
        const parking = state.privateParkings.filter((doc) => doc.id === parkingId);
        setModalInfo({
            parkingId : parking[0].id,
            name: parking[0].name,
            openHour: parking[0].openHour,
            closeHour: parking[0].closeHour,
            pricePerDay: parking[0].pricePerDay,
            pricePerHour: parking[0].pricePerHour,
            streetAddress: parking[0].streetAddress
        })
        setVisibleModal(true)
    }

    return (
        <React.Fragment>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                showsMyLocationButton={true}
                initialRegion={initialLocation}
                showsPointsOfInterest={false}
                showsUserLocation={true}
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
                onRegionChangeComplete={region => setMapRegion(region)}
                ref={mapRef}
            >
                {state.privateParkings && state.privateParkings.map((location, index) => {
                    return (
                        <React.Fragment key={index}>
                                <Marker
                                    key={index}
                                    parkingId={location.id}
                                    coordinate={{ latitude: location.lat, longitude: location.lng }}
                                    onPress={(e) => getParkingInfo(e._dispatchInstances.memoizedProps.parkingId)}>
                                    <Image
                                        source={require('../assets/marker-blue.png')}
                                        style={{ width: 26, height: 28 }}
                                        resizeMode="center"
                                    />
                                </Marker>
                        </React.Fragment>)
                })}
                <Modal
                    visible={visibleModal}
                    backdropStyle={styles.calloutBackdrop}
                    onBackdropPress={() => setVisibleModal(false)}
                >
                <Card style={styles.card} header={cardHeader} footer={cardFooter}>
                    <Layout styles={styles.name} level = '1'>
                        <Text category='h6'>Abierto desde: {modalInfo.openHour}hs hasta: {modalInfo.closeHour}hs</Text>
                        <Text category='h6'>Dirección: {modalInfo.streetAddress}</Text>
                        <Text category='h6'>Precio por dia: {modalInfo.pricePerDay}</Text>
                        <Text category='h6'>Precio por hora: {modalInfo.pricePerHour}</Text>
                    </Layout> 
                </Card>
                </Modal>
            </MapView>
            <TopMenu showMenu={() => navigation.toggleDrawer()} />
            <Button style={styles.locationButton} appearance='filled' status='primary' accessoryLeft={renderLocationIcon} onPress={() => handleLocationButtonPress()} />
            <SnackBar
                visible={message.length > 0}
                textMessage={message}
                actionHandler={() => { setMessage('') }}
                actionText="OK"
                autoHidingTime={5000}
            />
            <SnackBar
                visible={error.length > 0}
                textMessage={error}
                actionHandler={() => { setError('') }}
                actionText="OK"
                backgroundColor='#990000'
                accentColor='#ffffff'
                autoHidingTime={5000}
            />
        </React.Fragment >

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 50,
        backgroundColor: 'transparent'
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    locationButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 50,
        height: 50,
        lineHeight: 50,
        borderRadius: 50,
    },
    addButton: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        width: 50,
        height: 50,
        lineHeight: 50,
        borderRadius: 50,
    },
    calloutBackdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    card: {
        flex: 1,
        margin: 2,
    },
    cardFooterContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    cardFooterControl: {
        marginHorizontal: 2,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    name: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 2,
        paddingBottom: 25,
        paddingTop: 25,
        backgroundColor: '#3366FF'
      }
});

export default PrivateParking
