/** Host-clock sync for guests: offset = hostNow - localNow, keeping the least-latency sample per game. */
let offset = 0;
let gameKey = -1;

export function nowMs(): number {
  return Date.now() + offset;
}

export function syncClock(hostNow: number, key: number) {
  const sample = hostNow - Date.now();
  if (key !== gameKey || sample > offset) {
    offset = sample;
    gameKey = key;
  }
}

export function resetClock() {
  offset = 0;
  gameKey = -1;
}
