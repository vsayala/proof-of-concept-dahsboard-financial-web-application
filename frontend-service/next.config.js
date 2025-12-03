/** @type {import("next").NextConfig} */
const nextConfig = {
  // Remove standalone output for dev mode to fix CSS serving issues
  // output: "standalone", // Commented out for dev mode
  experimental: {
    outputFileTracingRoot: undefined,
  },
  env: {
    CUSTOM_KEY: "audit-poc",
  },
}

module.exports = nextConfig
