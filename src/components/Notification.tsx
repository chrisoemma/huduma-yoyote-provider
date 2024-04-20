import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../utils/colors';

const Notification = ({ message, type, duration = 30000, allowClose = true, autoDismiss = true, height, textSize }: any) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (autoDismiss) {
      timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);
    }

    return () => {
      if (autoDismiss) {
        clearTimeout(timer);
      }
    };
  }, [autoDismiss, duration]);

  const getBackgroundColor = () => {
    switch (type) {
      case 'warning':
        return 'orange';
      case 'info':
        return '#3495eb';
      case 'danger':
        return colors.dangerRed;
      case 'success':
        return colors.successGreen;
      default:
        return 'rgba(0, 0, 0, 0.8)';
    }
  };

  const closeNotification = () => {
    setIsVisible(false);
  };

  const containerStyle = [
    styles.container,
    { backgroundColor: getBackgroundColor() },
    height && { height },
  ];

  const textStyle = [
    styles.message,
    { fontSize: textSize || 15 },
    {lineHeight:textSize<20 ?20 :40}
  ];

  return (
    isVisible && (
      <View style={containerStyle}>
        <Text style={textStyle}>{message}</Text>
        {allowClose && (
          <TouchableOpacity onPress={closeNotification} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 8,
    margin: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    color: 'white',
    flex: 1,
  },
  closeButton: {
    marginLeft: 8,
    padding: 8,
  },
  closeButtonText: {
    color: 'white',
  },
});

export default Notification;
