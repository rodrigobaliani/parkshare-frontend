import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Spinner } from '@ui-kitten/components';


const Loading = (props) => {
    
    return (
        <View style={styles.loadingSpinner}>
            <View style={styles.controlContainer}>
                <Spinner animating={props.animating} size="giant" status="control" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    loadingSpinner: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex:999
    },
    controlContainer: {
        position: 'absolute',
        borderRadius: 4,
        padding: 12,
        backgroundColor: '#3366FF',
        zIndex:999
        
    }
});

export default Loading