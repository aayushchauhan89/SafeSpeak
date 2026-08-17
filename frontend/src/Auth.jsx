import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 font-sans">
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 mb-2">
          <ShieldCheck className="w-7 h-7 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">SafeSpeak Welcomes You</h1>
        <p className="text-gray-500 text-sm max-w-sm">Promoting safer, clearer, and more positive conversations.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">{isLogin ? 'Sign In' : 'Create Account'}</h2>
        
        {!isLogin && (
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
            <input 
              className="w-full p-3 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" 
              placeholder="Aayush Chauhan" 
              onChange={e => setFormData({...formData, full_name: e.target.value})} 
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
          <input 
            className="w-full p-3 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" 
            placeholder="name@example.com" 
            onChange={e => setFormData({...formData, email: e.target.value})} 
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Password</label>
          <input 
            className="w-full p-3 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" 
            type="password" 
            placeholder="••••••••" 
            onChange={e => setFormData({...formData, password: e.target.value})} 
          />
        </div>

        <button className="w-full py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-colors mt-2">
          {isLogin ? 'Sign In' : 'Register'}
        </button>

        <p className="mt-4 text-sm text-center text-gray-500">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            className="text-indigo-600 font-medium cursor-pointer hover:underline" 
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Register' : 'Login'}
          </span>
        </p>
      </form>
    </div>
  );
}