export function formatDuration(ms: number): string {
  const totalTenths = Math.floor(ms / 100);
  const tenths = totalTenths % 10;
  const totalSeconds = Math.floor(totalTenths / 10);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);

  if (minutes === 0) {
    return `${seconds},${tenths} s`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')},${tenths}`;
}
