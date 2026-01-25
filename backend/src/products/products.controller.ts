import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto, UpdateProductDto } from "./dto/create-product.dto";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    // tenantId artık context'ten alınıyor
    return this.productsService.create("", dto);
  }

  @Get()
  findAll() {
    // tenantId artık context'ten alınıyor
    return this.productsService.findAll("");
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() dto: UpdateProductDto) {
    // tenantId artık context'ten alınıyor
    return this.productsService.update("", id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    // tenantId artık context'ten alınıyor
    return this.productsService.remove("", id);
  }
}

