import React from 'react'
import { Icon, Layout, MenuItem, OverflowMenu, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native';

const TopHeader = (props) => {

    const navigation = useNavigation();
    const BackIcon = (props) => (
        <Icon {...props} name='arrow-back' onPress={() => navigation.goBack()} />
    );

    const renderBackAction = () => (
        <TopNavigationAction icon={BackIcon} />
    );
    return (
        <Layout style={styles.container} level='1'>
            <TopNavigation
                alignment='center'
                title={props.screenName}
                accessoryLeft={renderBackAction}
            />
        </Layout>
    )
}

const styles = StyleSheet.create({
    container: {
        minHeight: 40,
    },
});

export default TopHeader
