import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages 배포를 위한 base 경로 설정
  // 저장소 이름에 맞게 변경하세요 (예: 저장소가 'my-game'이면 '/my-game/')
  base: '/btogame-app/',
  server: {
    port: 3000,
    open: true
  }
})
