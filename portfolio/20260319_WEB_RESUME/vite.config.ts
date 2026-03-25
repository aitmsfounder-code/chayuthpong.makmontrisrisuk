import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  // Local/IIS: './' | GitHub Pages: env var '/<repo-name>/'
  base: process.env.VITE_BASE_URL || './',
  plugins: [
    react(),
    {
      name: 'copy-web-config',
      closeBundle() {
        try {
          copyFileSync(
            resolve(__dirname, 'web.config'),
            resolve(__dirname, 'dist', 'web.config'),
          );
        } catch {
          // web.config may not exist yet, skip
        }
      },
    },
  ],
  build: {
    rollupOptions: {
      output: {
        // IIFE format → ไม่ใช้ ES modules → เปิดจาก file:// ได้
        format: 'iife',
        // รวมทุกอย่างใน JS ไฟล์เดียว
        manualChunks: undefined,
      },
    },
    // Inline CSS into JS (ไม่ต้องโหลดไฟล์แยก)
    cssCodeSplit: false,
  },
  server: {
    port: 3000,
  },
});
