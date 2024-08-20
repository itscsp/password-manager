import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/wp-json/password-manager/v1": {
        target: "https://goldenrod-herring-662637.hostingersite.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/wp-json\/password-manager\/v1/, "/wp-json/password-manager/v1"),
        secure: true, // Ensure this is true if the target server uses HTTPS
        // Configure headers if needed
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('X-Session-Token', 'your-session-token-here'); // Replace with actual session token if needed
          });
        },
      },
    },
  },
});
