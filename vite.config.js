import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset paths, so the built site works both on a web host and
  // when index.html is opened directly from the Finder (file://).
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    // Emit one real .css file and link it from the HTML. Stylesheets load
    // fine over file://, and this avoids the unstyled flash you get when CSS
    // is injected by JavaScript at runtime.
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        // A single classic script rather than ES modules: browsers refuse to
        // load module scripts over file://, which would stop the site opening
        // by double-click. See scripts/make-openable.js.
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  preview: {
    port: 4173,
    open: true,
  },
});
