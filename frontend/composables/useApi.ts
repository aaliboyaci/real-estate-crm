export function useApi() {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBase as string;

  async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const query = params
      ? '?' + new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined && v !== null)
            .map(([k, v]) => [k, String(v)]),
        ).toString()
      : '';

    const response = await $fetch<{ data: T }>(`${baseURL}${url}${query}`);
    return response.data;
  }

  async function getRaw<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const query = params
      ? '?' + new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined && v !== null)
            .map(([k, v]) => [k, String(v)]),
        ).toString()
      : '';

    return $fetch<T>(`${baseURL}${url}${query}`);
  }

  async function post<T>(url: string, body: Record<string, unknown> | object): Promise<T> {
    const response = await $fetch<{ data: T }>(`${baseURL}${url}`, {
      method: 'POST',
      body,
    });
    return response.data;
  }

  async function patch<T>(url: string, body: Record<string, unknown> | object): Promise<T> {
    const response = await $fetch<{ data: T }>(`${baseURL}${url}`, {
      method: 'PATCH',
      body,
    });
    return response.data;
  }

  async function del(url: string): Promise<void> {
    await $fetch(`${baseURL}${url}`, { method: 'DELETE' });
  }

  return { get, getRaw, post, patch, del };
}
