import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Increases the warning limit so it doesn't complain about file sizes
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // Forces all external libraries into a single "vendor" file
        // This prevents the "Traffic Jam" when analyzing thousands of small files
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});