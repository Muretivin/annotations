import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: {
    // Ignore ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Optional: Ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Client-side configuration
    if (!isServer) {
      // PDF.js worker alias
      config.resolve.alias = {
        ...config.resolve.alias,
        'pdfjs-dist/build/pdf.worker.min.js': path.join(
          __dirname,
          'node_modules/pdfjs-dist/build/pdf.worker.min.js'
        ),
      };

      // Prevent canvas module from being bundled on client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false
      };
    }

    // Server-side configuration
    if (isServer) {
      // Prevent canvas-related warnings during SSR
      config.externals.push({
        canvas: 'commonjs canvas',
      });
    }

    return config;
  },
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    },
    optimizePackageImports: ['react-pdf']
  }
};

export default nextConfig;