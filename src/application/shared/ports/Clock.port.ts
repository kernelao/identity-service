/**
 * ClockPort
 * ---------
 * Port pour rendre le temps testable (pas de new Date() partout dans l'application).
 */
export interface ClockPort {
  now(): Date;
}
