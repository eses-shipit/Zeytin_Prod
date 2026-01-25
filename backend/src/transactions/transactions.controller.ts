import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from "@nestjs/common";
import { CreateDeliveryDto, CreateLiquidationDto, CreatePaymentDto } from "./dto/transaction.dto";
import { TransactionsService } from "./transactions.service";

@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post(":customerId/delivery")
  async createDelivery(
    @Param("customerId") customerId: string,
    @Body() body: CreateDeliveryDto,
  ) {
    // tenantId artık context'ten alınıyor
    return this.transactionsService.createDelivery("", customerId, body);
  }

  @Post(":customerId/liquidation")
  async createLiquidation(
    @Param("customerId") customerId: string,
    @Body() body: CreateLiquidationDto,
  ) {
    // tenantId artık context'ten alınıyor
    return this.transactionsService.createLiquidation("", customerId, body);
  }

  @Post(":customerId/payment")
  async createPayment(
    @Param("customerId") customerId: string,
    @Body() body: CreatePaymentDto,
  ) {
    // tenantId artık context'ten alınıyor
    return this.transactionsService.createPayment("", customerId, body);
  }

  @Get(":customerId/history")
  async getHistory(@Param("customerId") customerId: string) {
    // tenantId artık context'ten alınıyor
    return this.transactionsService.getHistory("", customerId);
  }
}
