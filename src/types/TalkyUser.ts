// src/types/ApiTypes.ts


  export interface User{
    profilePic?: string | null; 
    appUserId?:number;
    name:string;
    email:string;
    gender:string;
    mobileNumber:number;
    registeredDate:Date|string;
    status:string;
    isBlocked:boolean;
    district:string;
    isKYCCompleted:boolean;
    referredBy:string|null;
    referralCode:string|null;
    profileImagePath:string;
    lastLogin:Date|string|null;
    isAudultVerificationCompleted:boolean;
    prefferedlanguage:string[];
    interests:string[];
    isStaff:boolean;
    otpGeneratedAt:Date|string;
    otp:number;
    otpResendCount:number;
    isLockedOut:boolean;
    lastOTPRequestTime:Date|string;
    walletTransactions:null|any;
    otpAttempts:number;
    walletBalance:number;
    isDeleted:boolean;
    
  }
  