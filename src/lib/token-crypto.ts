import crypto from "crypto";

function key() {
  const secret = process.env.TOKEN_ENCRYPTION_KEY || "";
  if (!secret) throw new Error("TOKEN_ENCRYPTION_KEY가 필요합니다.");
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptText(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), encrypted.toString("base64")].join(".");
}

export function decryptText(payload: string) {
  const [ivRaw, tagRaw, encryptedRaw] = String(payload || "").split(".");
  if (!ivRaw || !tagRaw || !encryptedRaw) throw new Error("암호화 토큰 형식이 올바르지 않습니다.");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key(), Buffer.from(ivRaw, "base64"));
  decipher.setAuthTag(Buffer.from(tagRaw, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
