/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/pitch", destination: "/workspace?tab=pitch", permanent: false },
      { source: "/eligibility", destination: "/workspace?tab=eligibility", permanent: false },
      { source: "/notes", destination: "/workspace?tab=notes", permanent: false },
      { source: "/messaging", destination: "/workspace?tab=messaging", permanent: false },
    ];
  },
};
module.exports = nextConfig;
