export const config = { runtime: "edge" };
export default async function handler(req: Request) {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  return new Response(JSON.stringify({ reply: "（テスト）サーバは新しいコードで動いています。" }), {
    headers: { "content-type": "application/json" }
  });
}
