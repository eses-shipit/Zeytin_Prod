import { Controller, Get, Post, Body, Put, Param, Delete } from "@nestjs/common";
import { CustomersService } from "./customers.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";

// Kimlik doğrulaması global JwtAuthGuard tarafından, tenant kapsamı
// PrismaService middleware'i tarafından uygulanır.
@Controller("customers")
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.customersService.findOne(id);
  }

  @Get(":id/summary")
  summary(@Param("id") id: string) {
    return this.customersService.getSummary(id);
  }

  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() dto: CreateCustomerDto) {
    return this.customersService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.customersService.remove(id);
  }
}
