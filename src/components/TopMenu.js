import React from 'react'
import { StyleSheet } from 'react-native'
import { Icon, TopNavigation, TopNavigationAction, Button, Modal, Text, Card } from '@ui-kitten/components';

const TopMenu = (props) => {

    const menuAction = () => (
        <TopNavigationAction icon={renderMenuIcon} onPress={props.showMenu} />
    );

    const renderMenuIcon = (props) => (
        <Icon {...props} name='menu-outline' size='giant' fill='black' />
    );

    return (
        <TopNavigation accessoryLeft={menuAction} style={styles.header} />
    )
}

const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 50,
        backgroundColor: 'transparent'
    },
});

export default TopMenu
