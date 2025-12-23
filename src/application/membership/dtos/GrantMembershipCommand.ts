export type GrantMembershipCommand = {
  storeId: string;
  userId: string;
  roles: string[];
  scopes: string[];
  idempotencyKey: string;
};
