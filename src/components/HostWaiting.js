import React, { useEffect, useState, useCallback } from 'react'
import { View, StyleSheet, } from 'react-native'
import { Text, Spinner, useTheme, Button } from '@ui-kitten/components';
import firestore from '@react-native-firebase/firestore';
import { useStore } from '../contexts/StoreContext';
import { editColabParking } from '../controllers/colabParkingController';

const HostWaiting = ({ navigation, route }) => {

    const theme = useTheme();
    const { state, dispatch } = useStore();
    const { parkingId } = route.params
    const [waitingCandidate, setWaitingCandidate] = useState(true)
    let unsubscribe = {};

    const onSnapshot = useCallback(async (documentSnapshot) => {
        const doc = documentSnapshot.data()
        if (doc.candidateUser !== '' && doc.status === '1') {
            const initialLocation = {
                candidateLat: doc.candidateTripInfo.lat,
                candidateLng: doc.candidateTripInfo.lng,
                candidateLatDelta: doc.candidateTripInfo.latDelta,
                candidateLngDelta: doc.candidateTripInfo.lngDelta,
                hostLat: doc.lat,
                hostLng: doc.lng
            }
            const updateParking = {
                status: '2'
            }
            await editColabParking(parkingId, updateParking)
            /*firestore()
                .collection('parkings')
                .doc(parkingId)
                .update({
                    status: '2'
                })*/
            setWaitingCandidate(false)
            dispatch({ type: "setHostInitialData", payload: initialLocation })
            navigation.navigate('HostGoing', { parkingId: parkingId })
            unsubscribe();
        }
    })

    useEffect(() => {
        unsubscribe = firestore()
            .collection('parkings')
            .doc(parkingId)
            .onSnapshot(onSnapshot)
        // Stop listening for updates when no longer required
        return () => unsubscribe();
    }, []);

    const handleCancelButtonClick = async () => {
        try {
            await firestore()
                .collection('parkings')
                .doc(parkingId)
                .update({
                    status: "-1"
                })
            dispatch({ type: "deleteParking", payload: parkingId })
            navigation.navigate("Home")
        }
        catch (error) {
            console.log(error)
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: theme['background-basic-color-1'] }]}>
            <View style={styles.spinnerContainer}>
                <Spinner style={styles.spinner} size='giant' />
            </View>
            <Text category='h3' status='info'>Buscando usuario candidato</Text>
            <Button
                style={styles.cancelButton}
                size='medium'
                onPress={handleCancelButtonClick}
            >
                CANCELAR
            </Button>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    spinnerContainer: {
        marginHorizontal: '40%'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 30,
    },
    cancelButton: {
        marginTop: 20
    }
})

export default HostWaiting
