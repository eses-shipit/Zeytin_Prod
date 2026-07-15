import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Dil-farkında navigasyon API'si.
 *
 * MİGRASYON KURALI: yeni/taşınan dosyalarda `next/link` ve `next/navigation`
 * YERİNE buradan import et. Aksi halde İspanyolca bir kullanıcı bir linke
 * tıkladığında sessizce Türkçe'ye (prefix'siz varsayılan dile) düşer.
 *
 *   - import Link from "next/link"              ->  import { Link } from "@/i18n/navigation"
 *   - import { useRouter } from "next/navigation" -> import { useRouter } from "@/i18n/navigation"
 *
 * `usePathname` buradan alındığında dil prefix'i OLMADAN döner ("/dashboard"),
 * bu da aktif-link karşılaştırmalarını dilden bağımsız kılar.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
