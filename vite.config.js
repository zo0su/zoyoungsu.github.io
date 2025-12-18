import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages 배포를 위한 base 경로 설정
  // 저장소 이름에 맞게 변경하세요
  // URL이 https://zo0su.github.io/zoyoungsu.github.io/ 라면 base는 '/zoyoungsu.github.io/'
  base: '/zoyoungsu.github.io/',
  server: {
    port: 3000,
    open: true,
    host: true // 모바일 접속을 위해 네트워크 주소 노출
  }
})

