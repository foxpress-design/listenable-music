export async function onRequest(context) {
  const url = new URL(context.request.url);

  // Don't intercept API or music routes
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/music/')) {
    return context.next();
  }

  const response = await context.next();
  if (response.status === 404) {
    url.pathname = '/index.html';
    return context.env.ASSETS.fetch(url);
  }
  return response;
}
