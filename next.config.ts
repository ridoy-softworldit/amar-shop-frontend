// next.config.js - DEVELOPMENT MODE (Allows all domains)
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/c/:slug",
        destination: "/products?category=:slug",
        permanent: false,
      },
      {
        source: "/category/:slug",
        destination: "/products?category=:slug",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allow ALL HTTPS domains
      },
      {
        protocol: "http",
        hostname: "**", // Allow ALL HTTP domains
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
      // Add other reliable image hosts
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
        pathname: "/**",
      },
    ],
    dangerouslyAllowSVG: true,
  },
};

module.exports = nextConfig;
