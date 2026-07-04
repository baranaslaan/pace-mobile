import { useEffect } from "react";
import { BackHandler, Platform } from "react-native";

/**
 * Android donanım geri tuşu köprüsü: `active` iken geri tuşunu yakalar,
 * `onClose`'u çağırır ve varsayılan davranışı (uygulamadan çıkış) engeller.
 * iOS'ta donanım geri tuşu yok → no-op.
 *
 * Kapatılabilir her katman (sheet, menü) kendi `active` durumuyla bu hook'u
 * çağırır. Uygulamada aynı anda yalnızca tek katman açık olduğundan
 * (AppSheets tek-aktif model) dinleyiciler çakışmaz; birden fazla açık olsa
 * bile BackHandler son eklenen dinleyiciyi önce çağırır (LIFO), yani en
 * üstteki katman kapanır.
 */
export function useBackClose(active: boolean, onClose: () => void): void {
  useEffect(() => {
    if (Platform.OS !== "android" || !active) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true; // varsayılanı engelle — uygulamadan çıkma
    });
    return () => sub.remove();
  }, [active, onClose]);
}
