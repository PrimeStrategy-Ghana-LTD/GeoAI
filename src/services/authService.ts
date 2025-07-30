const BASE_URL = 'https://nomar.up.railway.app';

interface AuthResponse {
  access_token: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}


export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email, 
      password,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const message = Array.isArray(data.detail)
      ? data.detail.map((d: any) => d.msg).join(', ')
      : data.detail;
    throw new Error(message || 'Login failed');
  }

  return data;
}

export async function signupUser(email: string, password: string, name: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      name, 
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const message = Array.isArray(data.detail)
      ? data.detail[0]?.msg || data.detail
      : data.detail;
    throw new Error(message || 'Signup failed');
  }

  return data;
}

export async function validateToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/auth/validate`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.ok;
  } catch {
    return false;
  }
}
