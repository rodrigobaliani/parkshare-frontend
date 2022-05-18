import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, List, Text, Tab, TabBar, StyleService, useStyleSheet, useTheme, Button } from '@ui-kitten/components';
import TopHeader from './TopHeader';
import { useAuth } from '../contexts/AuthContext';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment'
import StarRating from 'react-native-star-rating';


const History = ({ navigation }) => {

    const styles = useStyleSheet(themedStyles);
    const theme = useTheme();
    const { currentUser } = useAuth();
    const [selectedTab, setSelectedTab] = useState(0);
    const [parkingHistory, setParkingHistory] = useState({});

    const renderItemHeader = (headerProps, info) => (
        <View {...headerProps}>
            <Text category='h6'>
                {moment(info.item.creationDate.toDate()).format('DD/MM/YYYY')}
            </Text>
        </View>
    );

    const handleRateButtonPress = (parkingId) => {
        console.log("Test")
        selectedTab === 0 ?
            navigation.navigate('HostRate', { mode: '1', parkingId: parkingId, afterRate: true })
            :
            navigation.navigate('CandidateRate', { mode: '1', parkingId: parkingId, afterRate: true })
    }


    const renderItemFooter = (footerProps, info) => (
        <Text {...footerProps}>
            {selectedTab === 0 ?
                <React.Fragment>
                    {info.item.status === '-1' ?
                        <Text>Operación cancelada</Text>
                        :
                        <React.Fragment>
                            {info.item.hostRating ?
                                <StarRating
                                    disabled={true}
                                    maxStars={5}
                                    rating={info.item.hostRating}
                                    fullStarColor='white'
                                />
                                :
                                <Button
                                    size='small'
                                    //onPress={handleRateButtonPress(info.item.id)}
                                    appearance='ghost'
                                    status='control'
                                >
                                    CALIFICAR
                                </Button>
                            }
                        </React.Fragment>
                    }

                </React.Fragment>
                :
                <React.Fragment>
                    {info.item.status === '-1' ?
                        <Text>Operación cancelada</Text>
                        :
                        <React.Fragment>
                            {info.item.candidateRating ?
                                <StarRating
                                    disabled={true}
                                    maxStars={5}
                                    rating={info.item.candidateRating}
                                    fullStarColor='white'
                                />
                                :
                                <Button
                                    size='small'
                                    //onPress={handleRateButtonPress(info.item.id)}
                                    appearance='ghost'
                                    status='control'
                                >
                                    CALIFICAR
                                </Button>
                            }
                        </React.Fragment>
                    }

                </React.Fragment>
            }
        </Text>
    );

    const renderItem = (info) => (
        <Card
            style={styles.item}
            status='basic'
            header={headerProps => renderItemHeader(headerProps, info)}
            footer={footerProps => renderItemFooter(footerProps, info)}>
            {selectedTab === 0 ?
                <React.Fragment>
                    {info.item.hostVehicle && <Text>Tu vehículo: {info.item.hostVehicle.brand} {info.item.hostVehicle.model} | {info.item.hostVehicle.licensePlate}</Text>}
                    {info.item.candidateVehicle && <Text>Candidato: {info.item.candidateVehicle.brand} {info.item.candidateVehicle.model} | {info.item.candidateVehicle.licensePlate}</Text>}
                </React.Fragment>
                :
                <React.Fragment>
                    {info.item.candidateVehicle && <Text>Anfitrión: {info.item.candidateVehicle.brand} {info.item.candidateVehicle.model} | {info.item.candidateVehicle.licensePlate}</Text>}
                    {info.item.hostVehicle && <Text>Tu vehículo: {info.item.hostVehicle.brand} {info.item.hostVehicle.model} | {info.item.hostVehicle.licensePlate}</Text>}
                </React.Fragment>
            }
        </Card>
    );


    useEffect(async () => {
        try {
            const userType = selectedTab === 0 ? 'hostUser' : 'candidateUser'
            const colabParkingHistory = [];
            const colabParkingHistoryDb = await firestore()
                .collection('parkings')
                .where(userType, '==', currentUser.uid)
                .orderBy('creationDate', 'desc')
                .get();
            colabParkingHistoryDb.forEach((doc) => {
                const parking = {
                    id: doc.id,
                    ...doc.data()
                }
                colabParkingHistory.push(parking)
            })
            console.log(colabParkingHistory)
            setParkingHistory(colabParkingHistory)
        } catch (error) {
            console.log(error)
        }
    }, [selectedTab])

    return (
        <React.Fragment>
            <TopHeader screenName='Historial' />
            <TabBar
                selectedIndex={selectedTab}
                onSelect={setSelectedTab}>
                <Tab title='ANFITRIÓN' />
                <Tab title='CANDIDATO' />
            </TabBar>
            <List
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                data={parkingHistory}
                renderItem={renderItem}
            />
        </React.Fragment>
    );
};

const themedStyles = StyleService.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    item: {
        margin: 8,
        backgroundColor: 'color-primary-default',
    },
});

export default History
