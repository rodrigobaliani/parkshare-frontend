import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, PermissionsAndroid, Image, View } from 'react-native'
import { useAuth } from '../contexts/AuthContext';
import { Icon, Button, Modal, Text, Card } from '@ui-kitten/components';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps'
import SnackBar from 'react-native-snackbar-component'
import Geolocation from '@react-native-community/geolocation';
import TopMenu from './TopMenu';
import { useStore } from '../contexts/StoreContext';
import AddParking from './AddParking';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment'




const Home = ({ navigation }) => {

    const initialLocation = {
        latitude: -34.587435,
        longitude: -58.400338,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
    }

    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const { currentUser } = useAuth();
    const [mapRegion, setMapRegion] = useState(initialLocation)
    const [modalInfo, setModalInfo] = useState({ carBrand: '', carModel: '', carPlate: '', expiryTime: '', parkingId: '' })
    const [visibleModal, setVisibleModal] = useState(false)
    const { state, dispatch } = useStore();

    const renderLocationIcon = (props) => (
        <Icon {...props} name='navigation-2-outline' size='giant' />
    );

    const renderAddIcon = (props) => (
        <Icon {...props} name='plus-outline' size='giant' />
    );

    const cardHeader = (props) => (
        <View {...props}>
            <Text category='h6'>{modalInfo.carBrand} {modalInfo.carModel}</Text>
            <Text category='s1'>Patente: {modalInfo.carPlate}</Text>
        </View>
    );

    const cardFooter = (props) => (
        <View {...props} style={[props.style, styles.cardFooterContainer]}>
            <Button
                style={styles.cardFooterControl}
                size='small'
                onPress={() => setVisibleModal(false)}
            >
                CANCELAR
            </Button>
            <Button
                style={styles.cardFooterControl}
                size='small'
                onPress={() => {
                    setVisibleModal(false)
                    Geolocation.getCurrentPosition((pos) => {
                        const crd = pos.coords;
                        const parking = state.parkings.filter((doc) => doc.id === modalInfo.parkingId)
                        console.log(parking)
                        const currentParking = {
                            hostLat: parking[0].lat,
                            hostLng: parking[0].lng,
                            candidateLat: crd.latitude,
                            candidateLng: crd.longitude,
                            latDelta: mapRegion.latitudeDelta,
                            lngDelta: mapRegion.longitudeDelta
                        }
                        console.log(currentParking)
                        dispatch({ type: "setCurrentParking", payload: currentParking })
                        navigation.navigate("RouteParking")
                    }, error => alert(JSON.stringify(error)),
                        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
                    );

                }}
            >
                RESERVAR
            </Button>
        </View>
    );

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

    useEffect(() => {
        firestore()
            .collection('parkings')
            .get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    const parking = {
                        id: doc.id,
                        ...doc.data()
                    }
                    dispatch({ type: "addParking", payload: parking })
                });
            })
        const welcomeMessage = `¡Bienvenido ${currentUser.email} !`
        setMessage(welcomeMessage);
    }, []);


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
        }, error => alert(JSON.stringify(error)),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
        );
    }

    const getParkingInfo = (parkingId) => {
        const parking = state.parkings.filter((doc) => doc.id === parkingId)
        const expiryTime = moment(parking[0].expiryDate).minutes() - moment().minutes()
        setModalInfo({
            carBrand: parking[0].carBrand,
            carModel: parking[0].carModel,
            carPlate: parking[0].carPlate,
            expiryTime: expiryTime,
            parkingId: parkingId
        })
        setVisibleModal(true)
    }

    return (
        <React.Fragment>
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
                onRegionChangeComplete={region => setMapRegion(region)}
            >
                {state.parkings && state.parkings.map((location, index) => {
                    return (
                        <Marker
                            key={index}
                            parkingId={location.id}
                            coordinate={{ latitude: location.lat, longitude: location.lng }}
                            onPress={(e) => getParkingInfo(e._dispatchInstances.memoizedProps.parkingId)}>
                            <Image
                                source={require('../assets/marker.png')}
                                style={{ width: 26, height: 28 }}
                                resizeMode="center"
                            />
                        </Marker>)
                })}
                <Modal
                    visible={visibleModal}
                    backdropStyle={styles.calloutBackdrop}
                    onBackdropPress={() => setVisibleModal(false)}
                >
                    <Card style={styles.card} header={cardHeader} footer={cardFooter}>
                        <Text>
                            Se va en aproximadamente {modalInfo.expiryTime} minutos
                        </Text>
                    </Card>
                </Modal>
            </MapView>
            <TopMenu showMenu={() => navigation.toggleDrawer()} />
            <Button style={styles.locationButton} appearance='filled' status='primary' accessoryLeft={renderLocationIcon} onPress={() => handleLocationButtonPress()} />
            <Button style={styles.addButton} appearance='filled' status='primary' accessoryLeft={renderAddIcon} onPress={() => navigation.navigate("AddParking")} />
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
});

export default Home
