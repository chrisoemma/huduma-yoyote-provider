import { Platform, Alert } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export const mediaPermissions = async () => {
    let granted = false;

    try {
        if (Platform.OS === 'android') {
            const version = Platform.Version;

            if (version >= 33) {
                // Handle Android 13 and above
                const readImages = await check(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
                const readVideos = await check(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO);
                const readAudio = await check(PERMISSIONS.ANDROID.READ_MEDIA_AUDIO);

                if (readImages === RESULTS.GRANTED && readVideos === RESULTS.GRANTED && readAudio === RESULTS.GRANTED) {
                    granted = true;
                } else if (readImages === RESULTS.DENIED || readVideos === RESULTS.DENIED || readAudio === RESULTS.DENIED) {
                    // If any permission is denied, request it again
                    const requestImages = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
                    const requestVideos = await request(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO);
                    const requestAudio = await request(PERMISSIONS.ANDROID.READ_MEDIA_AUDIO);

                    granted = requestImages === RESULTS.GRANTED && requestVideos === RESULTS.GRANTED && requestAudio === RESULTS.GRANTED;
                } else if (readImages === RESULTS.BLOCKED || readVideos === RESULTS.BLOCKED || readAudio === RESULTS.BLOCKED) {
                    // If any permission is blocked, show an alert directing the user to enable it from settings
                    Alert.alert(
                        'Permissions Required',
                        'You have denied some of the necessary permissions. Please enable them from the settings to proceed.',
                        [{ text: 'OK' }]
                    );
                }
            } else if (version >= 30) {
                // Handle Android 11 and above
                const readExternalStorage = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
                const writeExternalStorage = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);

                if (readExternalStorage === RESULTS.GRANTED && writeExternalStorage === RESULTS.GRANTED) {
                    granted = true;
                } else if (readExternalStorage === RESULTS.DENIED || writeExternalStorage === RESULTS.DENIED) {
                    // If any permission is denied, request it again
                    const requestRead = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
                    const requestWrite = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);

                    granted = requestRead === RESULTS.GRANTED && requestWrite === RESULTS.GRANTED;
                } else if (readExternalStorage === RESULTS.BLOCKED || writeExternalStorage === RESULTS.BLOCKED) {
                    // If any permission is blocked, show an alert directing the user to enable it from settings
                    Alert.alert(
                        'Permissions Required',
                        'You have denied some of the necessary permissions. Please enable them from the settings to proceed.',
                        [{ text: 'OK' }]
                    );
                }
            } else {
                // Handle Android versions below 30
                const readExternalStorage = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
                const writeExternalStorage = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);

                if (readExternalStorage === RESULTS.GRANTED && writeExternalStorage === RESULTS.GRANTED) {
                    granted = true;
                } else if (readExternalStorage === RESULTS.DENIED || writeExternalStorage === RESULTS.DENIED) {
                    // If any permission is denied, request it again
                    const requestRead = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
                    const requestWrite = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);

                    granted = requestRead === RESULTS.GRANTED && requestWrite === RESULTS.GRANTED;
                } else if (readExternalStorage === RESULTS.BLOCKED || writeExternalStorage === RESULTS.BLOCKED) {
                    // If any permission is blocked, show an alert directing the user to enable it from settings
                    Alert.alert(
                        'Permissions Required',
                        'You have denied some of the necessary permissions. Please enable them from the settings to proceed.',
                        [{ text: 'OK' }]
                    );
                }
            }
        } else if (Platform.OS === 'ios') {
            const readStatus = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
            const writeStatus = await check(PERMISSIONS.IOS.MEDIA_LIBRARY);

            if (readStatus === RESULTS.GRANTED && writeStatus === RESULTS.GRANTED) {
                granted = true;
            } else if (readStatus === RESULTS.DENIED || writeStatus === RESULTS.DENIED) {
                // If any permission is denied, request it again
                const requestRead = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
                const requestWrite = await request(PERMISSIONS.IOS.MEDIA_LIBRARY);

                granted = requestRead === RESULTS.GRANTED && requestWrite === RESULTS.GRANTED;
            } else if (readStatus === RESULTS.BLOCKED || writeStatus === RESULTS.BLOCKED) {
                // If any permission is blocked, show an alert directing the user to enable it from settings
                Alert.alert(
                    'Permissions Required',
                    'You have denied some of the necessary permissions. Please enable them from the settings to proceed.',
                    [{ text: 'OK' }]
                );
            }
        }
    } catch (error) {
        console.error("Error checking/requesting permissions:", error);
    }

    return granted;
};
