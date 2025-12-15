// 게임 아이템 정의
export const ITEMS = [
  { emoji: '🎻', name: '바이올린', score: 10, speed: 1, probability: 15 },
  { emoji: '🎻', name: '비올라', score: 10, speed: 1, probability: 15 },
  { emoji: '🎻', name: '첼로', score: 10, speed: 1, probability: 15 },
  { emoji: '🪈', name: '플룻', score: 10, speed: 1, probability: 12 },
  { emoji: '🎷', name: '클라리넷', score: 10, speed: 1, probability: 12 },
  { emoji: '🥁', name: '팀파니', score: 10, speed: 1, probability: 10 },
  { emoji: '🪄', name: '지휘봉', score: 10, speed: 1, probability: 11 },
  { emoji: '🍙', name: '김밥', score: 20, speed: 1.5, probability: 10 }
]

// 확률 기반 아이템 선택
export function getRandomItem() {
  const random = Math.random() * 100
  let cumulative = 0
  
  for (const item of ITEMS) {
    cumulative += item.probability
    if (random <= cumulative) {
      return { ...item, id: Date.now() + Math.random() }
    }
  }
  
  // 기본값 (혹시 모를 경우)
  return { ...ITEMS[0], id: Date.now() + Math.random() }
}

// 충돌 감지
export function checkCollision(item, basket) {
  const itemRect = {
    left: item.x,
    right: item.x + item.width,
    top: item.y,
    bottom: item.y + item.height
  }
  
  const basketRect = {
    left: basket.x,
    right: basket.x + basket.width,
    top: basket.y,
    bottom: basket.y + basket.height
  }
  
  return (
    itemRect.left < basketRect.right &&
    itemRect.right > basketRect.left &&
    itemRect.top < basketRect.bottom &&
    itemRect.bottom > basketRect.top
  )
}

// 난이도 계산 (30초마다 10% 증가)
export function getDifficultyMultiplier(elapsedTime) {
  const intervals = Math.floor(elapsedTime / 30)
  return 1 + (intervals * 0.1)
}
