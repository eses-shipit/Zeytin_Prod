import createNextIntlPlugin from "next-intl/plugin";

// next-intl'e istek-başına dil/mesaj çözümleyicisinin yerini bildirir.
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker için yalın çıktı: .next/standalone içinde kendi kendine yeten bir
  // sunucu (node server.js) üretir; imaj küçük olur, sunucuyu yormaz.
  output: "standalone",
  eslint: {
    // Build ESLint HATALARINDA durur (warning'ler build'i bozmaz). Gizli hata
    // borcu temizlendi; bayrak açık kalırsa gerçek hatalar yine gizlenir.
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Tip hataları build'i durdurur. tsc temiz; bu bayrak açıkken kayıt
    // formundaki gibi hatalar sessizce derleniyordu.
    ignoreBuildErrors: false,
  },
  // PWA configuration temporarily disabled for debugging
  // Security Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default withNextIntl(nextConfig);
