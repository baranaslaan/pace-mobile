import React, { useCallback, useState } from "react";
import { MoreMenu } from "../features/menu/components/MoreMenu";
import { SubscriptionsSheet } from "../features/subscriptions/components/SubscriptionsSheet";
import { HistorySheet } from "../features/expense-history/components/HistorySheet";
import { AnalyticsSheet } from "../features/analytics/components/AnalyticsSheet";
import { RecurringSheet } from "../features/recurring/components/RecurringSheet";
import { SettingsSheet } from "../features/settings/components/SettingsSheet";
import { CategoryBudgetsSheet } from "../features/category-budgets/components/CategoryBudgetsSheet";
import { Paywall } from "../features/pro/components/Paywall";

type Sheet =
  | "none"
  | "history"
  | "subs"
  | "analytics"
  | "recurring"
  | "paywall"
  | "catbudget"
  | "settings";

interface AppSheetsProps {
  menuOpen: boolean;
  onCloseMenu: () => void;
}

/**
 * Tüm bottom sheet'lerin tek sahibi: hangi sheet'in açık olduğunu yönetir ve
 * "yükselt" / sheet'ler arası geçiş (Ayarlar → Bütçe) gibi köprüleri kurar.
 * Sheet navigasyonunu AppIndex'in layout sorumluluğundan ayırır — yeni bir
 * sheet eklemek artık yalnızca bu dosyayı (ve Sheet birliğini) etkiler.
 */
export function AppSheets({ menuOpen, onCloseMenu }: AppSheetsProps) {
  const [active, setActive] = useState<Sheet>("none");
  // Performans: her sheet kendi içeriğini + store aboneliklerini taşır. Hepsini
  // açılıştan itibaren mount tutmak, kullanıcı hiç açmasa bile her store
  // değişiminde gereksiz render/hesap demek. Bir sheet'i ancak en az bir kez
  // açıldıktan sonra mount ediyoruz; açılınca mount kalır (kapanış animasyonu ve
  // tekrar açılış sorunsuz çalışsın diye).
  const [everOpened, setEverOpened] = useState<Set<Sheet>>(() => new Set());

  // Kararlı referanslar: sheet'lerin geri-tuşu köprüsü (useBackClose) onClose
  // kimliğine bağlı — her render'da yeniden register etmemek için memoize.
  const open = useCallback((s: Sheet) => {
    setEverOpened((prev) => (prev.has(s) ? prev : new Set(prev).add(s)));
    setActive(s);
  }, []);
  const close = useCallback(() => setActive("none"), []);
  const upgrade = useCallback(() => open("paywall"), [open]);
  // Menüden açılışlar: önce menüyü kapat, sonra hedef sheet'i aç.
  const openFromMenu = useCallback(
    (s: Sheet) => {
      onCloseMenu();
      open(s);
    },
    [onCloseMenu, open],
  );

  return (
    <>
      <MoreMenu
        open={menuOpen}
        onClose={onCloseMenu}
        onOpenHistory={() => openFromMenu("history")}
        onOpenSubscriptions={() => openFromMenu("subs")}
        onOpenAnalytics={() => openFromMenu("analytics")}
        onOpenRecurring={() => openFromMenu("recurring")}
        onOpenSettings={() => openFromMenu("settings")}
        onOpenPaywall={() => openFromMenu("paywall")}
      />

      {everOpened.has("history") && <HistorySheet open={active === "history"} onClose={close} />}
      {everOpened.has("subs") && (
        <SubscriptionsSheet open={active === "subs"} onClose={close} onUpgrade={upgrade} />
      )}
      {everOpened.has("analytics") && (
        <AnalyticsSheet open={active === "analytics"} onClose={close} onUpgrade={upgrade} />
      )}
      {everOpened.has("recurring") && (
        <RecurringSheet open={active === "recurring"} onClose={close} onUpgrade={upgrade} />
      )}
      {everOpened.has("settings") && (
        <SettingsSheet
          open={active === "settings"}
          onClose={close}
          onUpgrade={upgrade}
          onOpenSubscriptions={() => open("subs")}
          onOpenCategoryBudgets={() => open("catbudget")}
        />
      )}
      {everOpened.has("catbudget") && (
        <CategoryBudgetsSheet
          open={active === "catbudget"}
          onClose={close}
          onUpgrade={upgrade}
        />
      )}
      {everOpened.has("paywall") && <Paywall open={active === "paywall"} onClose={close} />}
    </>
  );
}
