import React from 'react';
import Toast from 'react-native-root-toast';

const ToastNotification = (message, type = 'info', duration = 'short') => {
    let backgroundColor;
    let toastDuration;

    switch (type) {
        case 'success':
            backgroundColor = '#4CAF50';
            break;
        case 'warning':
            backgroundColor = '#FF9800';
            break;
        case 'danger':
            backgroundColor = '#F44336';
            break;
        case 'default':
            backgroundColor = '#1a1d1f';
            break;
        default:
            backgroundColor = '#2196F3';
    }
    switch (duration) {
        case 'short':
            toastDuration = Toast.durations.SHORT;
            break;
        case 'long':
            toastDuration = Toast.durations.LONG;
            break;
        default:
            toastDuration = Toast.durations.SHORT;
    }

    Toast.show(message, {
        duration: toastDuration,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
        backgroundColor,
        textColor: '#ffffff',
        opacity: 1,
    });
};

export default ToastNotification;
