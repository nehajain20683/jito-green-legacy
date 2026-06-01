/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
    // Local images served from /public don't need remotePatterns
    formats: ['image/avif', 'image/webp'],
  },
  // Reduce Vercel serverless bundle size
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  // Silence non-critical ESLint warnings during build
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
