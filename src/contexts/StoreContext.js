import React, { createContext, useContext, useReducer } from 'react';
import firestore from '@react-native-firebase/firestore';

const StoreContext = createContext();
const initialState = { parkings: [], currentParking: {}, hostInitialData: {}, paymentMethods: [], userVehicles: [], currentVehicle: {}, privateParkings: [], hostCurrentParking: ''  };

const reducer = (state, action) => {
    switch (action.type) {
        case "addParking":
            return {
                parkings: [...state.parkings, action.payload],
                currentParking: state.currentParking,
                hostInitialData: state.hostInitialData,
                paymentMethods: state.paymentMethods,
                userVehicles: state.userVehicles,
                privateParkings: state.privateParkings,
                currentVehicle: state.currentVehicle,
                currentPaymentMethod: state.currentPaymentMethod,
                hostCurrentParking: state.hostCurrentParking
            }

        case "deleteParking":
            return {
                parkings: state.parkings.filter(p => p.id != action.payload.id),
                currentParking: state.currentParking,
                hostInitialData: state.hostInitialData,
                paymentMethods: state.paymentMethods,
                userVehicles: state.userVehicles,
                privateParkings: state.privateParkings,
                currentVehicle: state.currentVehicle,
                currentPaymentMethod: state.currentPaymentMethod,
                hostCurrentParking: state.hostCurrentParking
            }
        case "setCurrentParking":
            return {
                currentParking: action.payload,
                parkings: state.parkings,
                hostInitialData: state.hostInitialData,
                paymentMethods: state.paymentMethods,
                userVehicles: state.userVehicles,
                privateParkings: state.privateParkings,
                currentVehicle: state.currentVehicle,
                currentPaymentMethod: state.currentPaymentMethod,
                hostCurrentParking: state.hostCurrentParking
            }
        case "setHostInitialData":
            return {
                currentParking: state.currentParking,
                parkings: state.parkings,
                hostInitialData: action.payload,
                paymentMethods: state.paymentMethods,
                userVehicles: state.userVehicles,
                privateParkings: state.privateParkings,
                currentVehicle: state.currentVehicle,
                currentPaymentMethod: state.currentPaymentMethod,
                hostCurrentParking: state.hostCurrentParking
            }
        case "setPaymentMethods":
            return {
                currentParking: state.currentParking,
                parkings: state.parkings,
                hostInitialData: state.hostInitialData,
                paymentMethods: action.payload,
                userVehicles: state.userVehicles,
                privateParkings: state.privateParkings,
                currentVehicle: state.currentVehicle,
                currentPaymentMethod: state.currentPaymentMethod,
                hostCurrentParking: state.hostCurrentParking
            }
        case "setUserVehicles":
            return {
                currentParking: state.currentParking,
                parkings: state.parkings,
                hostInitialData: state.hostInitialData,
                paymentMethods: state.paymentMethods,
                userVehicles: action.payload,
                privateParkings: state.privateParkings,
                currentVehicle: state.currentVehicle,
                currentPaymentMethod: state.currentPaymentMethod,
                privateParkings: state.privateParkings,
                hostCurrentParking: state.hostCurrentParking
            }
        case "privateParkings":
            return {
                currentParking: state.currentParking,
                parkings: state.parkings,
                hostInitialData: state.hostInitialData,
                paymentMethods: state.paymentMethods,
                userVehicles: state.userVehicles,
                currentVehicle: state.currentVehicle,
                currentPaymentMethod: state.currentPaymentMethod,
                privateParkings: action.payload,
                hostCurrentParking: state.hostCurrentParking,

            }
        case "setCurrentVehicle":
            return {
                currentParking: state.currentParking,
                parkings: state.parkings,
                hostInitialData: state.hostInitialData,
                paymentMethods: state.paymentMethods,
                userVehicles: action.payload,
                userVehicles: state.userVehicles,
                currentVehicle: action.payload,
                currentPaymentMethod: state.currentPaymentMethod,
                privateParkings: state.privateParkings,
                hostCurrentParking: state.hostCurrentParking
            }
        case "setCurrentPaymentMethod":
            return {
                currentPaymentMethod: action.payload,
                currentParking: state.currentParking,
                parkings: state.parkings,
                hostInitialData: state.hostInitialData,
                paymentMethods: state.paymentMethods,
                userVehicles: state.userVehicles,
                currentVehicle: state.currentVehicle,
                currentPaymentMethod: action.payload,
                privateParkings: state.privateParkings,
                hostCurrentParking: state.hostCurrentParking
            }
        case "setHostCurrentParking":
            return {
                currentPaymentMethod: action.payload,
                currentParking: state.currentParking,
                parkings: state.parkings,
                hostInitialData: state.hostInitialData,
                paymentMethods: state.paymentMethods,
                userVehicles: state.userVehicles,
                currentVehicle: state.currentVehicle,
                currentPaymentMethod: state.currentPaymentMethod,
                privateParkings: state.privateParkings,
                hostCurrentParking: action.payload
            }        
        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
}

export const StoreProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <StoreContext.Provider value={{ state, dispatch }}>
            {children}
        </StoreContext.Provider>
    )
}


export const useStore = () => useContext(StoreContext);