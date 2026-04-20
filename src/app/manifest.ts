import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Lqitha - لقيتها',
    short_name: 'Lqitha',
    description: 'Secure Digital Lost & Found Platform',
    start_url: '/',
    display: 'standalone',
    background_color: '#080810', //Obsidian background color
    theme_color: '#C4A35A', //Gold accent color
    categories: ['utilities', 'social'],
    lang: 'ar',
    dir: 'rtl',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcuts: [
        {
            name: "تصفح",
            url: "/browse",
            icons: [{src:"/android-chrome-192x192.png", sizes:"192x192"}],
        },
        {
        name: 'أضف غرض',
        url: '/items/new',
        icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192' }],
      },
    ],
  }
}