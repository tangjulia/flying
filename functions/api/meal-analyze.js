const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const FRONTEND_ORIGIN = "https://tangjulia.github.io";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "access-control-allow-origin": FRONTEND_ORIGIN,
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "Authorization, Content-Type",
      "access-control-max-age": "86400",
      "vary": "Origin",
    },
  });
}

export async function onRequestOptions({ request }) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  if (origin !== FRONTEND_ORIGIN && origin !== requestUrl.origin) return json({ error: "请求来源不匹配。" }, 403);
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": FRONTEND_ORIGIN,
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "Authorization, Content-Type",
      "access-control-max-age": "86400",
      "vary": "Origin",
    },
  });
}

function equalSecret(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function toBase64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

function parseMeal(text) {
  const cleaned = String(text || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const parsed = JSON.parse(cleaned);
  const number = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, Math.round(n * 10) / 10) : 0;
  };
  return {
    name: String(parsed.name || "餐食").slice(0, 100),
    foods: Array.isArray(parsed.foods) ? parsed.foods.slice(0, 20).map((food) => typeof food === "string" ? food.slice(0, 80) : { name: String(food.name || "食物").slice(0, 80), portion: String(food.portion || "").slice(0, 60) }) : [],
    calories: number(parsed.calories),
    protein: number(parsed.protein),
    carbs: number(parsed.carbs),
    fat: number(parsed.fat),
    notes: String(parsed.notes || "").slice(0, 400),
  };
}

export async function onRequestPost({ request, env }) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  if (origin !== requestUrl.origin && origin !== FRONTEND_ORIGIN) return json({ error: "请求来源不匹配。请从校园主页提交。" }, 403);
  if (!env.ARK_API_KEY) return json({ error: "服务端尚未设置 ARK_API_KEY。" }, 503);
  if (!env.GRADE_ACCESS_CODE) return json({ error: "服务端尚未设置 GRADE_ACCESS_CODE。" }, 503);
  const auth = request.headers.get("authorization") || "";
  const suppliedCode = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!equalSecret(suppliedCode, env.GRADE_ACCESS_CODE)) return json({ error: "访问码不正确。" }, 401);
  if (Number(request.headers.get("content-length") || 0) > MAX_IMAGE_BYTES + 64 * 1024) return json({ error: "图片太大，请压缩到 8 MB 以内。" }, 413);

  let form;
  try { form = await request.formData(); } catch { return json({ error: "无法读取上传内容，请重新选择照片。" }, 400); }
  const image = form.get("image");
  if (!image || typeof image.arrayBuffer !== "function") return json({ error: "缺少餐食照片。" }, 400);
  if (!ALLOWED_IMAGE_TYPES.has(image.type)) return json({ error: "请上传 JPG、PNG 或 WebP 图片。" }, 415);
  if (image.size <= 0 || image.size > MAX_IMAGE_BYTES) return json({ error: "图片大小需在 1 字节至 8 MB 之间。" }, 413);

  const bytes = new Uint8Array(await image.arrayBuffer());
  const dataUrl = `data:${image.type};base64,${toBase64(bytes)}`;
  const model = env.ARK_MODEL || "doubao-seed-2-0-pro-260428";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const upstream = await fetch("https://ark.cn-beijing.volces.com/api/v3/chat/completions", {
      method: "POST",
      headers: { authorization: `Bearer ${env.ARK_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 1200,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "你是审慎的饮食记录助手。根据照片识别一顿饭，并估算整盘的可食用份量和营养。只返回 JSON 对象，不要 Markdown，字段必须为 name（菜品概述）、foods（食物数组，每项含 name 和 portion）、calories（千卡）、protein（克）、carbs（克）、fat（克）、notes（不确定性和估算假设）。不可见的食材不要猜；看不清时在 notes 说明。数值是粗略估算而非医疗建议。" },
          { role: "user", content: [{ type: "image_url", image_url: { url: dataUrl, detail: "high" } }, { type: "text", text: "请估算照片里这一顿饭的总热量和三大营养素。按看得到的份量估计，明确指出主要不确定性。" }] },
        ],
      }),
      signal: controller.signal,
    });
    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok) return json({ error: payload.error?.message || "豆包服务暂时不可用，请稍后重试。" }, 502);
    const content = payload.choices?.[0]?.message?.content;
    const text = typeof content === "string" ? content : Array.isArray(content) ? content.map((part) => part.text || "").join("\n") : "";
    try { return json({ meal: parseMeal(text), model: payload.model || model }); }
    catch { return json({ error: "豆包返回内容无法解析，请重试。" }, 502); }
  } catch (error) {
    return json({ error: error?.name === "AbortError" ? "识别超时，请重试或选择更清晰、较小的照片。" : "连接豆包失败，请检查网络与方舟配置。" }, 502);
  } finally {
    clearTimeout(timeout);
  }
}
