/**
 * AuditAction
 * -----------
 * Actions sensibles ou importantes à auditer.
 * V1: petite liste stable, extensible.
 */
export type AuditAction =
  | 'USER_REGISTERED'
  | 'USER_LOGIN'
  | 'REFRESH_ROTATED'
  | 'REFRESH_REVOKED'
  | 'PASSWORD_RESET_REQUESTED'
  | 'PASSWORD_RESET_COMPLETED'
  | 'MEMBERSHIP_GRANTED'
  | 'MEMBERSHIP_LISTED';
