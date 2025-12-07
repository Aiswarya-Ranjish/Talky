import { API_ENDPOINTS } from "../../constants/API_ENDPOINTS";
import type { AuditLogResponse, AuditTrails } from "../../types/common/AuditLog.types";
import HttpService from "./HttpService";
 
class AuditLogService {
 
  static async getByTableAndId(
    tableName: string,
    recordId: number | string
  ): Promise<AuditLogResponse> {
    return HttpService.callApi(
      API_ENDPOINTS.AUDIT_LOG.GET_BY_TABLE_AND_ID(tableName, Number(recordId)),
      "GET"
    );
  }
 
 
  static async getLogsFromModel(
    model: Pick<AuditTrails, "tableName" | "recordID">
  ): Promise<AuditLogResponse> {
    return HttpService.callApi(
      API_ENDPOINTS.AUDIT_LOG.GET_BY_TABLE_AND_ID(model.tableName, model.recordID),
      "GET"
    );
  }
}
 
export default AuditLogService;