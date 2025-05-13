import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

// Promisify exec for easier async/await usage
const execAsync = promisify(exec);

// Keep a global reference of the window object to prevent garbage collection
let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Try to load the HTML file with proper path error handling
  const htmlPath = path.join(__dirname, 'index.html');
  
  // Log path information for debugging
  console.log('Current directory:', __dirname);
  console.log('HTML path:', htmlPath);
  console.log('HTML file exists:', fs.existsSync(htmlPath));
  
  // Load the HTML file
  mainWindow.loadFile(htmlPath);
  
  // Open DevTools for debugging during development
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create window when app is ready
app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Basic IPC handler for testing connectivity
ipcMain.handle('test-ipc', async () => {
  return { success: true, message: "IPC is working!" };
});

// Handle directory listing with full file stats
ipcMain.handle('list-directory', async (_, dirPath: string) => {
  try {
    // If no path is provided, use the home directory as default
    const directory = dirPath || os.homedir();
    console.log('Listing directory:', directory);
    
    const files = await fs.promises.readdir(directory);
    const fileStats = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(directory, file);
        try {
          const stats = await fs.promises.stat(filePath);
          return {
            name: file,
            path: filePath,
            isDirectory: stats.isDirectory(),
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
          };
        } catch (error) {
          // Handle permissions errors gracefully
          return {
            name: file,
            path: filePath,
            isDirectory: false,
            size: 0,
            created: new Date(),
            modified: new Date(),
            error: 'Permission denied'
          };
        }
      })
    );
    
    return {
      path: directory,
      files: fileStats
    };
  } catch (error) {
    console.error('Error listing directory:', error);
    return { error: (error as Error).message };
  }
});

// Handle file/directory deletion
ipcMain.handle('delete-file', async (_, filePath: string) => {
  try {
    // Check if path exists
    await fs.promises.access(filePath);
    
    // Check if it's a directory or a file
    const stats = await fs.promises.stat(filePath);
    
    if (stats.isDirectory()) {
      await fs.promises.rmdir(filePath, { recursive: true });
    } else {
      await fs.promises.unlink(filePath);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting file/directory:', error);
    
    // Handle permission errors specifically
    if ((error as NodeJS.ErrnoException).code === 'EACCES') {
      return { 
        error: 'Permission denied. This file requires elevated privileges to delete.',
        requiresElevation: true
      };
    }
    
    return { error: (error as Error).message };
  }
});

// Handle file deletion with elevated privileges
ipcMain.handle('delete-file-elevated', async (_, filePath: string, password: string) => {
  try {
    // Make sure path exists
    await fs.promises.access(filePath);
    
    // Check if it's a directory or file
    const stats = await fs.promises.stat(filePath);
    const isDirectory = stats.isDirectory();
    
    // OS-specific deletion with elevated privileges
    if (process.platform === 'win32') {
      // Windows - Use PowerShell with elevated permissions
      // For Windows, we use PowerShell's Start-Process with -Verb RunAs to trigger UAC
      const command = isDirectory
        ? `powershell.exe -Command "Start-Process -Verb RunAs cmd.exe -ArgumentList '/c rd /s /q \\"${filePath}\\"'"`
        : `powershell.exe -Command "Start-Process -Verb RunAs cmd.exe -ArgumentList '/c del /f /q \\"${filePath}\\"'"`;
      
      await execAsync(command);
      return { success: true };
    } else if (process.platform === 'darwin' || process.platform === 'linux') {
      // macOS/Linux - Use sudo
      // Escape the path for shell usage
      const escapedPath = filePath.replace(/'/g, "'\\''");
      
      // Use echo to pipe the password to sudo
      const command = isDirectory
        ? `echo '${password}' | sudo -S rm -rf '${escapedPath}'`
        : `echo '${password}' | sudo -S rm -f '${escapedPath}'`;
      
      try {
        await execAsync(command);
        return { success: true };
      } catch (err) {
        // Check if the error is due to incorrect password
        const errorMsg = (err as { stderr?: string }).stderr || '';
        if (errorMsg.includes('incorrect password') || errorMsg.includes('Sorry, try again')) {
          return { error: 'Incorrect password. Please try again.' };
        }
        throw err;
      }
    } else {
      // Unsupported platform
      return { error: 'Elevated permissions not supported on this platform.' };
    }
  } catch (error) {
    console.error('Error deleting with elevated privileges:', error);
    return { error: (error as Error).message };
  }
});

// Handle directory selection via system dialog
ipcMain.handle('select-directory', async () => {
  if (!mainWindow) return { canceled: true };
  
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return { path: result.filePaths[0] };
  }
  
  return { canceled: true };
});