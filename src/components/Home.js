import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useAuth } from '../contexts/AuthContext';
import { Icon, TopNavigation, TopNavigationAction } from '@ui-kitten/components';


const Home = ({ navigation }) => {

    const { currentUser } = useAuth();

    const MenuIcon = (props) => (
        <Icon {...props} name='menu-outline' />
    );

    const MenuAction = () => (
        <TopNavigationAction icon={MenuIcon} onPress={() => navigation.toggleDrawer()} />
    );


    return (
        <React.Fragment>
            <TopNavigation accessoryLeft={MenuAction} />
            <View style={styles.container}>
                <Text>Welcome {currentUser.email}</Text>
            </View>
        </React.Fragment>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Home
