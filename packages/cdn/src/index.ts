interface Env {
  UPLOADS: R2Bucket;
  ALLOWED_ORIGINS: string;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const origin = request.headers.get("Origin") || "";
    const allowedOrigins = env.ALLOWED_ORIGINS?.split(",") || [];

    // CORS headers
    const corsHeaders: Record<string, string> = {
      "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    };

    if (allowedOrigins.includes(origin) || !origin) {
      corsHeaders["Access-Control-Allow-Origin"] = origin || "*";
    }

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Upload endpoint: POST /upload
    if (path === "/upload" && request.method === "POST") {
      try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
          return new Response(JSON.stringify({ error: "No file provided" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        // Generate unique key
        const ext = file.name.split(".").pop() || "bin";
        const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        // Upload to R2
        await env.UPLOADS.put(key, file.stream(), {
          httpMetadata: {
            contentType: file.type,
          },
        });

        const fileUrl = `${url.origin}/${key}`;

        return new Response(JSON.stringify({ success: true, url: fileUrl, key }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Upload failed" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }

    // Serve uploads from R2: GET /uploads/*
    if (path.startsWith("/uploads/") && request.method === "GET") {
      const key = path.slice(1); // Remove leading slash
      const object = await env.UPLOADS.get(key);

      if (!object) {
        return new Response("Not Found", { status: 404, headers: corsHeaders });
      }

      const headers = new Headers(corsHeaders);
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);
      headers.set("Cache-Control", "public, max-age=31536000, immutable");

      return new Response(object.body, { headers });
    }

    // Health check
    if (path === "/" && request.method === "GET") {
      return new Response(JSON.stringify({ status: "ok", service: "demo-twitter-cdn" }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Fall through to static assets (screenshots)
    return env.ASSETS.fetch(request);
  },
};
