import React, { createContext, useContext, useReducer } from 'react';
import firestore from '@react-native-firebase/firestore';

const StoreContext = createContext();
const initialState = { parkings: [], currentParking: {}, hostInitialData: {} };

const reducer = (state, action) => {
    switch (action.type) {
        case "addParking":
            return {
                parkings: [...state.parkings, action.payload],
                currentParking: state.currentParking,
                hostInitialData: state.hostInitialData
            }
        case "deleteParking":
            return {
                parkings: state.parkings.filter(p => p.id != action.payload),
                currentParking: state.currentParking,
                hostInitialData: state.hostInitialData
            }
        case "setCurrentParking":
            return {
                currentParking: action.payload,
                parkings: state.parkings,
                hostInitialData: state.hostInitialData
            }
        case "setHostInitialData":
            return {
                currentParking: state.currentParking,
                parkings: state.parkings,
                hostInitialData: action.payload
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