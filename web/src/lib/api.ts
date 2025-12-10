// API client for HBA Foundation backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Scholarship type from backend
export interface BackendScholarship {
  id: number;
  name: string;
  organization: string;
  hostCountry: string;
  region: string;
  targetGroup?: string;
  level: string[];
  deadline: string;
  funding: string;
  fundingDetails?: string;
  returnHome?: string;
  website: string;
  notes?: string;
  eligibility?: string;
  applicationProcess?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Contribution {
  id: number;
  scholarshipName: string;
  organization: string;
  website: string;
  level: string;
  hostCountry: string;
  targetGroup: string;
  deadline: string;
  fundingType: string;
  fundingDetails: string;
  eligibility: string;
  applicationProcess: string;
  additionalNotes?: string;
  submitterName: string;
  submitterEmail: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  updatedAt?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Fetch all contributions
export async function fetchContributions(): Promise<Contribution[]> {
  const res = await fetch(`${API_URL}/api/contributions`, {
    credentials: 'include',
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch contributions');
  }
  
  return res.json();
}

// Fetch single contribution
export async function fetchContribution(id: number): Promise<Contribution> {
  const res = await fetch(`${API_URL}/api/contributions/${id}`, {
    credentials: 'include',
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch contribution');
  }
  
  return res.json();
}

// Update contribution
export async function updateContribution(id: number, data: Partial<Contribution>): Promise<ApiResponse> {
  const res = await fetch(`${API_URL}/api/contributions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  
  return res.json();
}

// Delete contribution permanently
export async function deleteContribution(id: number): Promise<ApiResponse> {
  const res = await fetch(`${API_URL}/api/contributions/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  
  return res.json();
}

// Approve contribution
export async function approveContribution(id: number): Promise<ApiResponse> {
  const res = await fetch(`${API_URL}/api/approve-scholarship`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ id }),
  });
  
  return res.json();
}

// Reject contribution
export async function rejectContribution(id: number): Promise<ApiResponse> {
  const res = await fetch(`${API_URL}/api/reject-scholarship`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ id }),
  });
  
  return res.json();
}

// Set contribution back to pending
export async function setPendingContribution(id: number): Promise<ApiResponse> {
  const res = await fetch(`${API_URL}/api/contributions/${id}/pending`, {
    method: 'POST',
    credentials: 'include',
  });
  
  return res.json();
}

// Hide contribution (remove from public view)
export async function hideContribution(id: number): Promise<ApiResponse> {
  const res = await fetch(`${API_URL}/api/remove-scholarship`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ id }),
  });
  
  return res.json();
}

// Authentication
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: number;
    email: string;
    role: string;
  };
  message?: string;
}

// Login
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  
  return res.json();
}

// ============ Scholarship Management ============

// Fetch all scholarships from backend
export async function fetchScholarships(): Promise<BackendScholarship[]> {
  const res = await fetch(`${API_URL}/api/scholarships`, {
    credentials: 'include',
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch scholarships');
  }
  
  return res.json();
}

// Fetch single scholarship
export async function fetchScholarship(id: number): Promise<BackendScholarship> {
  const res = await fetch(`${API_URL}/api/scholarships/${id}`, {
    credentials: 'include',
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch scholarship');
  }
  
  return res.json();
}

// Create new scholarship
export async function createScholarship(data: Omit<BackendScholarship, 'id'>): Promise<ApiResponse> {
  const res = await fetch(`${API_URL}/api/scholarships`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  
  return res.json();
}

// Update scholarship
export async function updateScholarship(id: number, data: Partial<BackendScholarship>): Promise<ApiResponse> {
  const res = await fetch(`${API_URL}/api/scholarships/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  
  return res.json();
}

// Delete scholarship
export async function deleteScholarship(id: number): Promise<ApiResponse> {
  const res = await fetch(`${API_URL}/api/scholarships/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  
  return res.json();
}



