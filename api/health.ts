export const config = { runtime: "edge" };
const BUILD = "health-" + new Date().toISOString(); // デプロイごとに変わる印
export default function handler() {
  const ok = !!process.env.OPENAI_API_KEY;
  return new Response(JSON.stringify({ openaiKeyPresent: ok, build: BUILD }), {
    headers: { "content-type": "application/json" }
  });
}
