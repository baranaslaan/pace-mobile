import React, { useState } from "react";
import { MoreMenu } from "../features/menu/components/MoreMenu";
import { SubscriptionsSheet } from "../features/subscriptions/components/SubscriptionsSheet";
import { HistorySheet } from "../features/expense-history/components/HistorySheet";
import { AnalyticsSheet } from "../features/analytics/components/AnalyticsSheet";
import { RecurringSheet } from "../features/recurring/components/RecurringSheet";
import { SettingsSheet } from "../features/settings/components/SettingsSheet";
import { Paywall } from "../features/pro/components/Paywall";

type Sheet =
  | "none"
  | "history"
  | "subs"
  | "analytics"
  | "recurring"
  | "paywall"
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

  const close = () => setActive("none");
  const upgrade = () => setActive("paywall");
  // Menüden açılışlar: önce menüyü kapat, sonra hedef sheet'i aç.
  const openFromMenu = (s: Sheet) => {
    onCloseMenu();
    setActive(s);
  };

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

      <HistorySheet open={active === "history"} onClose={close} />
      <SubscriptionsSheet open={active === "subs"} onClose={close} onUpgrade={upgrade} />
      <AnalyticsSheet open={active === "analytics"} onClose={close} onUpgrade={upgrade} />
      <RecurringSheet open={active === "recurring"} onClose={close} onUpgrade={upgrade} />
      <SettingsSheet
        open={active === "settings"}
        onClose={close}
        onUpgrade={upgrade}
        onOpenSubscriptions={() => setActive("subs")}
      />
      <Paywall open={active === "paywall"} onClose={close} />
    </>
  );
}
