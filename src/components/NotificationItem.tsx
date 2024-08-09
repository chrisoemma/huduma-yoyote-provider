import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors } from '../utils/colors';
import { useDispatch } from 'react-redux';
import { markAsViewed, removeNotification } from '../features/Notifications/NotificationSlice';

const NotificationItem = ({ notification, openContentModal }: any) => {
  const dispatch = useDispatch();
  const { id, type, title, message, viewed } = notification;

  const typeColor = type === 'Account' ? colors.primary : colors.secondary;

  const handleNotificationPress = () => {
    dispatch(markAsViewed(id));  // Mark notification as viewed
    openContentModal(notification);
  };

  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => dispatch(removeNotification(id))}
    >
      <AntDesign name="delete" size={24} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity
        style={[styles.notificationItem, viewed ? styles.viewed : styles.notViewed]}
        onPress={handleNotificationPress}
      >
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationType, { color: typeColor }]}>{type}</Text>
          <View style={[styles.notificationDot, viewed ? styles.viewedDot : styles.notViewedDot]} />
        </View>
        <Text style={styles.notificationTitle}>{title}</Text>
        <Text style={styles.notificationMessage}>{message}</Text>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  notificationItem: {
    padding: 15,
  },
  viewed: {
    backgroundColor: colors.white,
  },
  notViewed: {
    backgroundColor: colors.lightGrey,
    borderWidth: 0.6,
    borderColor: colors.primary,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  notificationType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  viewedDot: {
    backgroundColor: colors.grey,
  },
  notViewedDot: {
    backgroundColor: colors.dangerRed,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: '100%',
    paddingHorizontal: 10,
  },
});

export default NotificationItem;
