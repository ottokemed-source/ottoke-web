// Bogotá keeps UTC-5 all year, so a day there starts at 05:00 UTC
const day = (time) => Math.floor((time - 5 * 3_600_000) / 86_400_000);

/** What the page says about the days left to an event, or null once its day has passed. */
export function countdown(starts, now = Date.now()) {
  const left = day(Date.parse(starts)) - day(now);
  if (left < 0) return null;
  if (left === 0) return 'Es hoy.';
  return left === 1 ? 'Es mañana.' : `Faltan ${left} días.`;
}

/**
 * Where an event stands: 'open' while it takes sign-ups, 'closed' after the sign-up deadline
 * or once every seat is taken, 'past' once it has ended.
 */
export function stage(event, now = Date.now()) {
  if (now > Date.parse(event.ends)) return 'past';
  if (event.full || now > Date.parse(event.deadline)) return 'closed';
  return 'open';
}
