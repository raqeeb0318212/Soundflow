import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          search: path.resolve(__dirname, 'search.html'),
          trending: path.resolve(__dirname, 'trending.html'),
          artist: path.resolve(__dirname, 'artist.html'),
          album: path.resolve(__dirname, 'album.html'),
          genres: path.resolve(__dirname, 'genres.html'),
          playlist: path.resolve(__dirname, 'playlist.html'),
          favorites: path.resolve(__dirname, 'favorites.html'),
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
