import React, { useEffect, useState } from 'react';
import { Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // Replace `1` with actual logged-in user id via session/cookie later
      const response = await fetch('/profile?user_id=1');

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      if (!data) {
        toast.error('No profile found');
        return;
      }

      setProfile(data);
    } catch (error) {
      toast.error('Failed to load profile');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-blue-700">User Profile</h2>
        {profile ? (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Mail className="text-blue-600" size={24} />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-lg font-medium">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <User className="text-blue-600" size={24} />
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="text-lg font-medium">{profile.name || profile.email?.split('@')[0]}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">No profile information available</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
