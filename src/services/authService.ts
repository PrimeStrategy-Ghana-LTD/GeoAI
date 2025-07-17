const BASE_URL = 'https://nomar.up.railway.app';

export async function loginUser(email: string, password: string) {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || 'Login failed');
    }

    return data; // contains token and user info
  } catch (error: any) {
    throw new Error(error.message || 'Login error');
  }
}

export async function registerUser(name: string, email: string, password: string) {
  try {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || 'Signup failed');
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Signup error');
  }
}
