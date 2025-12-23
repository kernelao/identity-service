export type GetMeResult = {
  userId: string;
  email: string;
  memberships: {
    storeId: string;
    roles: string[];
    scopes: string[];
  }[];
};
