import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ZeytinSaaS Fabrika Yönetim',
    short_name: 'ZeytinSaaS',
    description: 'Zeytinyağı Fabrikası Yönetim Platformu',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc', // slate-50
    theme_color: '#4f46e5', // indigo-600
    orientation: 'landscape',
    icons: [
      {
        src: '/logo-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}

