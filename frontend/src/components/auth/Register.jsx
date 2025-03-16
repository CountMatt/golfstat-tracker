import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, getCurrentUser } from '../../utils/api';
import { setToken } from '../../utils/authToken';
import Alert from '../common/Alert';

const Register = ({ setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { name, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Remove confirmPassword before sending to API
      const registerData = {
        name,
        email,
        password
      };

      const response = await register(registerData);
      setToken(response.token);
      const userResponse = await getCurrentUser();
      setUser(userResponse.data);
      navigate('/dashboard');

    } catch (error) {
      console.error('Registration error:', error);
      
      // Check for specific error types
      if (error.response?.data?.message === "Email already registered") {
        setError("This email is already registered. Please use a different email or try logging in.");
      } else {
        setError(
          error.response?.data?.message || 
          'Registration failed. Please try again.'
        );
      
    } } 
  };

  return (
    <div className="form-container">
      <h1 className="form-title">Create an Account</h1>
      {error && <Alert type="error" message={error} />}
      
      {/* Add the test button here, just before the form */}
      <button 
        onClick={async () => {
          try {
            const response = await fetch('http://localhost:5001/api/auth/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ name: 'Test User', email: 'test@example.com', password: 'password123' }),
            });
            const data = await response.json();
            console.log('API test response:', data);
            alert('API test response: ' + JSON.stringify(data));
          } catch (error) {
            console.error('API test error:', error);
            alert('API test error: ' + error.message);
          }
        }}
        type="button"
        className="btn"
        style={{ marginBottom: '1rem' }}
      >
        Test API Connection
      </button>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name" className="form-label">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="Enter your name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="Enter your email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handleChange}
            required
            minLength="6"
            className="form-input"
            placeholder="Enter your password"
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleChange}
            required
            minLength="6"
            className="form-input"
            placeholder="Confirm your password"
          />
        </div>
        <button 
          type="submit" 
          className="btn btn-block" 
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>

  );
};

export default Register;