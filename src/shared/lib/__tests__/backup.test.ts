import { describe, it, expect } from "vitest";
import {
  serializeBackup,
  parseBackup,
  BackupError,
  BACKUP_FORMAT,
  BACKUP_SCHEMA,
} from "../backup";

// Tipik bir persist blob'u (zustand'ın storage'a yazdığı şekil).
const blob = JSON.stringify({
  state: { budget: 5000, entries: [], onboarded: true },
  version: 9,
});

describe("backup serialize", () => {
  it("ham persist blob'unu yedek dosyasına sarmalar", () => {
    const out = serializeBackup(blob, {
      appVersion: "1.2.3",
      now: new Date("2026-06-28T10:00:00.000Z"),
    });
    const parsed = JSON.parse(out);
    expect(parsed.format).toBe(BACKUP_FORMAT);
    expect(parsed.schema).toBe(BACKUP_SCHEMA);
    expect(parsed.app).toBe("pace");
    expect(parsed.appVersion).toBe("1.2.3");
    expect(parsed.exportedAt).toBe("2026-06-28T10:00:00.000Z");
    expect(parsed.data.state.budget).toBe(5000);
    expect(parsed.data.version).toBe(9);
  });

  it("boş/null veride BackupError fırlatır", () => {
    expect(() => serializeBackup(null, { appVersion: "1" })).toThrow(BackupError);
    expect(() => serializeBackup("", { appVersion: "1" })).toThrow(BackupError);
  });

  it("bozuk JSON'da BackupError fırlatır", () => {
    expect(() => serializeBackup("{not json", { appVersion: "1" })).toThrow(BackupError);
  });

  it("persist blob'u beklenen biçimde değilse BackupError fırlatır", () => {
    expect(() => serializeBackup(JSON.stringify({ foo: 1 }), { appVersion: "1" })).toThrow(
      BackupError,
    );
  });
});

describe("backup parse", () => {
  it("serialize ile round-trip yapar", () => {
    const file = serializeBackup(blob, { appVersion: "1" });
    const out = parseBackup(file);
    expect(out.state.budget).toBe(5000);
    expect(out.version).toBe(9);
  });

  it("geçersiz JSON reddedilir", () => {
    expect(() => parseBackup("{not json")).toThrow(BackupError);
  });

  it("format imzası yoksa reddedilir", () => {
    const fake = JSON.stringify({ data: { state: {}, version: 1 } });
    expect(() => parseBackup(fake)).toThrow(BackupError);
  });

  it("yanlış format imzası reddedilir", () => {
    const fake = JSON.stringify({
      format: "something.else",
      data: { state: {}, version: 1 },
    });
    expect(() => parseBackup(fake)).toThrow(BackupError);
  });

  it("data eksik/bozuksa reddedilir", () => {
    expect(() =>
      parseBackup(JSON.stringify({ format: BACKUP_FORMAT })),
    ).toThrow(BackupError);
    expect(() =>
      parseBackup(JSON.stringify({ format: BACKUP_FORMAT, data: { version: 1 } })),
    ).toThrow(BackupError);
    expect(() =>
      parseBackup(
        JSON.stringify({ format: BACKUP_FORMAT, data: { state: {}, version: "x" } }),
      ),
    ).toThrow(BackupError);
  });

  it("JSON dizisi (object değil) reddedilir", () => {
    expect(() => parseBackup("[1,2,3]")).toThrow(BackupError);
  });
});
