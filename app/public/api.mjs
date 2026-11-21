export async function request(path, { method = 'GET', data, token } = {}) {
  const response = await fetch(`/api/${path}`, {
    method,
    headers: {
      ...(data && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? 'The request failed.');
  return result;
}
