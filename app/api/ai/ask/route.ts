import { NextResponse, type NextRequest } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import {
  aiAskRequestSchema,
  aiAskResponseSchema,
  productSchema,
  type ChatHistoryItem,
  type Product,
} from "@/types";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const openaiApiKey = process.env.OPENAI_API_KEY;

const openai=openaiApiKey? new OpenAI({apiKey: openaiApiKey,}): null;

function buildSystemPrompt(product: Product): string {
  return `
You are a specialized financial assistant for "The Loan Picks Dashboard".
Your task is to answer user questions about a specific loan product based ONLY on the provided context.

STRICT INSTRUCTIONS:
1. Answer solely using the Product Data provided below.
2. Do not use outside knowledge or make assumptions about missing data.
5. Keep answers concise, professional, and easy to read.

PRODUCT DATA:
${JSON.stringify(product, null, 2)}
`;
}

function buildMessages(systemPrompt: string,history: ChatHistoryItem[],message: string) {
  // console.log("System Prompt:", systemPrompt);
  //console.log("Chat History:", history);
  return [
    { role: "system" as const, content: systemPrompt },
    ...history.map((item)=>({
      role: item.role,
      content: item.content,
    })),
    { role: "user" as const, content: message },
  ];
}
// when if OpenAI is not available case 
function buildFallbackAnswer(product: Product): string {
  return [
    `This is a ${product.type} loan from ${product.bank} named "${product.name}".`,
    `The APR is approximately ${product.rate_apr}% with a tenure range of ${product.tenure_min_months} to ${product.tenure_max_months} months.`,
    `Minimum income is ${product.min_income} and the minimum credit score required is ${product.min_credit_score}.`,
    `Prepayment is ${product.prepayment_allowed ? "allowed" : "not allowed"}, and the disbursal speed is ${product.disbursal_speed}.`,
    "I am using a local fallback and cannot answer questions beyond this summary.",
  ].join(" ");
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = aiAskRequestSchema.parse(json);
    const supabase = createSupabaseServerClient();
    const currentUserId = parsed.userId ?? null;

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", parsed.productId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }

    const product = productSchema.parse(data);
    const systemPrompt = buildSystemPrompt(product);
    const messages = buildMessages(systemPrompt, parsed.history, parsed.message);

    let answer = buildFallbackAnswer(product);

    if (openai) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.2,
      });
      const content = completion.choices[0]?.message?.content;
      if (content && content.trim()) {
        answer = content;
      }
    }

    try {
      await supabase.from("ai_chat_messages").insert([
        {
          user_id: currentUserId,
          product_id: parsed.productId,
          role: "user",
          content: parsed.message,
        },
        {
          user_id: currentUserId,
          product_id: parsed.productId,
          role: "assistant",
          content: answer,
        },
      ]);
    } catch {}

    const body = aiAskResponseSchema.parse({ message: answer });

    return NextResponse.json(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid request payload." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Unexpected error while processing the request." },
      { status: 500 }
    );
  }
}
