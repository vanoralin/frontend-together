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
    ]
  },
}

module.exports = nextConfig