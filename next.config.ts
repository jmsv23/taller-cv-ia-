import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // La base de datos (libsql) se queda fuera del bundle para que funcione igual en Windows, Mac y Linux.
  serverExternalPackages: ["@libsql/client"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
