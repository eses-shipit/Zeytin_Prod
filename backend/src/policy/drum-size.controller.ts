import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { DrumSizeService } from "./drum-size.service";
import { CreateDrumSizeDto, UpdateDrumSizeDto } from "./dto/drum-size.dto";
import { Roles } from "../common/decorators/roles.decorator";

@Controller("drum-sizes")
export class DrumSizeController {
  constructor(private readonly drumSizeService: DrumSizeService) {}

  /** Operatör bidon eklerken bu listeden seçer. */
  @Get()
  findAll(@Query("includeInactive") includeInactive?: string) {
    return this.drumSizeService.findAll(includeInactive === "true");
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post()
  create(@Body() dto: CreateDrumSizeDto) {
    return this.drumSizeService.create(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateDrumSizeDto) {
    return this.drumSizeService.update(id, dto);
  }

  /** Silmez, pasife alır: geçmiş bidonlar tipine bağlı kalır. */
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete(":id")
  deactivate(@Param("id") id: string) {
    return this.drumSizeService.deactivate(id);
  }
}
