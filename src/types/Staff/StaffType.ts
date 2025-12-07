import { AuditTrails } from "../common/AuditLog.types";

export interface StaffModel{
      error: any;
      isSucess: boolean;
      customMessage: any;
   
      staffUserId?: number;
      appUserId: number;
      bio: string;
      name: string;
      email: string;
      mobileNumber: string;
      gender: string;
      registeredDate: string|Date;
      isBlocked: boolean;
      isDeleted: boolean;
      address: string ;
      referredBy: string;
      referralCode: string;
      kycDocument: string;
      kycDocumentNumber: string;
      isKYCCompleted: boolean;
      kycCompletedDate: string | Date;
      isAudioEnbaled: boolean;  
      isVideoEnabled: boolean;
      isOnline: boolean;
      starRating: number;
      customerCoinsPerSecondVideo: number;
      customerCoinsPerSecondAudio: number;
      companyCoinsPerSecondVideo: number;
      companyCoinsPerSecondAudio: number;
      profileImagePath: string;
      lastLogin: string | Date;
      walletBalance: number;
      priority:number;
      auditLogs?: AuditTrails[];
    }
      
