import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, MinusCircle, User, List } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="h-screen w-64 bg-blue-800 text-white p-6">
      <div className="space-y-2">
        <Link 
          to="/dashboard/add" 
          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle size={20} />
          <span>Add Item</span>
        </Link>
        <Link 
          to="/dashboard/remove" 
          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MinusCircle size={20} />
          <span>Remove Item</span>
        </Link>
        <Link 
          to="/dashboard/profile" 
          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <User size={20} />
          <span>Get Profile</span>
        </Link>
        <Link 
          to="/dashboard/list" 
          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <List size={20} />
          <span>Show List</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;