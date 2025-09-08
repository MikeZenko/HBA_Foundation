import { Document, Types } from 'mongoose';

// Base interfaces
export interface BaseEntity {
  _id?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// User types
export interface IUser {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  emailVerified: boolean;
  refreshTokens: string[];
}

export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user'
}

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): Promise<string>;
  generateRefreshToken(): Promise<string>;
  createdAt: Date;
  updatedAt: Date;
}

// Scholarship types
export interface IScholarship {
  scholarshipId: number; // Changed from 'id' to avoid conflict with Document._id
  name: string;
  organization: string;
  hostCountry: string;
  region: string;
  targetGroup: string;
  level: string[];
  deadline: string;
  funding: FundingType;
  fundingDetails?: string;
  returnHome: YesNo;
  website?: string;
  notes?: string;
  eligibility?: string;
  applicationProcess?: string;
  tags?: string[];
  isActive: boolean;
  viewCount: number;
  lastUpdated: Date;
}

export enum FundingType {
  YES = 'Yes',
  PARTIAL = 'Partial',
  NO = 'No'
}

export enum YesNo {
  YES = 'Yes',
  NO = 'No'
}

export interface IScholarshipDocument extends IScholarship, Document {}

// Contribution types
export interface IContribution {
  contributionId: string; // Changed from 'id' to avoid conflict with Document._id
  scholarshipName: string;
  organization: string;
  website: string;
  level: string;
  hostCountry: string;
  region?: string;
  targetGroup?: string;
  deadline: string;
  fundingType: FundingType;
  fundingDetails?: string;
  returnHome: YesNo;
  eligibility: string;
  applicationProcess: string;
  additionalNotes?: string;
  submitterName: string;
  submitterEmail: string;
  status: ContributionStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  timestamp: Date;
}

export enum ContributionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface IContributionDocument extends IContribution, Document {}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

// Filter and search types
export interface ScholarshipFilters {
  region?: string;
  hostCountry?: string;
  level?: string;
  funding?: FundingType;
  targetGroup?: string;
  deadline?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ContributionFilters {
  status?: ContributionStatus;
  submitterEmail?: string;
  region?: string;
  funding?: FundingType;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Request extensions
export interface AuthenticatedRequest {
  user?: IUserDocument;
  body: any;
  params: any;
  query: any;
  headers: any;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Statistics types
export interface DashboardStats {
  totalScholarships: number;
  totalContributions: number;
  pendingContributions: number;
  approvedContributions: number;
  rejectedContributions: number;
  totalUsers: number;
  recentActivity: RecentActivity[];
}

export interface RecentActivity {
  type: 'contribution' | 'scholarship' | 'user';
  action: string;
  description: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
}

// Configuration types
export interface AppConfig {
  port: number;
  host: string;
  nodeEnv: string;
  cors: {
    origin: string[];
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  mongodb: {
    uri: string;
    options: any;
  };
  email: {
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
    from: string;
  };
  upload: {
    maxSize: number;
    allowedTypes: string[];
    destination: string;
  };
  logging: {
    level: string;
    file: string;
  };
}

// Error types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  stack?: string;
}

export class CustomError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
} 