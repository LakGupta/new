import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a phone on the same Wi-Fi load dev JS from this Mac's LAN address.
  // Dev only; production ignores it.
  allowedDevOrigins: ["192.168.0.102", "192.168.*.*"],
};

export default nextConfig;
