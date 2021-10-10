import React, { useEffect, useState, useCallback } from 'react'
import { View, StyleSheet, } from 'react-native'
import { Text, Spinner, useTheme, Button, Icon, Input, Layout } from '@ui-kitten/components';
import { useStore } from '../contexts/StoreContext';
import StarRating from 'react-native-star-rating';
import firestore from '@react-native-firebase/firestore';
import { editColabParking } from '../controllers/colabParkingController';


const CandidateRate = ({ navigation, route }) => {

    const theme = useTheme();
    const { mode, afterRate, parkingId } = route.params;
    const { state, dispatch } = useStore();
    const [rating, setRating] = useState();
    const [comment, setComment] = useState('');


    const handleButton = async () => {
        try {
            const updateParking = {
                candidateRating: rating,
                candidateComment: comment,
            }
            await editColabParking(parkingId, updateParking)
            /*const docRef = await firestore()
                .collection('parkings')
                .doc(parkingId)
                .update({
                    candidateRating: rating,
                    candidateComment: comment
                })*/
            navigation.navigate('Home')
        }
        catch (error) {
            console.log(error)
        }
    }

    const handleLaterButton = () => {
        navigation.navigate('Home')
    }

    return (
        <Layout
            style={styles.container}
            level='1'>
            {mode === '1' ?
                <React.Fragment>
                    {afterRate ?
                        null
                        :
                        <Text
                            category='h3'
                            status='info'
                            style={styles.topText}
                        >
                            El anfitrión indicó que finalizó la operación
                        </Text>
                    }
                </React.Fragment>

                :
                <React.Fragment>
                    {afterRate ?
                        null
                        :
                        <Text
                            category='h3'
                            status='info'
                            style={styles.topText}
                        >
                            ¡Listo!
                        </Text>
                    }
                </React.Fragment>
            }
            <View style={styles.buttonContainer}>
                <Text category='h3' status='info' style={styles.secondText}>¿Como salió todo?</Text>
                <StarRating
                    disabled={false}
                    maxStars={5}
                    rating={rating}
                    fullStarColor={theme['color-info-500']}
                    selectedStar={setRating}
                />
                <Input
                    size='large'
                    style={styles.commentInput}
                    multiline={true}
                    maxLength={100}
                    value={comment}
                    onChangeText={setComment} />
            </View>
            <Button
                style={styles.button}
                size='large'
                status='primary'
                onPress={handleButton}
            >ENVIAR
            </Button>
            <Button
                style={styles.button}
                size='large'
                status='primary'
                onPress={handleLaterButton}
            >MAS TARDE
            </Button>
        </Layout >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    topText: {
        marginHorizontal: 30,
    },
    secondText: {
        marginVertical: 20
    },
    buttonContainer: {
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        marginHorizontal: 30,
        marginVertical: 50,
        alignItems: 'center',
    },
    button: {
        margin: 20,
    },
    commentInput: {
        height: 100,
        minWidth: 300,
        maxWidth: 300,
        marginTop: 20
    },

})

export default CandidateRate