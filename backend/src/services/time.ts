export function businessDateForShift(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) throw new Error('Invalid timestamp');
  // Lumen's night shift begins around 23:00 and the handover belongs to the start date.
  const localHour = Number(timestamp.match(/T(\d{2}):/)?.[1] ?? date.getUTCHours());
  const adjusted = new Date(date);
  if (localHour < 7) adjusted.setUTCDate(adjusted.getUTCDate() - 1);
  return adjusted.toISOString().slice(0, 10);
}

export function shiftIdForTimestamp(hotelId: string, timestamp: string): string {
  return `${hotelId}:night:${businessDateForShift(timestamp)}`;
}
