/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: { unoptimized: true },
  // These packages need to run on the server (not bundled by webpack)
  serverExternalPackages: ['bcryptjs', '@prisma/client', 'prisma'],
};

export default nextConfig;
