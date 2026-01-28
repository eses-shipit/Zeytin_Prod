import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(tenantId: string, range: "today" | "week" | "all" = "all") {
    // 1. KPI'lar
    const now = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    if (range === "week") {
      const day = start.getDay() || 7; // Pazar=0 -> 7
      start.setDate(start.getDate() - (day - 1));
    }

    const dateFilter = range === "all" ? undefined : { gte: start, lte: now };

    // Günlük Gelen Zeytin
    const dailyOlive = await this.prisma.weighingTicket.aggregate({
      where: { createdAt: dateFilter },
      _sum: { netKg: true },
    });

    // Günlük Sıkılan Yağ
    const dailyOil = await this.prisma.productionBatch.aggregate({
      where: { createdAt: dateFilter },
      _sum: { totalOilKg: true },
    });

    // Bekleyen Fiş Sayısı
    const pendingTickets = await this.prisma.weighingTicket.count({
      where: { status: "PENDING" },
    });

    // Genel Ortalama Randıman
    const avgYield = await this.prisma.productionBatch.aggregate({
      _avg: { yieldRatio: true },
    });

    // --- YENİ KPI'lar ---
    
    // Toplam Alacak (TL) - Tüm Müşterilerin BalanceTL toplamı
    const totalReceivable = await this.prisma.customer.aggregate({
        where: { balanceTL: { gt: 0 } }, // Sadece borcu olanları topla (Alacak)
        _sum: { balanceTL: true }
    });

    // Fabrika Hakkı (Yağ Stoğu/Alacağı) - Üretimlerden gelen toplam fabrika payı
    const totalFactoryShareOil = await this.prisma.productionBatch.aggregate({
        _sum: { factoryShareKg: true }
    });

    // Bekleyen Bidon Sayısı (Mock/Logic)
    const pendingContainerTickets = await this.prisma.weighingTicket.count({
        where: { 
            status: "PENDING",
            containerNos: { not: null }
        }
    });


    // 2. Grafikler

    // Grafik 1: Köylere Göre Randıman (Yield by Origin)
    const batches = await this.prisma.productionBatch.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: {
        tickets: {
          include: { product: true } // Product bilgisini de çek
        },
      },
    });

    const yieldByOriginMap = new Map<string, { totalYield: number; count: number }>();
    // YENİ: Ürün Bazlı Kazanç
    const revenueByProductMap = new Map<string, number>();

    batches.forEach((batch) => {
      // Yield by Origin Logic
      const origin = batch.tickets[0]?.origin || "Belirsiz";
      const currentOrigin = yieldByOriginMap.get(origin) || { totalYield: 0, count: 0 };
      yieldByOriginMap.set(origin, {
        totalYield: currentOrigin.totalYield + batch.yieldRatio,
        count: currentOrigin.count + 1,
      });

      // Ürün Bazlı Fabrika Payı (kg olarak)
      const productName = batch.tickets[0]?.product?.name || batch.tickets[0]?.variety || "Diğer";
      const factoryShareKg = batch.factoryShareKg;

      const currentShare = revenueByProductMap.get(productName) || 0;
      revenueByProductMap.set(productName, currentShare + factoryShareKg);
    });

    const yieldByOrigin = Array.from(yieldByOriginMap.entries()).map(([origin, data]) => ({
      name: origin,
      yield: parseFloat((data.totalYield / data.count).toFixed(2)),
    }));

    const revenueByProduct = Array.from(revenueByProductMap.entries()).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2))
    })).sort((a, b) => b.value - a.value); // En çok kazandıran en üstte

    // Grafik 2: Kalite Dağılımı (Quality Distribution)
    const qualityGroups = await this.prisma.weighingTicket.groupBy({
      by: ["quality"],
      _sum: { netKg: true },
    });

    const qualityDistribution = qualityGroups.map((g) => ({
      name: g.quality || "Belirsiz",
      value: g._sum.netKg || 0,
    }));

    // Grafik 3: Müşterilerin Köy Dağılımı
    const customersByVillageGroups = await this.prisma.customer.groupBy({
      by: ["village"],
      _count: { _all: true },
    });

    const customersByVillage = customersByVillageGroups.map((g) => ({
      name: g.village || "Belirsiz",
      value: g._count._all,
    }));

    return {
      kpis: {
        dailyOliveKg: dailyOlive._sum.netKg || 0,
        dailyOilKg: dailyOil._sum.totalOilKg || 0,
        pendingTicketsCount: pendingTickets,
        avgYield: avgYield._avg.yieldRatio || 0,
        // New Financial KPIs
        totalReceivable: totalReceivable._sum.balanceTL || 0,
        totalFactoryShareOil: totalFactoryShareOil._sum.factoryShareKg || 0,
        pendingContainerTickets: pendingContainerTickets,
      },
      charts: {
        yieldByOrigin,
        qualityDistribution,
        revenueByProduct, // New Chart Data
        customersByVillage,
      },
    };
  }
}
