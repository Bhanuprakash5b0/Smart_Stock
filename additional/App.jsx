import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AddItem from './pages/AddItem';
import Profile from './pages/Profile';cls
import ItemList from './pages/ItemList';
import RemoveItem from './pages/RemoveItem';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route path="add" element={<AddItem />} />
            <Route path="profile" element={<Profile />} />
            <Route path="list" element={<ItemList />} />
            <Route path="remove" element={<RemoveItem />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;