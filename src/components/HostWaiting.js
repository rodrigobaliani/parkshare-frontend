import React, { useEffect, useState, useCallback } from 'react'
import { View, StyleSheet, } from 'react-native'
import { Text, Spinner, useTheme, Button } from '@ui-kitten/components';
import firestore from '@react-native-firebase/firestore';
import { useStore } from '../contexts/StoreContext';
import { editColabParking } from '../controllers/colabParkingController';
import { useFocusEffect } from '@react-navigation/native';

let unsubscribe;

const HostWaiting = ({ navigation, route }) => {

    const theme = useTheme();
    const { state, dispatch } = useStore();
    const [waitingCandidate, setWaitingCandidate] = useState(true)
    const [stopListener, setStopListener] = useState(false)

    /*const onSnapshot = useCallback(async (documentSnapshot) => {
        const doc = documentSnapshot.data()
        console.log(doc)
        if(doc.status === '-1') {
            dispatch({ type: "deleteParking", payload: parkingId })
            unsubscribe();
            navigation.navigate("Home")
        }
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
            //await editColabParking(parkingId, updateParking)
            firestore()
                .collection('parkings')
                .doc(parkingId)
                .update({
                    status: '2'
                })
            setWaitingCandidate(false)
            dispatch({ type: "setHostInitialData", payload: initialLocation })
            navigation.navigate('HostGoing', { parkingId: parkingId })
            unsubscribe();
        }
    })*/

    /*useEffect(() => {
        let unsubscribe = firestore()
            .collection('parkings')
            .doc(parkingId)
            .onSnapshot(async (documentSnapshot) => {
                const doc = documentSnapshot.data()
                console.log(doc)
                if(doc.status === '-1') {
                    dispatch({ type: "deleteParking", payload: parkingId })
                    unsubscribe();
                    navigation.navigate("Home")
                }
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
                    firestore()
                        .collection('parkings')
                        .doc(parkingId)
                        .update({
                            status: '2'
                        })
                    setWaitingCandidate(false)
                    dispatch({ type: "setHostInitialData", payload: initialLocation })
                    //unsubscribe();
                    setStopListener(true)
                    navigation.navigate('HostGoing', { parkingId: parkingId })
                }
            })
        if(stopListener) {
            unsubscribe();
            setStopListener(false);
        }
        // Stop listening for updates when no longer required
        return () => unsubscribe();
    }, [navigation]);*/

    useFocusEffect(
        useCallback(() => {
          // Do something when the screen is focused/mount
          console.log("Entro al mount")
          const parkingId = state.hostCurrentParking
          unsubscribe = firestore()
            .collection('parkings')
            .doc(parkingId)
            .onSnapshot(async (documentSnapshot) => {
                console.log('Id: '+ state.hostCurrentParking)
                console.log("Entro al listener " + parkingId)
                const doc = documentSnapshot.data()
                console.log(doc)
                if(doc.status === '-1') {
                    dispatch({ type: "deleteParking", payload: parkingId })
                    dispatch({ type: "setHostCurrentParking", payload: ''})
                    unsubscribe();
                    navigation.navigate("Home")
                }
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
                    firestore()
                        .collection('parkings')
                        .doc(parkingId)
                        .update({
                            status: '2'
                        })
                    setWaitingCandidate(false)
                    dispatch({ type: "setHostInitialData", payload: initialLocation })
                    //unsubscribe();
                    //setStopListener(true)
                    navigation.navigate('HostGoing', { parkingId: parkingId })
                }
            })
    
          return () => {
            // Do something when the screen is unfocused/unmount
            // Useful for cleanup functions
            console.log("Entro al cleanup")
            unsubscribe();
          };
        }, [])
      );
    

    const handleCancelButtonClick = async () => {
        try {
            const updateParking = {
                status: '-1',
            }
            const parkingId = state.hostCurrentParking
            await editColabParking(parkingId, updateParking)
           /*await firestore()
                .collection('parkings')
                .doc(parkingId)
                .update({
                    status: "-1"
                })*/
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
