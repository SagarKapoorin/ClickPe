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
  const faqText =product.faq.length===0? "No FAQs are provided.":product.faq
          .map((item, index) =>`Q${index + 1}: ${item.question}\nA${index + 1}: ${item.answer}`).join("\n\n");
  //console.log("FAQ TEXT:", faqText);
  const termsText =Object.keys(product.terms).length === 0
      ? "No additional terms provided."
  :Object.entries(product.terms).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join("\n");
//console.log("TERMS TEXT:", termsText);
  return [
    "You are a loan suitability assistant helping the user decide whether this specific product is a good fit for them.",
    "Use only the product data provided below. Do not invent missing numbers or policies.",
    "If the user shares their income, credit score, desired tenure, or other constraints, compare those explicitly against the product requirements.",
    "If key details are missing to make a clear recommendation, ask brief follow-up questions before answering.",
    "Always format your answer exactly with the following sections in this order, using plain text only:",
    "Overview:",
    "Eligibility:",
    "Costs:",
    "Pros:",
    "Cons:",
    "Who it is good for:",
    "Recommendation:",
    "Each section should be a short paragraph or 3–5 bullet points that are easy to scan.",
    "Do not use markdown headings, numbered lists, emojis, tables, or code blocks.",
    "Do not give legal, tax, or personalized financial advice. Instead, explain tradeoffs and when the user should talk to a human advisor.",
    "If the answer is not clearly available in the data, say you do not know.",
    "",
    `Product Name: ${product.name}`,
    `Bank: ${product.bank}`,
    `Type: ${product.type}`,
    `APR: ${product.rate_apr}%`,
    `Tenure Range (months): ${product.tenure_min_months}-${product.tenure_max_months}`,
    `Minimum Income: ${product.min_income}`,
    `Minimum Credit Score: ${product.min_credit_score}`,
    `Processing Fee (% of amount): ${product.processing_fee_pct}`,
    `Prepayment Allowed: ${product.prepayment_allowed ? "Yes" : "No"}`,
    `Disbursal Speed: ${product.disbursal_speed}`,
    `Documentation Level: ${product.docs_level}`,
    product.summary ? `Summary: ${product.summary}` : "",
    "",
    "FAQs:",
    faqText,
    "",
    "Additional Terms:",
    termsText,
  ].filter((line)=>line.trim().length>0).join("\n");
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
//console.log("Parsed Request:", parsed);
       const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from("products")
      .select("*")
      .eq("id", parsed.productId)
      .single();
    // console.log("Supabase Data:", data, "Error:", error);

    if (error || !data) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }

    const product=productSchema.parse(data);
    const systemPrompt = buildSystemPrompt(product);
const messages=buildMessages(
      systemPrompt,
      parsed.history,
      parsed.message
    );
    //console.log("Final Messages:", messages);
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

    const body = aiAskResponseSchema.parse({ message: answer });
    //console.log("Response Body:", body);

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
