const BASE_URL = import.meta.env.VITE_API_URL;

// 👤 Login User
export async function loginUser(email: string, password: string) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || "Login failed";
    throw new Error(message);
  }

  return await response.json(); // returns token, etc.
}

// 📝 Register User
export async function registerUser(name: string, email: string, password: string) {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      email,
      password,
      organization: "Land AI",   // or make this dynamic later
      location: "Ghana"          // or auto-detect later
    }),
  });

  if (!response.ok) {
    let errorMessage = 'Signup failed';
    try {
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.detail || JSON.stringify(errorData);
      } else {
        errorMessage = await response.text();
      }
    } catch {
      errorMessage = 'Unknown server error';
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}
