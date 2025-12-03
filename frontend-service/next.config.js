/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    outputFileTracingRoot: undefined,
  },
  env: {
    CUSTOM_KEY: "audit-poc",
  },
}

module.exports = nextConfig
