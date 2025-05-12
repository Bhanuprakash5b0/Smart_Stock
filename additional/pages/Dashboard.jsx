import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }
    const userData = JSON.parse(user);
    setUserName(userData.email?.split('@')[0] || 'User');
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-blue-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-blue-700">Welcome, {userName}!</h1>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;