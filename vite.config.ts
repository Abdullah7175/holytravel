import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin to exclude .git files from being processed
const excludeGitPlugin = () => {
  return {
    name: 'exclude-git',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Block any requests to .git paths
        if (req.url?.includes('.git') || req.url?.includes('/.git/')) {
          res.statusCode = 404;
          res.end('Not Found');
          return;
        }
        next();
      });
    },
    resolveId(id) {
      // Exclude .git files from module resolution
      if (id.includes('.git') || id.includes('/.git/')) {
        return { id: '\0virtual:git-excluded', external: true };
      }
      return null;
    },
    load(id) {
      // Prevent loading .git files
      if (id.includes('.git') || id.includes('/.git/')) {
        return '';
      }
      return null;
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), excludeGitPlugin()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Prevent Vite from reading files outside the project
  server: {
    fs: {
      strict: true,
      // Deny access to .git directory and all its contents
      deny: [
        '.git',
        '**/.git/**',
        '.git/**',
        '**/.git',
        '**/.git/**/*',
      ],
      // Only allow access to files within the project root
      allow: ['..'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:7000',
        changeOrigin: true,
      },
    },
    allowedHosts: ['booking.holytravelsandtour.com', 'www.booking.holytravelsandtour.com', 'localhost', '0.0.0.0'],
    hmr: {
      overlay: false, // Disable error overlay to prevent blocking
    },
    // Handle malformed URIs gracefully
    middlewareMode: false,
  },
  // Exclude .git from build
  build: {
    rollupOptions: {
      external: (id) => {
        // Exclude .git files from processing
        if (id.includes('.git') || id.includes('/.git/')) {
          return true;
        }
        return false;
      },
    },
  },
  // Exclude .git from being watched
  publicDir: 'public',
  resolve: {
    alias: {},
  },
});
