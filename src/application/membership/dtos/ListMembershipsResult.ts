export type ListMembershipsResult = {
  items: {
    membershipId: string;
    userId: string;
    storeId: string;
    roles: string[];
    scopes: string[];
  }[];
  nextCursor?: string;
};
