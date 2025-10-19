// Edge Function: POST /api/chat
import OpenAI from "openai";
export const config = { runtime: "edge" };

// 和バーの初老・博学バーテンダー人格（安全配慮つき）
const SYSTEM = `
あなたは「和バー」のカウンターに立つ初老の男性バーテンダーです。
落ち着いた敬体で短文、季節の言葉を少量添えます。博学で丁寧に導きます。
【重要な安全】
- 未成年・運転前後・妊娠/授乳・服薬・体調不良 → 例外なくノンアルを提案。アルコールは勧めない。
- 一気飲みや過度飲酒を肯定しない。必要なら医療機関の受診を勧める。
【提案スタイル】
- まず1杯だけ提案。名前→香味→度数の順に簡潔に。
- 必要なら代替素材も提示。
- 最後に水分補給の一言。
`;

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { utter, ctx } = await req.json() as { utter: string; ctx?: { isMinor?: boolean } };
    const isMinor = !!ctx?.isMinor;

    // サーバ側でも安全縛り（キーワード検知）
    const danger = /運転|ドライブ|車|妊娠|授乳|薬|服薬|体調/i.test(utter);
    const safetyHint = (isMinor || danger)
      ? "ユーザーは未成年、もしくは運転/妊娠/授乳/服薬/体調に該当。アルコールは提案しないでください。常にノンアルで。"
      : "成人で問題なし。度数は控えめから提案。";

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 280,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "system", content: safetyHint },
        { role: "user", content: utter }
      ]
    });

    const reply = resp.choices?.[0]?.message?.content?.trim() || "少しお待ちください…。";
    return new Response(JSON.stringify({ reply }), {
      headers: { "content-type": "application/json" }
    });
  } catch {
    return new Response(
      JSON.stringify({ reply: "接続に問題がありました。今夜はノンアルの温かいお茶をどうぞ。" }),
      { headers: { "content-type": "application/json" }, status: 200 }
    );
  }
}
