import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this project at /cinescope/, so assets must be requested from
// there rather than the domain root. Overridable for other hosts: BASE_PATH=/ npm run build
const base = process.env.BASE_PATH ?? '/cinescope/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
})
