const { withEntitlementsPlist } = require("@expo/config-plugins");

/**
 * aps-environment (uzak push) entitlement'ını kaldırır.
 *
 * expo-notifications yalnızca YEREL hatırlatmalar için kullanılıyor; uzak push
 * yok. Kütüphanenin otomatik config plugin'i yine de aps-environment ekliyor ve
 * bu, kişisel (ücretsiz) Apple takımıyla imzalanamıyor:
 *   "Personal development teams ... do not support the Push Notifications capability."
 *
 * Yerel bildirimler bu entitlement'a ihtiyaç duymaz, dolayısıyla kaldırmak
 * güvenli. Ücretli Apple hesabına geçip gerçek push istenirse bu plugin
 * app.json'dan çıkarılır.
 */
module.exports = function withoutPushEntitlement(config) {
  return withEntitlementsPlist(config, (cfg) => {
    delete cfg.modResults["aps-environment"];
    return cfg;
  });
};
