/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['raw.githubusercontent.com', 'github.com', 'avatars.githubusercontent.com'],
  },
  // Disable optimizations that might be causing API routes bundling issues
  experimental: {
    // Remove the problematic wildcard that causes regex error
    serverComponentsExternalPackages: [
      'fs', 
      'path', 
      'child_process', 
      'util',
      'stream',
      'fs/promises'
    ],
    // Use older bundling strategy that has better compatibility
    useDeploymentId: false,
    // Skip full URL minification 
    urlImports: false
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false, path: false };
    if (isServer) {
      // For server code which includes API routes, 
      // disable aggressive optimizations and merging
      config.optimization.concatenateModules = false;
    }
    return config;
  },
};

module.exports = nextConfig; 