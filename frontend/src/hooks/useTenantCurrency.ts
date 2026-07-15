"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/format";

/**
 * Aktif tenant'ın para birimini döndürür.
 *
 * Kaynak: backend `GET /policy` -> TenantPolicy.currency (prisma default "TRY").
 * Login cevabındaki `user` nesnesi para birimini İÇERMİYOR, bu yüzden
 * localStorage'dan okunamıyor; ayrı bir istek gerekiyor.
 *
 * Modül seviyesinde cache'liyoruz: para birimi oturum boyunca değişmez,
 * her tablo satırı için istek atmanın anlamı yok.
 *
 * Hata durumunda (SUPER_ADMIN'in tenant'ı yok -> 401/404) sessizce TRY'ye
 * düşer; para birimi yüzünden sayfa patlamamalı.
 */

let cached: CurrencyCode | null = null;
let inflight: Promise<CurrencyCode> | null = null;

function isCurrencyCode(value: unknown): value is CurrencyCode {
  return value === "TRY" || value === "EUR";
}

async function fetchCurrency(): Promise<CurrencyCode> {
  try {
    const res = await api.get("/policy");
    const value = res.data?.currency;
    return isCurrencyCode(value) ? value : DEFAULT_CURRENCY;
  } catch {
    return DEFAULT_CURRENCY;
  }
}

export function useTenantCurrency(): CurrencyCode {
  const [currency, setCurrency] = useState<CurrencyCode>(
    cached ?? DEFAULT_CURRENCY
  );

  useEffect(() => {
    if (cached) return;

    let active = true;
    if (!inflight) inflight = fetchCurrency();

    inflight.then((value) => {
      cached = value;
      inflight = null;
      if (active) setCurrency(value);
    });

    return () => {
      active = false;
    };
  }, []);

  return currency;
}

/** Test/impersonate sonrası cache'i temizlemek için. */
export function resetTenantCurrencyCache(): void {
  cached = null;
  inflight = null;
}
