import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { authService } from '../../services/auth.service';
import './CreateUser.css';

interface CreateUserForm {
  email: string;
  password: string;
  role: 'admin' | 'client';
  firstName: string;
  lastName: string;
  schoolId: string;
}

interface School {
  id: number;
  name: string;
  address?: string;
}

const CreateUser: React.FC = () => {
  const [formData, setFormData] = useState<CreateUserForm>({
    email: '',
    password: '',
    role: 'client',
    firstName: '',
    lastName: '',
    schoolId: '',
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<any>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [showSchoolForm, setShowSchoolForm] = useState(false);
  const [schoolForm, setSchoolForm] = useState({ name: '', address: '' });
  const [schoolError, setSchoolError] = useState('');
  const [schoolSuccess, setSchoolSuccess] = useState('');
  const navigate = useNavigate();

  // Fetch schools from backend (add a GET /api/admin/schools endpoint in backend for this to work)
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3001/api/admin/schools', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setSchools(data.schools || []);
      } catch (e) {
        // ignore
      }
    };
    fetchSchools();
  }, [schoolSuccess]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    setResponse(null);

    try {
      const userData = {
        ...formData,
        schoolId: formData.schoolId ? parseInt(formData.schoolId) : undefined,
      };
      const res = await adminService.createUser(userData);
      setSuccess('User created successfully!');
      setResponse(res);
      setFormData({
        email: '',
        password: '',
        role: 'client',
        firstName: '',
        lastName: '',
        schoolId: '',
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchoolFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSchoolForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSchoolError('');
    setSchoolSuccess('');
    try {
      const res = await adminService.createSchool(schoolForm);
      setSchoolSuccess('School created successfully!');
      setSchoolForm({ name: '', address: '' });
      setShowSchoolForm(false);
    } catch (err: any) {
      setSchoolError(err?.message || 'Failed to create school');
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <div className="create-user-container">
      <div className="create-user-box">
        <button
          type="button"
          className="submit-btn"
          style={{ float: 'right', marginBottom: '1rem', background: '#d32f2f' }}
          onClick={handleLogout}
        >
          Logout
        </button>
        <h2>Create User</h2>
        <button
          type="button"
          className="submit-btn"
          style={{ marginBottom: '1rem' }}
          onClick={() => setShowSchoolForm(v => !v)}
        >
          {showSchoolForm ? 'Hide School Form' : 'Add New School'}
        </button>
        {showSchoolForm && (
          <form onSubmit={handleSchoolSubmit} style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label htmlFor="schoolName">School Name</label>
              <input
                type="text"
                id="schoolName"
                name="name"
                value={schoolForm.name}
                onChange={handleSchoolFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="schoolAddress">Address</label>
              <input
                type="text"
                id="schoolAddress"
                name="address"
                value={schoolForm.address}
                onChange={handleSchoolFormChange}
              />
            </div>
            <button type="submit" className="submit-btn">Create School</button>
            {schoolError && <div className="error-message">{schoolError}</div>}
            {schoolSuccess && <div className="success-message">{schoolSuccess}</div>}
          </form>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              disabled={isLoading}
            >
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="schoolId">School</label>
            <select
              id="schoolId"
              name="schoolId"
              value={formData.schoolId}
              onChange={handleChange}
              required
              disabled={isLoading || schools.length === 0}
            >
              <option value="">Select a school</option>
              {schools.map(school => (
                <option key={school.id} value={school.id}>{school.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? 'Creating...' : 'Create User'}
          </button>
        </form>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        {response && (
          <div className="response-section">
            <h3>API Response</h3>
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateUser; 