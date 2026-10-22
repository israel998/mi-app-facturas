/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/mi-app-facturas',
  assetPrefix: '/mi-app-facturas/',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
