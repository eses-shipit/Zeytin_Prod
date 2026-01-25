import { Controller, Get, Query } from "@nestjs/common";
import { ReportsService } from "./reports.service";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("dashboard")
  async getDashboardStats(@Query("range") range?: "today" | "week" | "all") {
    // tenantId artık context'ten alınıyor
    return this.reportsService.getDashboardStats("", range);
  }
}

