import React, { useState, useEffect } from 'react';
import { FileInfo, DirectoryContents, DeleteResult } from './types';
import FileList from './components/FileList';
import PathNavigator from './components/PathNavigator';
import ElevatedDeleteDialog from './components/ElevatedDeleteDialog';
import './index.css';

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [directoryContents, setDirectoryContents] = useState<DirectoryContents | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fileToElevate, setFileToElevate] = useState<FileInfo | null>(null);
  const [showElevatedDialog, setShowElevatedDialog] = useState<boolean>(false);

  // Load directory contents when path changes
  useEffect(() => {
    const loadDirectory = async (path: string) => {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading directory:', path);
        const contents = await window.api.listDirectory(path);
        setDirectoryContents(contents);
      } catch (err) {
        console.error('Error loading directory:', err);
        setError(`Failed to load directory: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    };

    loadDirectory(currentPath);
  }, [currentPath]);

  // Handle navigation to a different directory
  const handleNavigate = (path: string) => {
    console.log('Navigating to:', path);
    setCurrentPath(path);
  };

  // Handle file/directory deletion
  const handleDelete = async (file: FileInfo) => {
    try {
      console.log('Deleting:', file.path);
      const result: DeleteResult = await window.api.deleteFile(file.path);
      
      if (result.success) {
        // Refresh the current directory after successful deletion
        const contents = await window.api.listDirectory(currentPath);
        setDirectoryContents(contents);
      } else if (result.requiresElevation) {
        // Show elevated permission dialog if needed
        setFileToElevate(file);
        setShowElevatedDialog(true);
      } else if (result.error) {
        alert(`Error deleting ${file.name}: ${result.error}`);
      }
    } catch (err) {
      console.error('Error during deletion:', err);
      alert(`Failed to delete: ${(err as Error).message}`);
    }
  };

  // Handle deletion with elevated permissions
  const handleElevatedDelete = async (password: string) => {
    if (!fileToElevate) return;
    
    try {
      const result = await window.api.deleteFileWithElevatedPrivileges(fileToElevate.path, password);
      
      if (result.success) {
        // Refresh directory after successful deletion
        const contents = await window.api.listDirectory(currentPath);
        setDirectoryContents(contents);
        setShowElevatedDialog(false);
        setFileToElevate(null);
      } else if (result.error) {
        alert(`Error deleting file: ${result.error}`);
      }
    } catch (err) {
      console.error('Error during elevated deletion:', err);
      alert(`Failed to delete with elevated privileges: ${(err as Error).message}`);
    }
  };

  // Handle directory selection via system dialog
  const handleSelectDirectory = async () => {
    try {
      const result = await window.api.selectDirectory();
      if (!result.canceled && result.path) {
        handleNavigate(result.path);
      }
    } catch (err) {
      console.error('Error selecting directory:', err);
      setError(`Failed to select directory: ${(err as Error).message}`);
    }
  };

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">File Explorer</h1>
      
      <div className="mb-4">
        <PathNavigator 
          currentPath={directoryContents?.path || ''} 
          onNavigate={handleNavigate}
          onSelectDirectory={handleSelectDirectory}
        />
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center flex-grow">
          <div className="spinner"></div>
          <p className="ml-2">Loading...</p>
        </div>
      ) : (
        <div className="flex-grow overflow-auto">
          {directoryContents && (
            <FileList 
              files={directoryContents.files} 
              onNavigate={handleNavigate}
              onDelete={handleDelete}
            />
          )}
        </div>
      )}
      
      <div className="mt-4 bg-blue-100 p-2 rounded text-sm text-gray-700">
        <p>Platform: {window.api.platform}</p>
      </div>

      {/* Elevated Delete Dialog */}
      {showElevatedDialog && fileToElevate && (
        <ElevatedDeleteDialog
          file={fileToElevate}
          onConfirm={handleElevatedDelete}
          onCancel={() => {
            setShowElevatedDialog(false);
            setFileToElevate(null);
          }}
          platform={window.api.platform}
        />
      )}
    </div>
  );
};

export default App;