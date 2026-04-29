"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePasswordSchema = exports.VerifyEmailSchema = exports.PasswordResetConfirmSchema = exports.PasswordResetRequestSchema = exports.LoginSchema = exports.RegisterSchema = exports.EmailSchema = exports.PasswordSchema = void 0;
const zod_1 = require("zod");
exports.PasswordSchema = zod_1.z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a digit')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain a symbol');
exports.EmailSchema = zod_1.z.string().trim().toLowerCase().email().max(254);
exports.RegisterSchema = zod_1.z.object({
    email: exports.EmailSchema,
    password: exports.PasswordSchema,
    displayName: zod_1.z.string().trim().min(2).max(40).optional(),
});
exports.LoginSchema = zod_1.z.object({
    email: exports.EmailSchema,
    password: zod_1.z.string().min(1).max(128),
    totp: zod_1.z
        .string()
        .regex(/^\d{6}$/)
        .optional(),
});
exports.PasswordResetRequestSchema = zod_1.z.object({
    email: exports.EmailSchema,
});
exports.PasswordResetConfirmSchema = zod_1.z.object({
    token: zod_1.z.string().min(20).max(256),
    password: exports.PasswordSchema,
});
exports.VerifyEmailSchema = zod_1.z.object({
    token: zod_1.z.string().min(20).max(256),
});
exports.ChangePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1).max(128),
    newPassword: exports.PasswordSchema,
});
//# sourceMappingURL=auth.js.map