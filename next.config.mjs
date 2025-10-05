/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // disables optimizer → Image works like <img>
  },
};

export default nextConfig;
