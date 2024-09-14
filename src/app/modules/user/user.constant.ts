export const USER_ROLE = {
  admin: 'admin',
  vendor: 'vendor',
  provider: 'provider',
  sup_admin: 'sup_admin',
  user: 'user',
  customer: 'customer',
  all: ['admin', 'vendor', 'user'].join(','),
};
export const UserStatus = ['pending', 'active', 'blocked'];
