/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    NEXT_PUBLIC_ONLINE_COURSE_API_URL:
      process.env.NEXT_PUBLIC_ONLINE_COURSE_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },
}

export default nextConfig
