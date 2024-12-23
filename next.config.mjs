/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mark-ai.oss-cn-hangzhou.aliyuncs.com',
      },
      {
        protocol: 'https',
        hostname:'filesystem.site',
      },
      {
        protocol: 'https',
        hostname:'oaidalleapiprodscus.blob.core.windows.net',
      }
    ]
  }
};

export default nextConfig;
