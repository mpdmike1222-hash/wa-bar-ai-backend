export const config = { runtime: "edge" };
export default function handler() {
  const ok = !!process.env.OPENAI_API_KEY;
  // 値そのものは絶対に返さない（true/false だけ）
  return new Response(JSON.stringify({ openaiKeyPresent: ok }), {
    headers: { "content-type": "application/json" }
  });
}
