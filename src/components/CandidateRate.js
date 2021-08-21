import React, { useEffect, useState, useCallback } from 'react'
import { View, StyleSheet, } from 'react-native'
import { Text, Spinner, useTheme, Button, Icon } from '@ui-kitten/components';
import { useStore } from '../contexts/StoreContext';


const CandidateRate = ({ navigation, route }) => {

    const theme = useTheme();
    const { mode, parkingId } = route.params;
    const { state, dispatch } = useStore();

    const handleButton = () => {

        navigation.navigate('Home')
    }

    return (
        <View style={[styles.container, { backgroundColor: theme['background-basic-color-1'] }]}>
            {mode === '1' ?
                <Text category='h5' status='info'>El anfitrión indicó que finalizó la operación</Text>
                :
                <Text category='h3' status='info'>¡Listo!</Text>
            }
            <Text category='h3' status='info'>¿Salió todo bien?</Text>
            <View style={styles.buttonContainer}>

                <Button
                    style={styles.button}
                    size='large'
                    onPress={handleButton}
                >NO
                </Button>
                <Button
                    style={styles.button}
                    size='large'
                    status='primary'
                    onPress={handleButton}
                >SI
                </Button>
            </View>
        </View >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginHorizontal: 30,
    },
    button: {
        margin: 20,

    }
})

export default CandidateRate