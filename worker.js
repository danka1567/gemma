export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        }
      });
    }

    const url = new URL(request.url);
    const target = url.searchParams.get("url");
    if (!target) return new Response("missing url param", { status: 400 });

    const skip = ["host","cf-ray","cf-connecting-ip","cf-ipcountry","cf-visitor","x-forwarded-for"];
    const headers = new Headers();
    for (const [k, v] of request.headers.entries()) {
      if (!skip.includes(k.toLowerCase())) headers.set(k, v);
    }

    try {
      const res = await fetch(target, {
        method: request.method,
        headers,
        body: request.method === "POST" ? request.body : undefined,
        redirect: "follow",
      });
      const body = await res.arrayBuffer();
      return new Response(body, {
        status: res.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Content-Type": res.headers.get("Content-Type") || "application/octet-stream",
        },
      });
    } catch(e) {
      return new Response(`fetch error: ${e.message}`, { status: 500 });
    }
  }
};