import React from 'react';
import {StyleSheet, View, Text} from "react-native";

export function Gap() {
    return (
        <View><Text style={styles.gap}></Text></View>
    );
}

const styles =  StyleSheet.create({
    gap: {
        width: '100%',
        height: 10
    }
});
