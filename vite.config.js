import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages 배포를 위한 base 경로 설정
  // 저장소 이름에 맞게 변경하세요
  // URL이 https://zo0su.github.io/zoyoungsu.github.io/ 라면 base는 '/zoyoungsu.github.io/'
  base: '/zoyoungsu.github.io/',
  build: {
    // 빌드 시 파일명에 해시를 추가하여 캐시 버스팅 (기본값이지만 명시적으로 설정)
    rollupOptions: {
      output: {
        // 파일명에 해시 추가로 캐시 무효화
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    host: true // 모바일 접속을 위해 네트워크 주소 노출
  }
})

