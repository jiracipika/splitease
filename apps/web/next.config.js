/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@splitease/core', '@splitease/ui'],
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};
module.exports = nextConfig;
