import React, { useState } from 'react';
import { Calendar, Image, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const AddItem = () => {
  const [isManual, setIsManual] = useState(true);
  const [productName, setProductName] = useState('');
  const [manufactureDate, setManufactureDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  // Manual item submit
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/additem/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productName,
          manufacture_date: manufactureDate,
          expiry_date: expiryDate,
          user_id: 1 // for now use a fixed user id — replace later with session-based id
        })
      });

      const result = await response.json();
      if (response.ok) {
        toast.success('Item added successfully!');
        setProductName('');
        setManufactureDate('');
        setExpiryDate('');
      } else {
        toast.error(result.message || 'Failed to add item');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    if (!frontImage || !backImage) {
      toast.error('Please upload both images');
      return;
    }

    setIsProcessing(true);
    const processingToast = toast.loading('Processing images...');

    try {
      const frontBase64 = await convertToBase64(frontImage);
      const backBase64 = await convertToBase64(backImage);

      const response = await fetch('/additem/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frontImage: frontBase64,
          backImage: backBase64,
          user_id: 1
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to process images');
      }

      setExtractedData(result);
      toast.success('Images processed successfully!', { id: processingToast });
    } catch (error) {
      console.error('Processing error:', error);
      toast.error(error.message, { id: processingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmExtractedData = async () => {
    if (!extractedData) {
      toast.error('No extracted data available');
      return;
    }

    try {
      const response = await fetch('/additem/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: extractedData.productName,
          manufacture_date: extractedData.manufactureDate,
          expiry_date: extractedData.expiryDate,
          user_id: 1
        }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success('Item added successfully!');
        setExtractedData(null);
        setFrontImage(null);
        setBackImage(null);
      } else {
        toast.error(result.message || 'Failed to add item');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleImageChange = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      if (type === 'front') {
        setFrontImage(e.target.files[0]);
      } else {
        setBackImage(e.target.files[0]);
      }
    }
  };

  // Rest of the JSX layout (same as yours, so leaving it as-is)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 flex space-x-4">
        <button
          onClick={() => setIsManual(true)}
          className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 ${
            isManual ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <Package size={20} />
          <span>Manual Entry</span>
        </button>
        <button
          onClick={() => setIsManual(false)}
          className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 ${
            !isManual ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <Image size={20} />
          <span>Image Upload</span>
        </button>
      </div>

      {/* Manual Form */}
      {isManual ? (
        <form onSubmit={handleManualSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Manufacture Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                value={manufactureDate}
                onChange={(e) => setManufactureDate(e.target.value)}
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Item
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Image upload section */}
          <form onSubmit={handleImageSubmit} className="space-y-6">
            {/* Front Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Front Image (Product Name)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'front')} disabled={isProcessing} />
              </div>
              {frontImage && <p className="mt-2 text-sm text-green-600">Selected: {frontImage.name}</p>}
            </div>

            {/* Back Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Back Image (Dates)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'back')} disabled={isProcessing} />
              </div>
              {backImage && <p className="mt-2 text-sm text-green-600">Selected: {backImage.name}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isProcessing || !frontImage || !backImage}
            >
              {isProcessing ? 'Processing...' : 'Process Images'}
            </button>
          </form>

          {/* Extracted Data */}
          {extractedData && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Extracted Information</h3>
              <div className="space-y-4">
                <div><label>Product Name</label><p>{extractedData.productName}</p></div>
                <div><label>Manufacture Date</label><p>{extractedData.manufactureDate}</p></div>
                <div><label>Expiry Date</label><p>{extractedData.expiryDate}</p></div>
                <button onClick={handleConfirmExtractedData} className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700">
                  Confirm and Add Item
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddItem;
