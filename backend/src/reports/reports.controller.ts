import { Controller, Get, Query } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { DashboardQueryDto } from "./dto/dashboard-query.dto";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("dashboard")
  async getDashboardStats(@Query() query: DashboardQueryDto) {
    // tenantId artık context'ten alınıyor
    return this.reportsService.getDashboardStats("", query.range);
  }
}
