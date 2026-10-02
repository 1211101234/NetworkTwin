export type UserRole = 'Viewer' | 'Operator' | 'Network Planner' | 'Administrator';

export interface CurrentUser {
  readonly id: number;
  readonly username: string;
  readonly displayName: string;
  readonly roles: readonly UserRole[];
  readonly isAdministrator: boolean;
}

export interface LoginCredentials {
  readonly username: string;
  readonly password: string;
}

export interface RegisterCredentials {
  readonly username: string;
  readonly password: string;
}
