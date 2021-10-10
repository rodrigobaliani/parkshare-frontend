import React, { useEffect, useState } from 'react'
import { View, Image, TouchableWithoutFeedback } from 'react-native'
import { Button, Card, List, StyleService, Text, useStyleSheet, Icon, Toggle } from '@ui-kitten/components';
import TopHeader from './TopHeader';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { getUserPaymentMethods, editPaymentMethod, deletePaymentMethod } from '../controllers/paymentMethodController';

const PaymentMethods = ({ navigation }) => {

    const styles = useStyleSheet(themedStyles);
    const { currentUser } = useAuth();
    const { state, dispatch } = useStore();

    const renderTogglePrimary = (id, checked) => (
        <Toggle checked={checked} disabled={checked} onChange={() => handlePrimaryCardChange(id)} cardId={id}>
            {checked ? "Actual" : "Usar"}
        </Toggle>
    );

    const renderDeleteIcon = (props) => (
        <Icon {...props} name='trash-outline' />
    );

    const renderCardItem = (info) => (
        <View style={styles.cardItem}>
            <View style={styles.cardLogoContainer}>
                {info.item.type === 'visa' &&
                    <Image
                        style={styles.cardLogo}
                        source={require('../assets/visa-logo.png')}
                    />
                }
                {info.item.type === 'master' &&
                    <Image
                        style={styles.cardLogo}
                        source={require('../assets/master-logo.png')}
                    />
                }
                {info.item.type === 'amex' &&
                    <Image
                        style={styles.cardLogo}
                        source={require('../assets/amex-logo.png')}
                    />
                }
                <Button
                    style={styles.cardOptionsButton}
                    appearance='ghost'
                    status='control'
                    onPress={() => handleDeleteCard(info.item.id)}
                    accessoryLeft={() => renderTogglePrimary(info.item.id, info.item.primary)}
                    accessoryRight={renderDeleteIcon}
                />
            </View>
            <Text
                style={styles.cardNumber}
                category='h6'
                status='control'>
                {info.item.number}
            </Text>
            <View style={styles.cardNameContainer}>
                <Text
                    style={styles.cardDetailsLabel}
                    category='p2'
                    status='control'>
                    Titular
                </Text>
                <Text
                    category='s1'
                    status='control'>
                    {info.item.cardholderName}
                </Text>
            </View>
            <View style={styles.cardExpirationContainer}>
                <Text
                    style={styles.cardDetailsLabel}
                    category='p2'
                    status='control'>
                    Vencimiento
                </Text>
                <Text
                    category='s1'
                    status='control'>
                    {info.item.expireDate}
                </Text>
            </View>
        </View>
    );

    const renderFooter = () => (
        <Card style={styles.placeholderCard} onPress={handlePlaceholderButtonPress}>
            <View>
                <Icon name='credit-card' style={styles.creditCardIcon} />
                <Text
                    appearance='hint'
                    category='s1'>
                    Agregar Nueva Tarjeta
                </Text>
            </View>
        </Card>
    );

    const handlePrimaryCardChange = async (id) => {
        const cards = state.paymentMethods;
        cards.forEach(async (card) => {
            if (card.id === id) {
                card.primary = !card.primary;
                try {
                    await editPaymentMethod(currentUser.uid, card)
                    dispatch({ type: 'setCurrentPaymentMethod', payload: card })
                } catch (error) {
                    console.log(error)
                }
            }
            else {
                if (card.primary) {
                    card.primary = !card.primary
                    try {
                        await editPaymentMethod(currentUser.uid, card)
                    } catch (error) {
                        console.log(error)
                    }
                }
            }
        })
        dispatch({ type: 'setPaymentMethods', payload: cards })
    }

    const handleDeleteCard = async (id) => {
        var newPrimary = false;
        const deleteCard = state.paymentMethods.filter(c => c.id === id)
        if (deleteCard[0].primary) {
            newPrimary = true;
        }
        const cards = state.paymentMethods.filter(c => c.id !== id)
        try {
            if (newPrimary && cards.length > 0) {
                cards[0].primary = true;
                await editPaymentMethod(currentUser.uid, cards[0])
            }
            await deletePaymentMethod(currentUser.uid, id)
        } catch (error) {
            console.log(error)
        }
        dispatch({ type: 'setPaymentMethods', payload: cards })
    }

    const handlePlaceholderButtonPress = () => {
        navigation.navigate('AddPaymentMethod')
    }

    useEffect(async () => {
        try {
            const paymentMethods = [];
            const paymentMethodsDb = await getUserPaymentMethods(currentUser.uid);
            paymentMethodsDb.forEach((doc) => {
                const card = {
                    id: doc.id,
                    ...doc
                }
                paymentMethods.push(card)
            })
            dispatch({ type: 'setPaymentMethods', payload: paymentMethods })
        } catch (error) {
            console.log(error)
        }
    }, [navigation])

    return (
        <React.Fragment>
            {state.paymentMethods &&
                <React.Fragment>
                    <TopHeader screenName='Métodos de Pago' />
                    <View style={styles.container}>
                        <List
                            style={styles.list}
                            contentContainerStyle={styles.listContent}
                            data={state.paymentMethods}
                            renderItem={renderCardItem}
                            ListFooterComponent={renderFooter}
                        />
                    </View>
                </React.Fragment>
            }
        </React.Fragment>
    )
}

const themedStyles = StyleService.create({
    container: {
        flex: 1,
    },
    list: {
        flex: 1,
    },
    listContent: {
        padding: 16,
    },
    cardItem: {
        margin: 8,
        height: 192,
        padding: 24,
        borderRadius: 4,
        backgroundColor: 'color-primary-default',
    },
    cardLogoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardLogo: {
        height: 24,
        width: 75,
        tintColor: 'text-control-color',
    },
    cardOptionsButton: {
        position: 'absolute',
        right: -16,
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    cardNumber: {
        marginVertical: 24,
    },
    cardDetailsLabel: {
        marginVertical: 4,
    },
    cardNameContainer: {
        position: 'absolute',
        left: 24,
        bottom: 24,
    },
    cardExpirationContainer: {
        position: 'absolute',
        right: 24,
        bottom: 24,
    },
    placeholderCard: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 192,
        margin: 8,
        backgroundColor: 'background-basic-color-3',
    },
    creditCardIcon: {
        alignSelf: 'center',
        width: 48,
        height: 48,
        tintColor: 'text-hint-color',
    },
    buyButtonContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 16,
        paddingVertical: 24,
    },
});

export default PaymentMethods
