const ALLOWED_ORIGINS = [
  'https://listenablemusic.ca',
  'https://www.listenablemusic.ca',
  'http://localhost:5173',
  'http://localhost:4173',
]

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || ''
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) })
    }

    const url = new URL(request.url)

    if (url.pathname === '/play' && request.method === 'POST') {
      try {
        const { track } = await request.json()
        if (!track || typeof track !== 'string') {
          return Response.json({ error: 'Missing track' }, {
            status: 400,
            headers: corsHeaders(request),
          })
        }

        const current = parseInt(await env.PLAY_COUNTS.get(track) || '0', 10)
        await env.PLAY_COUNTS.put(track, String(current + 1))

        return Response.json({ track, count: current + 1 }, {
          headers: corsHeaders(request),
        })
      } catch (e) {
        return Response.json({ error: 'Bad request' }, {
          status: 400,
          headers: corsHeaders(request),
        })
      }
    }

    if (url.pathname === '/counts' && request.method === 'GET') {
      const list = await env.PLAY_COUNTS.list()
      const counts = {}

      for (const key of list.keys) {
        counts[key.name] = parseInt(await env.PLAY_COUNTS.get(key.name) || '0', 10)
      }

      return Response.json(counts, {
        headers: {
          ...corsHeaders(request),
          'Cache-Control': 'public, max-age=30',
        },
      })
    }

    return Response.json({ error: 'Not found' }, {
      status: 404,
      headers: corsHeaders(request),
    })
  },
}
