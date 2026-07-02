export function getBackendUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    try {
      const parsed = new URL(envUrl);
      return parsed.origin;
    } catch (e) {
      console.warn("Invalid VITE_API_URL format:", envUrl);
    }
  }
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `http://${host}:5001`;
}

const API_BASE_URL = `${getBackendUrl()}/api/share`;

export interface SharePayload {
  content: string;
  expiresIn: number;
  password?: string;
  isOneTime?: boolean;
  language?: string;
  fileName?: string | null;
  fileType?: string | null;
}

export interface ShareResponse {
  code?: string;
  content?: string;
  expiresIn?: number;
  hasPassword?: boolean;
  isOneTime?: boolean;
  requiresPassword?: boolean;
  language?: string;
  fileName?: string | null;
  fileType?: string | null;
  error?: string;
}

export async function createShare(payload: SharePayload): Promise<ShareResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create share');
    }
    return data;
  } catch (error: any) {
    console.error('API Error: createShare failed', error);
    return { error: error.message || 'Network connection failed' };
  }
}

export async function getShare(code: string): Promise<ShareResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/${code}`, {
      method: 'GET',
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to retrieve share');
    }
    return data;
  } catch (error: any) {
    console.error('API Error: getShare failed', error);
    return { error: error.message || 'Network connection failed' };
  }
}

export async function verifyPassword(code: string, password: string): Promise<ShareResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/${code}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Invalid password');
    }
    return data;
  } catch (error: any) {
    console.error('API Error: verifyPassword failed', error);
    return { error: error.message || 'Password verification failed' };
  }
}
