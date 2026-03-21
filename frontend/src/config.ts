// Defaults to https:// for non-localhost origins; VITE_GAME_SERVER should always be set in production.
function getDefaultServerURL(): string {
  const { hostname } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `http://${hostname}:8000`;
  }
  return `https://${hostname}`;
}

export const SERVER_URL =
  import.meta.env.VITE_GAME_SERVER || getDefaultServerURL();

