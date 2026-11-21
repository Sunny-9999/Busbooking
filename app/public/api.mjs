export async function request(path, { method = 'GET', data } = {}) {
  const response = await fetch(`/api/${path}`, {
    method,
    headers: data ? { 'Content-Type': 'application/json' } : undefined,
    body: data ? JSON.stringify(data) : undefined,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? 'The request failed.');
  return result;
}
