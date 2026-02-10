// src/constants/apiEndpoints.ts

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://talkyapi.hestiatechnology.com/api';

export const API_ENDPOINTS = {
  STAFF: {
    GET_ALL: `${API_BASE_URL}/StaffUser/admin-getall-staff`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/StaffUser/admin-get-staffsinfo?staffid=${id}`,
    EDIT: (id: string) => `${API_BASE_URL}/StaffUser/admin-update-staff?staffid=${id}`,
    DELETE: (id: string | number) => `${API_BASE_URL}/StaffUser/Delete/${id}`,
  },
  WALLET_WITHDRAWAL: {
    GET_ALL: `${API_BASE_URL}/WalletwithdrawalRequest`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/WalletwithdrawalRequest/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/WalletwithdrawalRequest/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/WalletwithdrawalRequest/${id}`,
    UPDATE_STATUS: `${API_BASE_URL}/WalletwithdrawalRequest/update-WithdrawalStatus`, // NEW
    INITIATE_WITHDRAWAL: (appUserId: string) => `${API_BASE_URL}/WalletwithdrawalRequest/IntiateWithdrawal/${appUserId}`, // NEW
  },
  PURCHASE_COUPON: {
    GET_ALL: `${API_BASE_URL}/PurchaseCoupon/GetAll`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/PurchaseCoupon/GetById/${id}`,
    CREATE: `${API_BASE_URL}/PurchaseCoupon/Create`,
    UPDATE: (id: string) => `${API_BASE_URL}/PurchaseCoupon/Update/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/PurchaseCoupon/Delete/${id}`,
  },
  APP_USER: {
    GET_ALL: `${API_BASE_URL}/AppUser/admin-get-allusers`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/AppUser/admin-get-UserInfo?appUserId=${id}`,
    EDIT: `${API_BASE_URL}/AppUser/admin-update-appuser`,
    ENROLLSTAFF: `${API_BASE_URL}/AppUser/enroll-staff`,
    EDITGENDER: (id: string) => `${API_BASE_URL}/AppUser/enroll-staff/${id}`,
    PROFILEPIC_POST: `${API_BASE_URL}/AppUser/upload-profile-pic`,
  },
  WALLET_TRANSACTION: {
    GET_ALL: (id: string) => `${API_BASE_URL}/Wallet/wallet-transactions/${id}`,
  },
  COMPANY: {
    GET_ALL: `${API_BASE_URL}/Company/GetAll/admin-getall-company`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/Company/GetById/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/Company/Update/${id}`,
    CREATE: `${API_BASE_URL}/Company/Create`,
    DELETE: (id: string) => `${API_BASE_URL}/Company/Delete/${id}`,
    COMPANYLOGO_POST: `${API_BASE_URL}/Company/UploadCompanyLogo/upload-company-logo`,
  },
  Category: {
    GET_ALL: `${API_BASE_URL}/Category/GetAll/admin-getall-category`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/Category/GetById/${id}`,
    CREATE: `${API_BASE_URL}/Category/Create`,
    UPDATE: (id: string) => `${API_BASE_URL}/Category/Update/${id}`,
    GET_CompanyId: `${API_BASE_URL}/Company/GetCompanyLookUp/admin-lookUp-company`,
    DELETE: (id: string) => `${API_BASE_URL}/Category/Delete/${id}`,
  },
  FinacialYear: {
    GET_ALL: `${API_BASE_URL}/FinancialYear/GetAll`,
    CREATE: `${API_BASE_URL}/FinancialYear/Create`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/FinancialYear/GetById/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/FinancialYear/Update/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/FinancialYear/Delete/${id}`,
  },
  ADMIN_USER: {
    GET_ALL: `${API_BASE_URL}/User`,
    GET_BY_ID: (id: number) => `${API_BASE_URL}/User/${id}`,
    CREATE: `${API_BASE_URL}/User`,
    UPDATE: (id: number) => `${API_BASE_URL}/User/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/User/${id}`,
    CHANGE_PASSWORD: `${API_BASE_URL}/User/ChangePassWord`,
    UPLOAD_PROFILE_PIC: `${API_BASE_URL}/User/upload-profile-pic`,
  },
  AppNotification: {
    GET_ALL: `${API_BASE_URL}/AppNotification/GetAll/admin-getall-category`,
    CREATE: `${API_BASE_URL}/AppNotification/Create`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/AppNotification/GetById/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/AppNotification/Update/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/AppNotification/Delete/${id}`,
    UPLOAD_IMAGE: `${API_BASE_URL}/AppNotification/UploadNotificationImage/upload-notification-image`,
    SEND_TARGETED: `${API_BASE_URL}/AppNotification/SendTargetedNotification/send-targeted`,
  },
  PURCHASE_ORDER: {
    GET_ALL: `${API_BASE_URL}/PurchaseOrder/GetAll`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/PurchaseOrder/GetById/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/PurchaseOrder/Delete/${id}`,
  },
  AUDIT_LOG: {
    GET_BY_TABLE_AND_ID: (tableName: string, recordId: number) =>
      `${API_BASE_URL}/AuditLog/${tableName}/${recordId}`
  },
  ATTACHMENT: {
    GET_BY_TABLE_AND_ID: (tableName: string, recordId: number) =>
      `${API_BASE_URL}/Attachment/${tableName}/${recordId}`,
    GET_BY_ID: (attachmentId: number) => `${API_BASE_URL}/Attachment/${attachmentId}`,
    UPLOAD: `${API_BASE_URL}/Attachment/upload`,
    DELETE: (attachmentId: number) => `${API_BASE_URL}/Attachment/${attachmentId}`,
    GET: `${API_BASE_URL}/Attachment`,
    DOWNLOAD: (attachmentId: number) => `${API_BASE_URL}/Attachment/download/${attachmentId}`,
  },
  AppMasterSetting: {
    GET_ALL: `${API_BASE_URL}/AppMasterSetting`,
    CREATE: `${API_BASE_URL}/AppMasterSetting`,
    GET_CompanyId: `${API_BASE_URL}/Company/GetCompanyLookUp/admin-lookUp-company`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/AppMasterSetting/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/AppMasterSetting/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/AppMasterSetting/${id}`,
  },
  AUTH: {
    LOGIN: `${API_BASE_URL}/UserAuth/login`,
    REGISTER: `${API_BASE_URL}/UserAuth/register`,
    LOGOUT: `${API_BASE_URL}/UserAuth/logout`,
    FORGOT_PASSWORD: `${API_BASE_URL}/UserAuth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/UserAuth/reset-password`,
    CHANGE_PASSWORD: `${API_BASE_URL}/UserAuth/change-password`,
    ME: `${API_BASE_URL}/UserAuth/me`,
  },
};

export const getFullImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://sreenathganga-001-site12.jtempurl.com/api';
  const cleanBaseUrl = baseUrl.replace('/api', '');
  return `${cleanBaseUrl}/${imagePath.replace(/^\/+/, '')}`;
};

export const getBaseWebsiteUrl = (): string => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://sreenathganga-001-site12.jtempurl.com/api';
  return baseUrl.replace('/api', '');
};
