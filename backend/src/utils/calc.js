export function parseTimeToMinutes(t) {
  // Expect HH:MM (24h)
  const [hh, mm] = t.split(':').map(Number);
  return hh * 60 + mm;
}

export function minutesToHours(m) {
  return Math.round((m / 60) * 100) / 100;
}

export function computeEntry({ startTime, endTime, breakMinutes, baseDaily = 8, rate = 0, otRate = 0 }) {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  let duration = end - start;
  if (duration < 0) duration = 0;
  duration -= (breakMinutes || 0);
  const totalHours = minutesToHours(duration);
  const baseHours = Math.min(totalHours, baseDaily);
  const overtimeHours = Math.max(0, totalHours - baseDaily);
  const dailyEarning = Math.round((baseHours * rate + overtimeHours * otRate) * 100) / 100;
  return { totalHours, baseHours, overtimeHours, dailyEarning };
}
