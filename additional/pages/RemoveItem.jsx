import React, { useEffect, useState } from 'react';
import { Calendar, Package, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const RemoveItem = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/items?user_id=1'); // Replace 1 with logged-in user id via session later

      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await response.json();
      setItems(data || []);
    } catch (error) {
      toast.error('Failed to load items');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId, itemName) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${itemName}"?`);

    if (!confirmed) return;

    try {
      const response = await fetch(`/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      setItems(items.filter(item => item.id !== itemId));
      toast.success('Item removed successfully');
    } catch (error) {
      toast.error('Failed to remove item');
      console.error('Error:', error);
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
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Remove Items</h2>
      {items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-600">No items found to remove.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-blue-700">{item.name}</h3>
                <button
                  onClick={() => handleRemoveItem(item.id, item.name)}
                  className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50"
                  title="Remove item"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Calendar size={18} className="mr-2 text-blue-500" />
                  <span>Manufacturing Date: {new Date(item.manufacture_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar size={18} className="mr-2 text-blue-500" />
                  <span>Expiry Date: {new Date(item.expiry_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RemoveItem;
