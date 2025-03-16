/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['raw.githubusercontent.com', 'github.com', 'avatars.githubusercontent.com'],
  },
};

module.exports = nextConfig; 