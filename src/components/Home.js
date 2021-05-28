import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, Platform, PermissionsAndroid, Image, View } from 'react-native'
import { useAuth } from '../contexts/AuthContext';
import { Icon, TopNavigation, TopNavigationAction, Button, Modal, Text, Card } from '@ui-kitten/components';
import MapView, { PROVIDER_GOOGLE, Marker, Callout } from 'react-native-maps'
import SnackBar from 'react-native-snackbar-component'
import Geolocation from '@react-native-community/geolocation';


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
    const [locationLatitude, setLatitude] = useState(initialLocation.latitude)
    const [locationLongitude, setLongitude] = useState(initialLocation.longitude)
    const [locationLatitudeDelta, setLatitudeDelta] = useState(initialLocation.latitudeDelta)
    const [locationLongitudeDelta, setLongitudeDelta] = useState(initialLocation.longitudeDelta)
    const [visibleModal, setVisibleModal] = useState(false)

    const renderMenuIcon = (props) => (
        <Icon {...props} name='menu-outline' size='giant' />
    );

    const renderLocationIcon = (props) => (
        <Icon {...props} name='navigation-2-outline' size='giant' />
    );

    const renderAddIcon = (props) => (
        <Icon {...props} name='plus-outline' size='giant' />
    );

    const menuAction = () => (
        <TopNavigationAction icon={renderMenuIcon} onPress={() => navigation.toggleDrawer()} />
    );

    const cardHeader = (props) => (
        <View {...props}>
            <Text category='h6'>Volkswagen Vento</Text>
            <Text category='s1'>Patente: PSA-457</Text>
        </View>
    );

    const cardFooter = (props) => (
        <View {...props} style={[props.style, styles.cardFooterContainer]}>
            <Button
                style={styles.cardFooterControl}
                size='small'
                status='basic'
                onPress={() => setVisibleModal(false)}
            >
                CANCELAR
          </Button>
            <Button
                style={styles.cardFooterControl}
                size='small'
                onPress={() => setVisibleModal(false)}
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
            setLatitude(crd.latitude);
            setLongitude(crd.longitude);
        }, error => alert(JSON.stringify(error)),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
        );
    }

    const handleRegionChange = (region) => {
        setLatitude(region.latitude);
        setLongitude(region.longitude);
        setLatitudeDelta(region.latitudeDelta);
        setLongitudeDelta(region.longitudeDelta);
    }


    return (
        <React.Fragment>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                showsMyLocationButton={true}
                region={{
                    latitude: locationLatitude,
                    longitude: locationLongitude,
                    latitudeDelta: locationLatitudeDelta,
                    longitudeDelta: locationLongitudeDelta,
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
                onRegionChangeComplete={region => handleRegionChange(region)}
            >
                <Marker coordinate={{ latitude: -34.587435, longitude: -58.400338 }} onPress={() => setVisibleModal(true)}>
                    <Image
                        source={require('../assets/marker.png')}
                        style={{ width: 26, height: 28 }}
                        resizeMode="center"
                    />
                </Marker>
                <Marker coordinate={{ latitude: -34.590492573717675, longitude: -58.39541041866849 }} onPress={() => setVisibleModal(true)} >
                    <Image
                        source={require('../assets/marker.png')}
                        style={{ width: 26, height: 28 }}
                        resizeMode="center"
                    />
                </Marker>
                <Marker coordinate={{ latitude: -34.58789583523734, longitude: -58.401826262111015 }} onPress={() => setVisibleModal(true)}>
                    <Image
                        source={require('../assets/marker.png')}
                        style={{ width: 26, height: 28 }}
                        resizeMode="center"
                    />
                </Marker>
                <Modal
                    visible={visibleModal}
                    backdropStyle={styles.calloutBackdrop}
                    onBackdropPress={() => setVisibleModal(false)}
                >
                    <Card style={styles.card} header={cardHeader} footer={cardFooter}>
                        <Text>
                            Se va en aproximadamente 10 minutos
                        </Text>
                    </Card>
                </Modal>
            </MapView>
            <TopNavigation accessoryLeft={menuAction} style={styles.header} />
            <Button style={styles.locationButton} appearance='filled' status='primary' accessoryLeft={renderLocationIcon} onPress={() => handleLocationButtonPress()} />
            <Button style={styles.addButton} appearance='filled' status='primary' accessoryLeft={renderAddIcon} />
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
    },
});

export default Home
