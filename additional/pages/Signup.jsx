import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Signup successful! Please check your email to verify your account.');
      navigate('/login');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">Create Account</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-blue-600">Email</label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full p-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-600">Password</label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full p-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                minLength={6}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-600">Confirm Password</label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" size={20} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 w-full p-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                minLength={6}
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-4 text-center">
          <span className="text-gray-600">Already have an account?</span>{' '}
          <a href="/login" className="text-blue-600 hover:text-blue-700 hover:underline">Login here</a>
        </div>
      </div>
    </div>
  );
};

export default Signup;