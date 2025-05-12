import React, { useEffect, useState } from 'react';
import { Calendar, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      // Replace '1' with session-based user_id later if you have authentication
      const response = await fetch('/items?user_id=1');

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Your Items</h2>
      {items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-600">No items found. Add some items to get started!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold mb-4 text-blue-700">{item.name}</h3>
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

export default ItemList;
