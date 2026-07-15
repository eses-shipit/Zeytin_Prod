import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Post, Query } from "@nestjs/common";
import { CreateDeliveryDto, CreateLiquidationDto, CreatePaymentDto } from "./dto/transaction.dto";
import { TransactionsService } from "./transactions.service";

// Tenant kapsamı PrismaService middleware'i tarafından uygulanır; servise
// tenantId geçilmez (eskiden boş string geçiliyordu).
@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post(":customerId/delivery")
  createDelivery(@Param("customerId") customerId: string, @Body() body: CreateDeliveryDto) {
    return this.transactionsService.createDelivery(customerId, body);
  }

  @Post(":customerId/liquidation")
  createLiquidation(@Param("customerId") customerId: string, @Body() body: CreateLiquidationDto) {
    return this.transactionsService.createLiquidation(customerId, body);
  }

  @Post(":customerId/payment")
  createPayment(@Param("customerId") customerId: string, @Body() body: CreatePaymentDto) {
    return this.transactionsService.createPayment(customerId, body);
  }

  @Get(":customerId/history")
  getHistory(
    @Param("customerId") customerId: string,
    @Query("take", new DefaultValuePipe(100), ParseIntPipe) take: number,
    @Query("skip", new DefaultValuePipe(0), ParseIntPipe) skip: number,
  ) {
    return this.transactionsService.getHistory(customerId, take, skip);
  }
}
