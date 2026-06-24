const SECONDS_PER_DAY = 86400;

function ttlDays(envName, fallbackDays) {
  const value = Number(process.env[envName]);
  return Number.isFinite(value) && value > 0 ? value : fallbackDays;
}

export function linkExpiresAt() {
  const days = ttlDays("LINK_TTL_DAYS", 30);
  return Math.floor(Date.now() / 1000) + days * SECONDS_PER_DAY;
}

export function clickEventExpiresAt() {
  const linkDays = ttlDays("LINK_TTL_DAYS", 30);
  const eventDays = ttlDays("CLICK_EVENT_TTL_DAYS", linkDays + 7);
  return Math.floor(Date.now() / 1000) + eventDays * SECONDS_PER_DAY;
}
