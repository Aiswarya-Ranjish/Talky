// src/types/settings/SystemConfig.types.ts

import { AuditTrails } from "../common/AuditLog.types";

export interface systemconfig {
  appMasterSettingId: number;
  currentCompanyId: string; // API uses string for consistency with select values
  intCurrentFinancialYear: string;
  rewardCoins:number;
  isActive: boolean;
  staff_To_User_Rate_Per_Second: number;
  one_paisa_to_coin_rate: number;
  minimumWithdrawalCoins: number; // ✅ Added missing field
  auditLogs?: AuditTrails[];
}