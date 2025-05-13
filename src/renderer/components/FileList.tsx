import React from 'react';
import { FileInfo } from '../types';
import { 
  FaFolder, 
  FaFile, 
  FaTrash
} from 'react-icons/fa';

interface FileListProps {
  files: FileInfo[];
  onNavigate: (path: string) => void;
  onDelete: (file: FileInfo) => void;
}

const FileList: React.FC<FileListProps> = ({ files, onNavigate, onDelete }) => {
  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // Handle file click
  const handleFileClick = (file: FileInfo) => {
    if (file.isDirectory) {
      onNavigate(file.path);
    }
  };

  // Handle delete button click
  const handleDeleteClick = (file: FileInfo, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the row click
    
    if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
      onDelete(file);
    }
  };

  return (
    <div className="mt-4 bg-white rounded-md shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Size
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Modified
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {files.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                This folder is empty
              </td>
            </tr>
          ) : (
            files
              .sort((a, b) => {
                // Directories first, then files
                if (a.isDirectory && !b.isDirectory) return -1;
                if (!a.isDirectory && b.isDirectory) return 1;
                // Alphabetically by name
                return a.name.localeCompare(b.name);
              })
              .map((file) => (
                <tr 
                  key={file.path}
                  onClick={() => handleFileClick(file)}
                  className={`hover:bg-gray-50 cursor-pointer ${file.isDirectory ? 'hover:bg-blue-50' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="flex-shrink-0 text-gray-600 mr-2">
                        {file.isDirectory ? <FaFolder className="text-yellow-500" /> : <FaFile className="text-gray-400" />}
                      </span>
                      <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900">{file.name}</div>
                        {file.error && <div className="text-xs text-red-500">{file.error}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {file.isDirectory ? '--' : formatFileSize(file.size)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(file.modified).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => handleDeleteClick(file, e)}
                      className="text-red-600 hover:text-red-900 focus:outline-none"
                      aria-label={`Delete ${file.name}`}
                      title={`Delete ${file.name}`}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FileList;