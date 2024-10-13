/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mark-ai.oss-cn-hangzhou.aliyuncs.com',
      },
    ]
  }
};

export default nextConfig;
