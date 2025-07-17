const BASE_URL = 'https://nomar.up.railway.app';

// Login Function
export async function loginUser(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: email, // ✅ FastAPI expects 'username', not 'email'
      password: password,
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

// Signup Function
export async function signupUser(email: string, password: string, fullName: string) {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      full_name: fullName,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const message = Array.isArray(data.detail)
      ? data.detail.map((d: any) => d.msg).join(', ')
      : data.detail;
    throw new Error(message || 'Signup failed');
  }

  return data;
}
