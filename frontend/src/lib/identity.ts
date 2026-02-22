/**
 * Returns a stable per-browser UUID. Generated once and stored in localStorage.
 * Acts as an anonymous client identity — survives page refreshes and tab closes,
 * but is local to this browser. Future auth systems can replace this with a JWT.
 *
 * Falls back to a manual UUID generator when crypto.randomUUID() is unavailable
 * (e.g. Safari over plain HTTP, which is not a secure context).
 */
function generateUUID(): string {
  // crypto.randomUUID() requires a secure context (HTTPS or localhost).
  // Safari on iOS over HTTP does not expose it, so we fall back to getRandomValues.
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback: build a v4 UUID from getRandomValues (available in all browsers)
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant bits
  return [...bytes]
    .map((b, i) =>
      [4, 6, 8, 10].includes(i) ? `-${b.toString(16).padStart(2, "0")}` : b.toString(16).padStart(2, "0"),
    )
    .join("");
}

export function getClientID(): string {
  let id = localStorage.getItem("muko:clientID");
  if (!id) {
    id = generateUUID();
    localStorage.setItem("muko:clientID", id);
  }
  return id;
}
