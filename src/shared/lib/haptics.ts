/* =============================================================
   Haptik geri bildirim — ince, kasıtlı. Cihaz desteklemiyorsa
   (simülatör/web) sessizce no-op. App'in sade dilinde tutmak için
   yalnızca anlamlı anlarda kullanılır.
   ============================================================= */

import * as Haptics from "expo-haptics";

/** Hafif dokunuş — çekirdek eylem (ör. harcama eklendi). */
export function tapLight(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/** Uyarı — anlamlı eşik (ör. günlük limit aşıldı). */
export function tapWarn(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
}
