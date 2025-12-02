


 export const API = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API) {
  throw new Error("Missing NEXT_PUBLIC_API_BASE_URL environment variable");
}

export default async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API}${path}`;

  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });

    // console.log(`API Call: ${url} -> Status: ${res.status}`);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `GET ${path} -> ${res.status} ${res.statusText}. Response: ${errorText}`
      );
    }

    const data = await res.json();
    return data as T;
  } catch (error) {
    console.error("API Request failed:", error);
    throw error;
  }
}

export async function safeApiGet<T>(path: string, init?: RequestInit) {
  try {
    const data = await apiGet<T>(path, init);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}


