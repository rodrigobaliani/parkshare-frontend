import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer'
import { Drawer, DrawerItem, IndexPath, Icon } from '@ui-kitten/components';
import Home from '../components/Home';
import { useAuth } from '../contexts/AuthContext';
import AddParking from '../components/AddParking';
import RouteParking from '../components/RouteParking';
import HostWaiting from '../components/HostWaiting';
import CandidateGoing from '../components/CandidateGoing';
import HostGoing from '../components/HostGoing';
import HostRate from '../components/HostRate';
import CandidateRate from '../components/CandidateRate';
import PaymentMethods from '../components/PaymentMethods';
import AddPaymentMethod from '../components/AddPaymentMethod';
import Vehicles from '../components/Vehicles';
import AddVehicle from '../components/AddVehicle';

const { Navigator, Screen } = createDrawerNavigator();

const renderHomeIcon = (props) => (
    <Icon {...props} name='home-outline' />
);

const renderPaymentIcon = (props) => (
    <Icon {...props} name='credit-card-outline' />
);

const renderCarIcon = (props) => (
    <Icon {...props} name='car-outline' />
);

const renderSignOutIcon = (props) => (
    <Icon {...props} name='log-out-outline' />
);

export default function AppDrawer() {

    const { signOut } = useAuth();

    async function signOutUser() {
        try {
            await signOut();
        } catch (error) {
            const errorMessage = getFirebaseErrorMessage(error.code);
            alert(errorMessage);
        }
    }

    const DrawerContent = ({ navigation, state }) => (
        <Drawer
            selectedIndex={new IndexPath(state.index)}
            onSelect={index => index.row < 3 ? navigation.navigate(state.routeNames[index.row]) : null}>
            <DrawerItem title='Home' accessoryLeft={renderHomeIcon} />
            <DrawerItem title='Metodos de Pago' accessoryLeft={renderPaymentIcon} />
            <DrawerItem title='Vehículos' accessoryLeft={renderCarIcon} />
            <DrawerItem title='Cerrar Sesión' accessoryLeft={renderSignOutIcon} onPress={() => signOutUser()} />
        </Drawer>
    );

    return (
        <Navigator drawerContent={props => <DrawerContent {...props} />}>
            <Screen name='Home' component={Home} />
            <Screen name='PaymentMethods' component={PaymentMethods} />
            <Screen name='Vehicles' component={Vehicles} />
            <Screen name='AddPaymentMethod' component={AddPaymentMethod} />
            <Screen name='AddVehicle' component={AddVehicle} />
            <Screen name='AddParking' component={AddParking} />
            <Screen name='RouteParking' component={RouteParking} />
            <Screen name='HostWaiting' component={HostWaiting} />
            <Screen name='CandidateGoing' component={CandidateGoing} />
            <Screen name='HostGoing' component={HostGoing} />
            <Screen name='HostRate' component={HostRate} />
            <Screen name='CandidateRate' component={CandidateRate} />
        </Navigator>
    );
}

