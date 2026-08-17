import React, { useState } from 'react';
import api from './api';

export default function Auth({ setAuthenticated }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', full_name: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const params = new URLSearchParams();
        params.append('username', formData.email);
        params.append('password', formData.password);
        const res = await api.post('/api/auth/login', params);
        localStorage.setItem('token', res.data.access_token);
        setAuthenticated(true);
      } else {
        await api.post('/api/auth/register', formData);
        alert('Registered successfully! Now please log in.');
        setIsLogin(true);
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data?.detail || 'Authentication failed'));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="p-8 bg-white rounded shadow-md w-96">
        <h2 className="mb-4 text-2xl font-bold">{isLogin ? 'Login' : 'Register'}</h2>
        {!isLogin && (
          <input className="w-full p-2 mb-4 border rounded" placeholder="Full Name" onChange={e => setFormData({...formData, full_name: e.target.value})} />
        )}
        <input className="w-full p-2 mb-4 border rounded" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} />
        <input className="w-full p-2 mb-4 border rounded" type="password" placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} />
        <button className="w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700">{isLogin ? 'Login' : 'Register'}</button>
        <p className="mt-4 text-sm text-center text-blue-500 cursor-pointer" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
        </p>
      </form>
    </div>
  );
}