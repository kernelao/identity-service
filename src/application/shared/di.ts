export const DI = {
  // Repos
  UserRepository: Symbol('UserRepositoryPort'),
  CredentialRepository: Symbol('CredentialRepositoryPort'),
  MembershipRepository: Symbol('MembershipRepositoryPort'),
  MembershipAdminRepository: Symbol('MembershipAdminRepositoryPort'),
  RefreshSessionLookup: Symbol('RefreshSessionLookupPort'),
  RefreshSessionRotation: Symbol('RefreshSessionRotationPort'),
  AuditLogRepository: Symbol('AuditLogRepositoryPort'),

  // Crypto / JWT
  PasswordHasher: Symbol('PasswordHasherPort'),
  PasswordVerifier: Symbol('PasswordVerifierPort'),
  RefreshTokenGenerator: Symbol('RefreshTokenGeneratorPort'),
  RefreshTokenHasher: Symbol('RefreshTokenHasherPort'),
  TokenSigner: Symbol('TokenSignerPort'),

  // Misc
  IdGenerator: Symbol('IdGeneratorPort'),
} as const;
