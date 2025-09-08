"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const types_1 = require("../types");
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
const userSchema = new mongoose_1.Schema({
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
        select: false
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    role: {
        type: String,
        enum: Object.values(types_1.UserRole),
        default: types_1.UserRole.USER,
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
        transform: function (doc, ret) {
            delete ret.password;
            delete ret.refreshTokens;
            delete ret.__v;
            return ret;
        }
    }
});
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const salt = await bcryptjs_1.default.genSalt(12);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcryptjs_1.default.compare(candidatePassword, this.password);
    }
    catch (error) {
        (0, logger_1.logAuth)('password_comparison_error', this._id.toString(), this.email, false, error.message);
        return false;
    }
};
userSchema.methods.generateAuthToken = async function () {
    try {
        const payload = {
            userId: this._id.toString(),
            email: this.email,
            role: this.role
        };
        const token = jsonwebtoken_1.default.sign(payload, config_1.config.jwt.secret, {
            expiresIn: config_1.config.jwt.expiresIn,
            issuer: 'hba-foundation',
            audience: 'hba-foundation-users'
        });
        (0, logger_1.logAuth)('token_generated', this._id.toString(), this.email, true);
        return token;
    }
    catch (error) {
        (0, logger_1.logAuth)('token_generation_error', this._id.toString(), this.email, false, error.message);
        throw error;
    }
};
userSchema.methods.generateRefreshToken = async function () {
    try {
        const payload = {
            userId: this._id.toString(),
            email: this.email,
            type: 'refresh'
        };
        const refreshToken = jsonwebtoken_1.default.sign(payload, config_1.config.jwt.refreshSecret, {
            expiresIn: config_1.config.jwt.refreshExpiresIn,
            issuer: 'hba-foundation',
            audience: 'hba-foundation-users'
        });
        this.refreshTokens.push(refreshToken);
        if (this.refreshTokens.length > 5) {
            this.refreshTokens = this.refreshTokens.slice(-5);
        }
        await this.save();
        (0, logger_1.logAuth)('refresh_token_generated', this._id.toString(), this.email, true);
        return refreshToken;
    }
    catch (error) {
        (0, logger_1.logAuth)('refresh_token_generation_error', this._id.toString(), this.email, false, error.message);
        throw error;
    }
};
userSchema.statics.findByEmailWithPassword = function (email) {
    return this.findOne({ email }).select('+password');
};
userSchema.statics.verifyRefreshToken = async function (refreshToken) {
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.config.jwt.refreshSecret);
        const user = await this.findById(decoded.userId);
        if (!user || !user.refreshTokens.includes(refreshToken)) {
            return null;
        }
        return user;
    }
    catch (error) {
        return null;
    }
};
userSchema.statics.revokeRefreshToken = async function (userId, refreshToken) {
    try {
        const user = await this.findById(userId);
        if (user) {
            user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
            await user.save();
            (0, logger_1.logAuth)('refresh_token_revoked', userId, user.email, true);
        }
    }
    catch (error) {
        (0, logger_1.logAuth)('refresh_token_revocation_error', userId, '', false, error.message);
    }
};
userSchema.statics.revokeAllRefreshTokens = async function (userId) {
    try {
        const user = await this.findById(userId);
        if (user) {
            user.refreshTokens = [];
            await user.save();
            (0, logger_1.logAuth)('all_refresh_tokens_revoked', userId, user.email, true);
        }
    }
    catch (error) {
        (0, logger_1.logAuth)('all_refresh_tokens_revocation_error', userId, '', false, error.message);
    }
};
userSchema.virtual('profile').get(function () {
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
exports.User = (0, mongoose_1.model)('User', userSchema);
exports.default = exports.User;
//# sourceMappingURL=User.js.map