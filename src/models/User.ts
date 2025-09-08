import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUser, IUserDocument, UserRole } from '../types';
import { config } from '../config';
import { logAuth } from '../utils/logger';

const userSchema = new Schema<IUserDocument>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  refreshTokens: [{
    type: String
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.refreshTokens;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(this: IUserDocument, next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(this: IUserDocument, candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    logAuth('password_comparison_error', this._id.toString(), this.email, false, (error as Error).message);
    return false;
  }
};

// Instance method to generate auth token
userSchema.methods.generateAuthToken = async function(this: IUserDocument): Promise<string> {
  try {
    const payload = {
      userId: this._id.toString(),
      email: this.email,
      role: this.role
    };

    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
      issuer: 'hba-foundation',
      audience: 'hba-foundation-users'
    });

    logAuth('token_generated', this._id.toString(), this.email, true);
    return token;
  } catch (error) {
    logAuth('token_generation_error', this._id.toString(), this.email, false, (error as Error).message);
    throw error;
  }
};

// Instance method to generate refresh token
userSchema.methods.generateRefreshToken = async function(this: IUserDocument): Promise<string> {
  try {
    const payload = {
      userId: this._id.toString(),
      email: this.email,
      type: 'refresh'
    };

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: 'hba-foundation',
      audience: 'hba-foundation-users'
    });

    // Add refresh token to user's refresh tokens array
    this.refreshTokens.push(refreshToken);
    
    // Keep only the last 5 refresh tokens
    if (this.refreshTokens.length > 5) {
      this.refreshTokens = this.refreshTokens.slice(-5);
    }
    
    await this.save();

    logAuth('refresh_token_generated', this._id.toString(), this.email, true);
    return refreshToken;
  } catch (error) {
    logAuth('refresh_token_generation_error', this._id.toString(), this.email, false, (error as Error).message);
    throw error;
  }
};

// Static method to find user by email and include password
userSchema.statics.findByEmailWithPassword = function(email: string) {
  return this.findOne({ email }).select('+password');
};

// Static method to verify refresh token
userSchema.statics.verifyRefreshToken = async function(refreshToken: string) {
  try {
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;
    const user = await this.findById(decoded.userId);
    
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return null;
    }
    
    return user;
  } catch (error) {
    return null;
  }
};

// Static method to revoke refresh token
userSchema.statics.revokeRefreshToken = async function(userId: string, refreshToken: string) {
  try {
    const user = await this.findById(userId);
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
      await user.save();
      logAuth('refresh_token_revoked', userId, user.email, true);
    }
  } catch (error) {
    logAuth('refresh_token_revocation_error', userId, '', false, (error as Error).message);
  }
};

// Static method to revoke all refresh tokens for a user
userSchema.statics.revokeAllRefreshTokens = async function(userId: string) {
  try {
    const user = await this.findById(userId);
    if (user) {
      user.refreshTokens = [];
      await user.save();
      logAuth('all_refresh_tokens_revoked', userId, user.email, true);
    }
  } catch (error) {
    logAuth('all_refresh_tokens_revocation_error', userId, '', false, (error as Error).message);
  }
};

// Virtual for user's full profile
userSchema.virtual('profile').get(function(this: IUserDocument) {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    isActive: this.isActive,
    emailVerified: this.emailVerified,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
});

export const User = model<IUserDocument>('User', userSchema);
export default User; 