import { IsEnum, IsOptional } from "class-validator";

/** Dashboard'un desteklediği tarih aralıkları. */
export enum ReportRange {
  TODAY = "today",
  WEEK = "week",
  ALL = "all",
}

/**
 * `range` daha önce doğrulanmıyordu: tipi yalnızca derleme zamanında vardı,
 * çalışma anında herhangi bir metin geçebiliyordu. "month" gibi bir değer
 * servisteki üçlü koşuldan sessizce düşüp "bugün" aralığı gibi işleniyor,
 * yani istemci hatalı sayıyı hata almadan görüyordu. Artık geçersiz değer 400 döner.
 */
export class DashboardQueryDto {
  @IsOptional()
  @IsEnum(ReportRange, {
    message: "range yalnızca 'today', 'week' veya 'all' olabilir.",
  })
  range: ReportRange = ReportRange.ALL;
}
