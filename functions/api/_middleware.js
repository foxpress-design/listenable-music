const ALLOWED_ORIGINS = [
  'https://listenablemusic.ca',
  'https://www.listenablemusic.ca',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:8788',
];

export async function onRequest(context) {
  const origin = context.request.headers.get('Origin');
  const corsHeaders = {};

  if (ALLOWED_ORIGINS.includes(origin)) {
    corsHeaders['Access-Control-Allow-Origin'] = origin;
    corsHeaders['Access-Control-Allow-Methods'] = 'GET, POST, PATCH, OPTIONS';
    corsHeaders['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  }

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const response = await context.next();
  const newResponse = new Response(response.body, response);
  Object.entries(corsHeaders).forEach(([k, v]) => newResponse.headers.set(k, v));
  return newResponse;
}
