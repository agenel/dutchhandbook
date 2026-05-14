export interface RegisterDto {
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginDto {
  email: string;
  password: string;
  totp?: string;
}

export interface PasswordResetRequestDto {
  email: string;
}

export interface PasswordResetConfirmDto {
  token: string;
  password: string;
}
