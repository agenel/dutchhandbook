export interface PublicUser {
    id: string;
    email: string;
    displayName: string | null;
    emailVerified: boolean;
    hasTotp: boolean;
    createdAt: string;
}
export interface SessionUser extends PublicUser {
    csrfToken: string;
}
