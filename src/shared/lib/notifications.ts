/* =============================================================
   Yerel bildirimler — günlük "tempona bak" hatırlatması.
   expo-notifications sarmalayıcısı. Sadece local notification;
   uzak push (APNs) yok.
   ============================================================= */

import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";

// Uygulama açıkken de bildirim banner'ı görünsün.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const REMINDER_TITLE = "pace";
const REMINDER_BODY = "Bugün ne harcadın? Günlük tempona bir bak.";

/** Hatırlatma/test bildirim metinleri — çağıran tarafça (dile göre) verilir. */
export interface NotificationText {
  title: string;
  body: string;
}

/** Bildirim iznini ister (zaten verilmişse tekrar sormaz). Verildi mi döner. */
export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

/**
 * Her gün belirtilen saatte tekrarlayan tek bir hatırlatma kurar.
 * Önce mevcut tüm zamanlanmışları temizler (uygulama yalnızca bunu kullanır).
 */
export async function scheduleDailyReminder(
  hour: number,
  minute: number,
  text: NotificationText = { title: REMINDER_TITLE, body: REMINDER_BODY },
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: { title: text.title, body: text.body },
    trigger: {
      type: SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

/** Tüm zamanlanmış hatırlatmaları iptal eder. */
export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/** Test amaçlı: birkaç saniye sonra tek seferlik bir bildirim atar. */
export async function sendTestNotification(
  text: NotificationText = {
    title: REMINDER_TITLE,
    body: "Test bildirimi — her şey çalışıyor 👍",
  },
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title: text.title, body: text.body },
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      repeats: false,
    },
  });
}
