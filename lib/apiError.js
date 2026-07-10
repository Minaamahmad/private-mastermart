export function jsonError(message, status = 500) {
  return Response.json({ message }, { status });
}

export function notFound(resource = 'Resource') {
  return jsonError(`${resource} not found`, 404);
}

export function handleRouteError(error, fallback = 'An error occurred') {
  if (error?.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((e) => e.message);
    return jsonError(messages.join(', '), 400);
  }
  return jsonError(error?.message || fallback, error?.statusCode || 500);
}
