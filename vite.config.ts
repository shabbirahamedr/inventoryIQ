import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';

// Resolve Windows junction/symlinks (OneDrive Documents) so esbuild output paths match CWD
if (fs.existsSync(process.cwd())) {
  const realCwd = fs.realpathSync(process.cwd());
  if (realCwd !== process.cwd()) {
    process.chdir(realCwd);
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    fs: {
      strict: false
    }
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom'],
          // Charting library
          'vendor-recharts': ['recharts'],
          // PDF generation
          'vendor-pdf': ['jspdf', 'jspdf-autotable'],
          // Excel / CSV parsing
          'vendor-data': ['xlsx', 'papaparse'],
          // Icons
          'vendor-icons': ['lucide-react'],
        }
      }
    }
  }
});
