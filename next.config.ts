/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',

        destination: 'http://129.150.62.182:8888/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://129.150.62.182:8888/uploads/:path*',
      },
      // ✅ เพิ่มบรรทัดนี้: proxy เส้นทาง auth ไป backend
      {
        source: '/auth/:path*',
        destination: 'http://129.150.62.182:8888/auth/:path*',

      },
      {
        source: '/uploads/:path*', 
        destination: 'http://129.150.62.182:8888/uploads/:path*', 
      },
    ]
  },
}


module.exports = nextConfig

