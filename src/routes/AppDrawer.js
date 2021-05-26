import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer'
import { Drawer, DrawerItem, IndexPath, Icon } from '@ui-kitten/components';
import Home from '../components/Home';
import { useAuth } from '../contexts/AuthContext';



const { Navigator, Screen } = createDrawerNavigator();

const renderHomeIcon = (props) => (
    <Icon {...props} name='home-outline' />
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
            onSelect={index => state.routeNames[index.row] ? navigation.navigate(state.routeNames[index.row]) : null}>
            <DrawerItem title='Home' accessoryLeft={renderHomeIcon} />
            <DrawerItem title='Cerrar Sesión' accessoryLeft={renderSignOutIcon} onPress={() => signOutUser()} />
        </Drawer>
    );

    return (
        <Navigator drawerContent={props => <DrawerContent {...props} />}>
            <Screen name='Home' component={Home} />
        </Navigator>
    );
}

