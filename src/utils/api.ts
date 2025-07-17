const BASE_URL = import.meta.env.VITE_API_URL;

export interface AuthResponse {
  token: string;
  user?: {
    id: string;
    name: string;
    email: string;
    // You can extend this with more fields if needed
  };
}

// 👤 Login User
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    let message = "Login failed";
    try {
      const errorData = await response.json();
      message = errorData?.detail || message;
    } catch {
      message = await response.text();
    }
    throw new Error(message);
  }

  const result: AuthResponse = await response.json();

  if (!result.token) {
    throw new Error("No token received from server.");
  }

  return result;
}

// 📝 Register User
export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
      organization: "Land AI", // optional: make dynamic later
      location: "Ghana",        // optional: use location API later
    }),
  });

  if (!response.ok) {
    let message = "Signup failed";
    try {
      const contentType = response.headers.get("Content-Type");
      if (contentType?.includes("application/json")) {
        const errorData = await response.json();
        message = errorData?.detail || JSON.stringify(errorData);
      } else {
        message = await response.text();
      }
    } catch {
      message = "Unknown server error";
    }

    throw new Error(message);
  }

  const result: AuthResponse = await response.json();

  if (!result.token) {
    throw new Error("No token received after registration.");
  }

  return result;
}
