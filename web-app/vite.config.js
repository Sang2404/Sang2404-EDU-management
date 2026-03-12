import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Note: rollup-plugin-visualizer is available but disabled for now
// import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
    // visualizer plugin disabled for now
    // visualizer({
    //   open: false,
    //   gzipSize: true,
    //   brotliSize: true,
    //   filename: 'dist/stats.html',
    // })
  ],
  server: {
    port: 5173,
    hmr: {
      host: 'localhost',
      port: 5173,
      protocol: 'ws'
    }
  },
  build: {
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    
    // Chunk size warnings/errors
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'FILE_NAME_CONFLICT') return;
        warn(warning);
      },
      output: {
        // Content hashing for cache busting
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
        
        // Manual chunks for code splitting
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules/react')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/antd')) {
            return 'vendor-antd';
          }
          if (id.includes('node_modules')) {
            return 'vendor-other';
          }
          
          // Route-based chunks
          if (id.includes('src/pages/admin')) {
            return 'admin-routes';
          }
          if (id.includes('src/pages/lecturer')) {
            return 'lecturer-routes';
          }
          if (id.includes('src/pages/student')) {
            return 'student-routes';
          }
        }
      }
    },
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Source maps for production debugging
    sourcemap: 'hidden-source-map',
    
    // Reporting
    reportCompressedSize: true,
    
    // Tree-shaking
    treeshake: {
      moduleSideEffects: false
    }
  }
})
