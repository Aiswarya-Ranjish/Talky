// src/types/Staff/WalletWithdrawal.type.ts

import { AuditTrails } from "../common/AuditLog.types";

export interface WalletWithdrawal {
  walletWithdrawalRequestId: number;
  appUserId: number;
  appUserName: string;
  coins: number;
  amount: number;
  createdAt: string | Date;
  status: number; // 0 = Pending, 1 = Approved, 2 = Rejected
  isDeleted: boolean;
  companyId: number;
  audiitLgs?: AuditTrails[];
}