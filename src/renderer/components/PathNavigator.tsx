import React from 'react';
import path from 'path';
import { FaHome, FaFolderOpen, FaArrowUp } from 'react-icons/fa';

interface PathNavigatorProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onSelectDirectory: () => void;
}

const PathNavigator: React.FC<PathNavigatorProps> = ({ 
  currentPath, 
  onNavigate,
  onSelectDirectory
}) => {
  // Navigate to parent directory
  const navigateToParent = () => {
    const parentPath = path.dirname(currentPath);
    onNavigate(parentPath);
  };

  // Navigate to home directory
  const navigateToHome = () => {
    onNavigate('');
  };

  // Parse path segments for breadcrumb navigation
  const getPathSegments = () => {
    if (!currentPath) return [];
    
    const segments = currentPath.split(path.sep).filter(Boolean);
    let accumulatedPath = '';
    
    if (path.isAbsolute(currentPath)) {
      accumulatedPath = path.sep; // Start with root for absolute paths
    }
    
    return segments.map((segment, index) => {
      accumulatedPath = path.join(accumulatedPath, segment);
      return {
        name: segment,
        path: accumulatedPath,
      };
    });
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex space-x-2">
        <button
          onClick={navigateToHome}
          className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded transition-colors"
          title="Home Directory"
        >
          <FaHome className="mr-1" />
          <span>Home</span>
        </button>
        
        <button
          onClick={navigateToParent}
          className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded transition-colors"
          title="Parent Directory"
          disabled={!currentPath}
        >
          <FaArrowUp className="mr-1" />
          <span>Up</span>
        </button>
        
        <button
          onClick={onSelectDirectory}
          className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded transition-colors"
          title="Select Directory"
        >
          <FaFolderOpen className="mr-1" />
          <span>Select Folder</span>
        </button>
      </div>
      
      <div className="flex items-center bg-white p-2 rounded shadow-sm text-sm">
        <div className="flex-grow overflow-x-auto whitespace-nowrap">
          {path.isAbsolute(currentPath) && (
            <span 
              className="text-blue-500 hover:text-blue-700 hover:underline cursor-pointer mx-1"
              onClick={() => onNavigate(path.sep)}
            >
              {path.sep}
            </span>
          )}
          
          {getPathSegments().map((segment, index, segments) => (
            <React.Fragment key={segment.path}>
              <span 
                className="text-blue-500 hover:text-blue-700 hover:underline cursor-pointer"
                onClick={() => onNavigate(segment.path)}
              >
                {segment.name}
              </span>
              {index < segments.length - 1 && <span className="mx-1">{path.sep}</span>}
            </React.Fragment>
          ))}
          
          {getPathSegments().length === 0 && !path.isAbsolute(currentPath) && (
            <span className="text-gray-500">Home Directory</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PathNavigator;