interface User {
  id: number;
  email: string;
  role: string;
  school_id: number | null;
  first_name: string;
  last_name: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

interface LoginError {
  message: string;
  errors?: Array<{ msg: string; param: string }>;
}

const API_URL = 'http://localhost:3001/api';

const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error((data as LoginError).message || 'Login failed');
    }

    return data as LoginResponse;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const authService = {
  login,
  logout,
  getCurrentUser,
  getToken,
}; 