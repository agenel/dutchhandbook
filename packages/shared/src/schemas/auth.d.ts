import { z } from 'zod';
export declare const PasswordSchema: z.ZodString;
export declare const EmailSchema: z.ZodString;
export declare const RegisterSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    displayName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    displayName?: string | undefined;
}, {
    email: string;
    password: string;
    displayName?: string | undefined;
}>;
export type RegisterDto = z.infer<typeof RegisterSchema>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    totp: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    totp?: string | undefined;
}, {
    email: string;
    password: string;
    totp?: string | undefined;
}>;
export type LoginDto = z.infer<typeof LoginSchema>;
export declare const PasswordResetRequestSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const PasswordResetConfirmSchema: z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    token: string;
}, {
    password: string;
    token: string;
}>;
export declare const VerifyEmailSchema: z.ZodObject<{
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
}, {
    token: string;
}>;
export declare const ChangePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
}>;
