export interface Env {
  API_TOKEN: string;
}

export interface User {
  id: string;
  role: string;
  permissions: string[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
  timestamp: string;
}

export interface TokenInfo {
  isValid: boolean;
  permissions: string[];
  expiresAt: string;
  tokenType: string;
}

export interface SystemStatus {
  status: string;
  version: string;
  environment: string;
  services: {
    database: string;
    cache: string;
    worker: string;
  };
  resources: {
    cpu: string;
    memory: string;
    requests: string;
  };
  timestamp: string;
} 