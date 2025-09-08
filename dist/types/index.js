"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = exports.ContributionStatus = exports.YesNo = exports.FundingType = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["MODERATOR"] = "moderator";
    UserRole["USER"] = "user";
})(UserRole || (exports.UserRole = UserRole = {}));
var FundingType;
(function (FundingType) {
    FundingType["YES"] = "Yes";
    FundingType["PARTIAL"] = "Partial";
    FundingType["NO"] = "No";
})(FundingType || (exports.FundingType = FundingType = {}));
var YesNo;
(function (YesNo) {
    YesNo["YES"] = "Yes";
    YesNo["NO"] = "No";
})(YesNo || (exports.YesNo = YesNo = {}));
var ContributionStatus;
(function (ContributionStatus) {
    ContributionStatus["PENDING"] = "pending";
    ContributionStatus["APPROVED"] = "approved";
    ContributionStatus["REJECTED"] = "rejected";
})(ContributionStatus || (exports.ContributionStatus = ContributionStatus = {}));
class CustomError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.CustomError = CustomError;
//# sourceMappingURL=index.js.map