import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {serverActions: {bodySizeLimit: '6mb'}},
  async redirects() {
    return [{
      source: '/api/:path*',
      has: [{type: 'host', value: 'cos-closet-production.up.railway.app'}],
      destination: 'https://closet.cozcos.com/api/:path*',
      permanent: true,
    }, {
      source: '/:path*',
      has: [{type: 'host', value: 'cos-closet-production.up.railway.app'}],
      destination: 'https://closet.cozcos.com/:path*',
      statusCode: 301,
    }];
  },
};

export default nextConfig;
