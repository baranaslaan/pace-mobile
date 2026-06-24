import { useEffect } from "react";
import { Platform } from "react-native";
import { usePaceStore } from "@/shared/store/usePaceStore";
import { useLimitLogic } from "@/features/limit-board/hooks/useLimitLogic";
import { useCurrency } from "@/shared/store/useCurrency";
import { useT } from "@/shared/i18n";
import { getTone } from "@/shared/lib/tone";

/**
 * Widget GEÇİCİ OLARAK KAPALI.
 *
 * `expo-widgets` plugin'i app'e koşulsuz olarak App Groups + Push Notifications
 * yetenekleri ekliyor; ücretsiz Apple geliştirici hesabı bunları GERÇEK CİHAZDA
 * imzalayamıyor (simülatörde sorun yok). Telefonda kullanabilmek için widget
 * derlemeden çıkarıldı.
 *
 * GERİ AÇMAK İÇİN (ücretli Apple Developer hesabıyla):
 * 1. `WIDGETS_ENABLED = true` yap.
 * 2. app.json plugins'e tekrar ekle:
 *    ["expo-widgets", {
 *      bundleIdentifier: "com.baranaslan.pace-mobile.widgets",
 *      groupIdentifier: "group.com.baranaslan.pace-mobile",
 *      widgets: [{ name: "PaceWidget", displayName: "pace",
 *        supportedFamilies: ["systemSmall", "systemMedium"] }]
 *    }]
 * 3. `npx expo prebuild --clean && npx expo run:ios`
 */
const WIDGETS_ENABLED = false;

let PaceWidget: {
  updateSnapshot: (props: Record<string, unknown>) => void;
  updateTimeline: (entries: { date: Date; props: Record<string, unknown> }[]) => void;
  reload: () => void;
} | null = null;
if (WIDGETS_ENABLED && Platform.OS === "ios") {
  try {
    PaceWidget = require("./PaceWidget").default;
  } catch (e) {
    PaceWidget = null;
    if (__DEV__) console.warn("[widget] PaceWidget yüklenemedi:", e);
  }
}

/** İki hex rengi karıştırır (t=1 → b). */
function mixHex(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (sh: number) => {
    const ca = (pa >> sh) & 0xff;
    const cb = (pb >> sh) & 0xff;
    return Math.round(ca + (cb - ca) * t);
  };
  const hex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${hex(ch(16))}${hex(ch(8))}${hex(ch(0))}`;
}

/**
 * Günlük limit/tempo durumu değiştikçe ana ekran widget'ının anlık görüntüsünü
 * günceller. Metinler aktif dil + para birimine göre burada hazırlanır; widget
 * yalnızca hazır string'leri gösterir. iOS dışında ve hydration öncesi no-op.
 */
export function useWidgetSync() {
  const hydrated = usePaceStore((s) => s._hydrated);
  const { remaining, limit, spent } = useLimitLogic();
  const { fmt } = useCurrency();
  const { t, lang } = useT();
  const tone = getTone(remaining, limit);

  // Tonu koyu tabanla harmanla → ince tonlu koyu zemin (saf siyah yerine).
  const bg = mixHex("#06070b", tone.color, 0.16);

  useEffect(() => {
    if (!PaceWidget || !hydrated) return;
    // Eksi kalanı "-₺40" gibi göster (sembolden önce eksi).
    const remStr = remaining < 0 ? `-${fmt(-remaining)}` : fmt(remaining);
    // Ring doluluğu = bugünkü limitin kalan oranı (0..1).
    const ratio = limit > 0 ? Math.max(0, Math.min(1, remaining / limit)) : 0;
    const pct = Math.round(ratio * 100);
    const props = {
      remaining: remStr,
      label: t("ring.left"),
      status: t(`tone.${tone.key}`),
      color: tone.color,
      bg,
      ratio,
      percent: lang === "tr" ? `%${pct}` : `${pct}%`,
      spentLabel: t("board.spent"),
      spent: fmt(spent),
      limitLabel: t("board.limit"),
      limit: fmt(limit),
    };
    try {
      // Ana ekranda gösterilen TIMELINE'dır; tek girdi (şimdi) yeterli.
      // updateSnapshot ayrıca önizleme/geçiş anlık görüntüsünü tazeler.
      PaceWidget.updateTimeline([{ date: new Date(), props }]);
      PaceWidget.updateSnapshot(props);
    } catch {
      // Widget güncellemesi kritik değil — sessizce geç.
    }
  }, [hydrated, remaining, limit, spent, tone.key, tone.color, fmt, t]);
}
