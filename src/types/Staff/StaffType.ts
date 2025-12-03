

export interface CustomResponse<T> {
    statusCode: number;
    error: string | null;
    customMessage: string;
    isSucess: boolean;
    value: T;
  }

  export interface StaffModel{
   
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
      kycDocumentNumber: number;
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
    }
      
