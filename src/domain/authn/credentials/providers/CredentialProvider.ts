/**
 * CredentialProvider
 * ------------------
 * Permet d'étendre l'auth à d'autres providers plus tard (OAuth, magic link, etc.)
 * sans casser le modèle métier.
 */
export type CredentialProvider = 'password';
