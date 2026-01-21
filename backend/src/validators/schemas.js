import { z } from 'zod';
import { normalizeSkills } from '../utils/helpers.js';

const skillsArray = z
  .array(z.string())
  .max(20, 'Keep skills to 20 items')
  .transform((skills) => normalizeSkills(skills));

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  bio: z.string().max(200).optional().default(''),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  skillsTeach: skillsArray.optional().default([]),
  skillsLearn: skillsArray.optional().default([]),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(200).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')).optional(),
  skillsTeach: skillsArray.optional(),
  skillsLearn: skillsArray.optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const swapRequestSchema = z.object({
  receiverId: z.string().uuid(),
  skillOffered: z.string().min(1),
  skillRequested: z.string().min(1),
});

export const swapRespondSchema = z.object({
  swapId: z.string().uuid(),
  action: z.enum(['accept', 'reject']),
});

export const swapCompleteSchema = z.object({
  swapId: z.string().uuid(),
});

export const ratingSchema = z.object({
  targetUserId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
});

