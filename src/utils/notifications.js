import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

// Configure default notification behaviors (like sound and badges)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Registers device for push notifications (requests permissions)
 */
export async function registerForPushNotificationsAsync() {
  let token;
  
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#02C39A",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Failed to get push token for push notifications!");
    return null;
  }

  try {
    token = (await Notifications.getDevicePushTokenAsync()).data;
    console.log("Device Push Token:", token);
  } catch (error) {
    console.log("Error getting device push token:", error);
  }

  return token;
}

/**
 * Instantly schedules and fires a local push notification
 * @param {string} title 
 * @param {string} body 
 * @param {object} data 
 */
export async function triggerLocalNotification(title, body, data = {}) {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      data: data,
      sound: true,
      badge: 1,
    },
    trigger: null, // null means trigger immediately
  });
}
