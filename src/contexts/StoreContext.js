import React, { createContext, useContext, useReducer } from 'react';
import firestore from '@react-native-firebase/firestore';

const StoreContext = createContext();
const initialState = { parkings: [], currentParking: {} };

const reducer = (state, action) => {
    switch (action.type) {
        case "addParking":
            return {
                parkings: [...state.parkings, action.payload],
                currentParking: state.currentParking
            }
        case "getParkings":
            return {
                parkings: state.parkings
            }
        case "setCurrentParking":
            return {
                currentParking: action.payload,
                parkings: state.parkings
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