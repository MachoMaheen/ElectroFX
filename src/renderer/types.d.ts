export interface FileInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  created: Date;
  modified: Date;
  error?: string;
}

export interface DirectoryContents {
  path: string;
  files: FileInfo[];
  error?: string;
}

export interface DeleteResult {
  success?: boolean;
  error?: string;
  requiresElevation?: boolean;
}

export interface DirectorySelectResult {
  path?: string;
  canceled?: boolean;
}

export interface TestResult {
  success: boolean;
  message: string;
}

declare global {
  interface Window {
    api: {
      testIpc: () => Promise<TestResult>;
      listDirectory: (path: string) => Promise<DirectoryContents>;
      deleteFile: (path: string) => Promise<DeleteResult>;
      selectDirectory: () => Promise<DirectorySelectResult>;
      platform: string;
    }
  }
}