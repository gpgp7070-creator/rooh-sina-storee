/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 👈 هذا هو السطر المطلوب لـ Capacitor
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig