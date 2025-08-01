export enum UserRole {
  ADMIN = 'ROLE_ADMIN',
  CLIENT = 'ROLE_CLIENT',
  DOCTOR = 'ROLE_DOCTOR',
  PERSONAL = 'ROLE_PERSONAL',
  GYM = 'ROLE_GYM',
  NUTRITIONIST = 'ROLE_NUTRITIONIST'
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.CLIENT]: 'Cliente',
  [UserRole.DOCTOR]: 'Médico',
  [UserRole.PERSONAL]: 'Personal Trainer',
  [UserRole.GYM]: 'Administrador de Academia',
  [UserRole.NUTRITIONIST]: 'Nutricionista'
};

export const USER_ROLE_OPTIONS = Object.values(UserRole).map(role => ({
  value: role,
  displayName: USER_ROLE_LABELS[role]
}));
