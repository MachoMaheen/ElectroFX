import { contextBridge, ipcRenderer } from 'electron';

// Define validators for IPC inputs to prevent malicious data
const validationRules = {
  isString: (value: unknown): value is string => 
    typeof value === 'string',
  
  isValidPath: (path: string): boolean => {
    // Basic path validation - could be enhanced based on your security requirements
    return typeof path === 'string' && 
           path.length < 1000;     // Reasonable path length limit
  }
};

// Securely expose protected methods to renderer
contextBridge.exposeInMainWorld('api', {
  // Testing function to see if IPC is working
  testIpc: () => ipcRenderer.invoke('test-ipc'),
  
  // File operations with validation
  listDirectory: (path: unknown) => {
    if (!validationRules.isString(path) && path !== '') {
      console.error('Invalid path parameter in listDirectory');
      return Promise.reject(new Error('Invalid path parameter'));
    }
    return ipcRenderer.invoke('list-directory', path);
  },
  
  deleteFile: (path: unknown) => {
    if (!validationRules.isString(path) || !validationRules.isValidPath(path)) {
      console.error('Invalid path parameter in deleteFile');
      return Promise.reject(new Error('Invalid path parameter'));
    }
    return ipcRenderer.invoke('delete-file', path);
  },
  
  deleteFileWithElevatedPrivileges: (path: unknown, password: unknown) => {
    if (!validationRules.isString(path) || !validationRules.isValidPath(path)) {
      console.error('Invalid path parameter in deleteFileWithElevatedPrivileges');
      return Promise.reject(new Error('Invalid path parameter'));
    }
    
    if (!validationRules.isString(password)) {
      console.error('Invalid password parameter in deleteFileWithElevatedPrivileges');
      return Promise.reject(new Error('Invalid password parameter'));
    }
    
    return ipcRenderer.invoke('delete-file-elevated', path, password);
  },
  
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  
  // System information (readonly property)
  platform: process.platform
});