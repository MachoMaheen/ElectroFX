import React, { useState } from 'react';
import { FileInfo } from '../types';
import { FaShieldAlt, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

interface ElevatedDeleteDialogProps {
  file: FileInfo;
  onConfirm: (password: string) => void;
  onCancel: () => void;
  platform: string;
}

const ElevatedDeleteDialog: React.FC<ElevatedDeleteDialogProps> = ({ 
  file, 
  onConfirm, 
  onCancel,
  platform
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Password is required');
      return;
    }
    
    onConfirm(password);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <FaShieldAlt className="text-yellow-500 mr-2" />
            Elevated Permissions Required
          </h3>
          <button 
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="mb-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="text-yellow-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  The file <strong>{file.name}</strong> requires administrator privileges to delete.
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            {platform === 'win32' ? (
              'Windows User Account Control (UAC) will be used to execute this operation.'
            ) : (
              'Your sudo password is required to execute this operation with elevated privileges.'
            )}
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {platform !== 'win32' && (
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Administrator Password:
              </label>
              <input 
                type="password" 
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your sudo password"
                autoFocus
              />
              {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
              )}
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {platform === 'win32' ? 'Continue as Administrator' : 'Delete with Sudo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ElevatedDeleteDialog;