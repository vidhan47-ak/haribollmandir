/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Keep builds green even without an ESLint config installed.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
