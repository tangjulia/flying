const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
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
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export async function onRequestPost({ request, env }) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  if (!origin || origin !== requestUrl.origin) return json({ error: "请求来源不匹配。请从学习网页本身提交。" }, 403);

  if (!env.ARK_API_KEY) return json({ error: "服务端尚未设置 ARK_API_KEY。" }, 503);
  if (!env.GRADE_ACCESS_CODE) return json({ error: "服务端尚未设置 GRADE_ACCESS_CODE。" }, 503);
  const auth = request.headers.get("authorization") || "";
  const suppliedCode = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!equalSecret(suppliedCode, env.GRADE_ACCESS_CODE)) return json({ error: "访问码不正确。" }, 401);

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_IMAGE_BYTES + 64 * 1024) return json({ error: "图片太大，请压缩到 8 MB 以内。" }, 413);

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "无法读取上传内容，请重新选择照片。" }, 400);
  }
  const image = form.get("image");
  const prompt = String(form.get("prompt") || "").trim();
  if (!image || typeof image.arrayBuffer !== "function") return json({ error: "缺少手写作答图片。" }, 400);
  if (!ALLOWED_IMAGE_TYPES.has(image.type)) return json({ error: "请上传 JPG、PNG 或 WebP 图片。" }, 415);
  if (image.size <= 0 || image.size > MAX_IMAGE_BYTES) return json({ error: "图片大小需在 1 字节至 8 MB 之间。" }, 413);
  if (!prompt || prompt.length > 8000) return json({ error: "批改说明不能为空，且不能超过 8000 个字符。" }, 400);

  const bytes = new Uint8Array(await image.arrayBuffer());
  const dataUrl = "data:" + image.type + ";base64," + toBase64(bytes);
  const model = env.ARK_MODEL || "doubao-seed-2-1-pro-260628";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const upstream = await fetch("https://ark.cn-beijing.volces.com/api/v3/chat/completions", {
      method: "POST",
      headers: {
        "authorization": "Bearer " + env.ARK_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1800,
        messages: [
          {
            role: "system",
            content: "你是严谨、耐心的大学数理助教。根据学生上传的手写照片批改数理作答。先识别题目和学生解答；看不清的地方要明确说明，不要猜。逐项评价概念和定理条件、推理、计算、符号与单位，指出第一处错误，给出总分（满分10分）、简洁反馈、循序渐进的提示和规范解法。尊重学生的学习过程，不只报答案。",
          },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
      signal: controller.signal,
    });
    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const message = payload.error && payload.error.message;
      return json({ error: message || "豆包服务暂时不可用，请稍后重试。" }, 502);
    }
    const content = payload.choices && payload.choices[0] && payload.choices[0].message && payload.choices[0].message.content;
    const feedback = typeof content === "string"
      ? content
      : Array.isArray(content)
        ? content.map((part) => part.text || "").join("\n").trim()
        : "豆包没有返回批改文字，请重试。";
    return json({ feedback, model: payload.model || model });
  } catch (error) {
    const timedOut = error && error.name === "AbortError";
    return json({ error: timedOut ? "批改超时，请重试或上传更清晰、较小的照片。" : "连接豆包失败，请检查网络与方舟配置。" }, 502);
  } finally {
    clearTimeout(timeout);
  }
}
