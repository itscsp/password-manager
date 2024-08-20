import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/wp-json': {
        target: 'https://goldenrod-herring-662637.hostingersite.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/wp-json/, '/wp-json'),
        headers: {
          'X-Session-Token': 'your-session-token', // Add this if needed
        },
      },
    },
  },
})
