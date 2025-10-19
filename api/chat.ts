import OpenAI from "openai";
export const config = { runtime: "edge" };

const SYSTEM = `
あなたは「和バー」のカウンターに立つ初老の男性バーテンダーです。
落ち着いた敬体で短文、季節の言葉を少量添えます。博学で丁寧に導きます。
【安全】未成年/運転/妊娠/授乳/服薬/体調不良には必ずノンアルを提案。過度飲酒は勧めない。
【提案】1杯だけ、名前→香味→度数を簡潔に。最後に水分補給を促す。
`;

export default async function handler(req: Request) {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  try {
    const { utter, ctx } = await req.json() as { utter: string; ctx?: { isMinor?: boolean } };
    const isMinor = !!ctx?.isMinor;
    const danger = /運転|ドライブ|車|妊娠|授乳|薬|服薬|体調/i.test(utter);
    const safetyHint = (isMinor || danger)
      ? "ユーザーは未成年/運転/妊娠/授乳/服薬/体調のいずれか。アルコールは提案しないでください。常にノンアルで。"
      : "成人で問題なし。度数は控えめから提案。";

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const r = await openai.responses.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_output_tokens: 280,
      input: [
        { role: "system", content: SYSTEM },
        { role: "system", content: safetyHint },
        { role: "user", content: utter }
      ]
    });

    const text = r.output_text || "少しお待ちください…。";
    return new Response(JSON.stringify({ reply: text.trim() }), {
      headers: { "content-type": "application/json" }
    });

  } catch (e: any) {
    const name = e?.name ?? "Error";
    const message = e?.message ?? "unknown_error";
    const status = (e?.status ?? e?.statusCode) ?? 0;
    return new Response(JSON.stringify({ reply: `（デバッグ）${name} [${status}]: ${message}` }), {
      headers: { "content-type": "application/json" }, status: 200
    });
  }
}
