/* =============================================================
   Yedekleme / geri yükleme — saf, test edilebilir.

   Export: MMKV'deki ham persist blob'unu ({state, version})
   sürüm/uygulama meta'sıyla sarmalar.
   Import: yedek dosyasını doğrulayıp içindeki state'i çıkarır.
   Asıl alan doğrulaması store'un kendi `migrate` fonksiyonunda
   yapılır (geri yükleme version'ı 0'a düşürüp migrate'i tetikler);
   burada yalnızca dosya kabuğu doğrulanır.
   ============================================================= */

/** Yedek dosyası imzası — geçerli bir pace yedeği bununla tanınır. */
export const BACKUP_FORMAT = "pace.backup";

/** Yedek dosyası kabuk şeması (state şemasından bağımsız). */
export const BACKUP_SCHEMA = 1;

/** Persist blob'u: zustand'ın storage'a yazdığı şekil. */
export interface PersistBlob {
  state: Record<string, unknown>;
  version: number;
}

/** Dışa aktarılan yedek dosyasının tam şekli. */
export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  schema: number;
  app: "pace";
  appVersion: string;
  exportedAt: string;
  data: PersistBlob;
}

/** Geçersiz/bozuk yedek dosyalarında fırlatılır. */
export class BackupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BackupError";
  }
}

/**
 * Ham persist blob string'ini ({state, version}) yedek dosyasına sarmalar.
 * @param persistedBlob MMKV'den okunan ham JSON string (null ise hata)
 */
export function serializeBackup(
  persistedBlob: string | null,
  meta: { appVersion: string; now?: Date },
): string {
  if (!persistedBlob) {
    throw new BackupError("Yedeklenecek veri yok");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(persistedBlob);
  } catch {
    throw new BackupError("Persist verisi okunamadı");
  }
  if (!isPersistBlob(parsed)) {
    throw new BackupError("Persist verisi beklenen biçimde değil");
  }
  const file: BackupFile = {
    format: BACKUP_FORMAT,
    schema: BACKUP_SCHEMA,
    app: "pace",
    appVersion: meta.appVersion,
    exportedAt: (meta.now ?? new Date()).toISOString(),
    data: parsed,
  };
  return JSON.stringify(file, null, 2);
}

/**
 * Yedek dosyası metnini doğrular ve içindeki persist blob'unu döndürür.
 * Alan-bazlı state doğrulaması burada YAPILMAZ — geri yükleme onu store'un
 * migrate'ine bırakır.
 */
export function parseBackup(text: string): PersistBlob {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new BackupError("Dosya geçerli JSON değil");
  }
  if (typeof parsed !== "object" || parsed === null) {
    throw new BackupError("Dosya bir pace yedeği değil");
  }
  const obj = parsed as Record<string, unknown>;
  if (obj.format !== BACKUP_FORMAT) {
    throw new BackupError("Dosya bir pace yedeği değil");
  }
  if (!isPersistBlob(obj.data)) {
    throw new BackupError("Yedek içeriği bozuk");
  }
  return obj.data;
}

function isPersistBlob(v: unknown): v is PersistBlob {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.state === "object" &&
    o.state !== null &&
    typeof o.version === "number"
  );
}
