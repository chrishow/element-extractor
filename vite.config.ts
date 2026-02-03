import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    base: './', // Use relative paths for GitHub Pages
    plugins: [
        // ... other plugins if you have any
    ],
    resolve: { // Ensure Vite can resolve '.ts' correctly if issues arise
        extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
    },
    server: {
        port: 5173,
        cors: true,
        // host: '0.0.0.0', // Optional
    },
    build: {
        rollupOptions: {
            input: {
                main: './index.html',
            },
            output: {
                entryFileNames: 'assets/[name].js',
                chunkFileNames: 'assets/[name].js',
                assetFileNames: 'assets/[name].[ext]'
            }
        }
    }
});