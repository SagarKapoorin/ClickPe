import { z } from "zod";
export const productTypeEnum = z.enum([
  "personal",
"education",
  "vehicle",
  "home",
   "credit_line",
  "debt_consolidation",
]);
export const productSchema = z.object({
id: z.string().uuid(),
name: z.string(),
bank: z.string(),
  type: productTypeEnum,
    rate_apr: z.number(),
min_income: z.number(),
  min_credit_score: z.number().int(),
  tenure_min_months: z.number().int(),
  tenure_max_months: z.number().int(),
  processing_fee_pct: z.number(),
  prepayment_allowed: z.boolean(),
   disbursal_speed: z.string(),
  docs_level: z.string(),
   summary: z.string().nullable(),
  faq: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    )
    .default([]),
   terms: z.record(z.unknown()).default({}),
});

export type Product = z.infer<typeof productSchema>;

export const userSchema = z.object({
id: z.string().uuid(),
 email: z.string().email(),
display_name: z.string().nullable(),
});

export type User = z.infer<typeof userSchema>;

export const chatRoleEnum = z.enum(["user", "assistant"]);

export const aiChatMessageSchema = z.object({
  id: z.string().uuid(),
user_id: z.string().uuid().nullable(),
 product_id: z.string().uuid().nullable(),
 role: chatRoleEnum,
content: z.string(),
  created_at: z.string().datetime(),
});

export type AiChatMessage = z.infer<typeof aiChatMessageSchema>;

export const chatHistoryItemSchema = z.object({
  role: chatRoleEnum,
  content: z.string(),
});

export type ChatHistoryItem = z.infer<typeof chatHistoryItemSchema>;

export const aiAskRequestSchema = z.object({
  productId: z.string().uuid(),
  message: z.string().min(1),
  history: z.array(chatHistoryItemSchema).default([]),
});

export type AiAskRequest = z.infer<typeof aiAskRequestSchema>;

export const aiAskResponseSchema = z.object({
  message: z.string(),
});

export type AiAskResponse = z.infer<typeof aiAskResponseSchema>;

