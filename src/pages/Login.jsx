import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import logo1 from '../assets/logo1.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-200 via-slate-100 to-indigo-50 px-4 relative overflow-hidden">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-block mb-8">
            <img 
              src={logo1} 
              alt="Logo" 
              className="w-24 h-24 rounded-full object-cover mx-auto shadow-lg"
            />
          </div>
          <h1 className="text-5xl font-bold text-slate-700 mb-3 tracking-tight" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>Login</h1>
          <p className="text-slate-500 text-lg font-medium" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>Welcome Back to Admin</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Username/Email Field - Center-aligned */}
          <div className="relative">
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-0 py-4 bg-transparent border-0 border-b-2 border-slate-300 text-slate-700 text-lg font-semibold placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-slate-600 transition-colors text-center"
              placeholder="Email or username"
              style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
            />
          </div>

          {/* Password Field - Center-aligned */}
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-10 py-4 bg-transparent border-0 border-b-2 border-slate-300 text-slate-700 text-lg font-semibold placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-slate-600 transition-colors text-center"
              placeholder="Password"
              style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 transition-colors z-10"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-10"
            style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Welcome Text */}
        <div className="mt-10 text-center">
          <p className="text-slate-400 text-sm font-medium" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
            Secure access to your admin dashboard
          </p>
        </div>
      </div>

      <style>{`
        /* Prevent cursor jumping in center-aligned inputs */
        input[type="text"]:focus,
        input[type="password"]:focus {
          caret-color: #475569;
        }
      `}</style>
    </div>
  );
};

export default Login;
