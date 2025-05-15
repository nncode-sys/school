import { authService } from './auth.service';

interface CreateUserData {
  email: string;
  password: string;
  role: 'admin' | 'client';
  firstName: string;
  lastName: string;
  schoolId?: number;
}

interface User {
  id: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  schoolId: number | null;
  active: boolean;
}

interface CreateSchoolData {
  name: string;
  address?: string;
}

const API_URL = 'http://localhost:3001/api/admin';

const createUser = async (userData: CreateUserData): Promise<User> => {
  try {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create user');
    }

    return data;
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
};

const createSchool = async (schoolData: CreateSchoolData): Promise<any> => {
  try {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    const response = await fetch(`${API_URL}/schools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(schoolData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create school');
    }
    return data;
  } catch (error) {
    console.error('Create school error:', error);
    throw error;
  }
};

export const adminService = {
  createUser,
  createSchool,
}; 