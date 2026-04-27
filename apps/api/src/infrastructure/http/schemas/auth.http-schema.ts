import { z } from 'zod'

// These schemas validate HTTP input at the boundary.
// Business-rule validation (password strength, etc.) lives in the domain value objects.

export const RegisterBodySchema = z.object({
  email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
})

export const LoginBodySchema = z.object({
  email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
})

export type RegisterBody = z.infer<typeof RegisterBodySchema>
export type LoginBody = z.infer<typeof LoginBodySchema>
