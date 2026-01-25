import {
  Controller,
  Get,
  Headers,
  BadRequestException,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from "@nestjs/common";
import { CustomersService } from "./customers.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";

@Controller("customers")
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  async findAll() {
    // tenantId artık context'ten alınıyor (TenantMiddleware tarafından)
    return this.customersService.findAll("");
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    // tenantId artık context'ten alınıyor
    return this.customersService.findOne("", id);
  }

  @Get(":id/summary")
  async summary(@Param("id") id: string) {
    return this.customersService.getSummary(id);
  }

  @Post()
  async create(@Body() dto: CreateCustomerDto) {
    // tenantId artık context'ten alınıyor ve Prisma middleware tarafından otomatik ekleniyor
    return this.customersService.create("", dto);
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() dto: CreateCustomerDto) {
    // tenantId artık context'ten alınıyor
    return this.customersService.update("", id, dto);
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    // tenantId artık context'ten alınıyor
    return this.customersService.remove("", id);
  }
}
