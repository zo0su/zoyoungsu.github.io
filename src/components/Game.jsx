import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ITEMS, getRandomItem, checkCollision, getDifficultyMultiplier } from '../utils/gameLogic'
import './Game.css'

const GAME_DURATION = 300 // 5분 = 300초
const INITIAL_LIVES = 3
const ITEM_SPAWN_INTERVAL = 1000 // 1초마다 아이템 생성
const BASE_FALL_SPEED = 2

function Game({ profile, onGameEnd }) {
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(INITIAL_LIVES)
  const [items, setItems] = useState([])
  const [basketPosition, setBasketPosition] = useState(50) // 백분율
  const [gameStarted, setGameStarted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [scorePopups, setScorePopups] = useState([]) // 점수 팝업
  
  const gameAreaRef = useRef(null)
  const basketRef = useRef(null)
  const animationFrameRef = useRef(null)
  const lastSpawnTimeRef = useRef(0)
  const touchStartXRef = useRef(0)
  const missedItemsRef = useRef(new Set()) // 놓친 아이템 추적

  // handleGameEnd를 먼저 정의 (useEffect에서 사용하기 전에)
  const handleGameEnd = useCallback(() => {
    setGameStarted(false)
    setIsPaused(true)
    // 모든 애니메이션 프레임 정리
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    onGameEnd({
      score,
      timeLeft,
      lives
    })
  }, [score, timeLeft, lives, onGameEnd])

  // 게임 시작
  useEffect(() => {
    if (gameStarted && !isPaused) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleGameEnd()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [gameStarted, isPaused, handleGameEnd])

  // 아이템 생성
  useEffect(() => {
    if (!gameStarted || isPaused) return

    const spawnItem = (currentTime) => {
      if (currentTime - lastSpawnTimeRef.current >= ITEM_SPAWN_INTERVAL) {
        const newItem = getRandomItem()
        const gameArea = gameAreaRef.current
        if (gameArea) {
          const maxX = gameArea.offsetWidth - 60 // 아이템 너비 고려
          newItem.x = Math.random() * maxX
          newItem.y = -60
          newItem.width = 60
          newItem.height = 60
          setItems((prev) => [...prev, newItem])
        }
        lastSpawnTimeRef.current = currentTime
      }
      animationFrameRef.current = requestAnimationFrame(spawnItem)
    }

    animationFrameRef.current = requestAnimationFrame(spawnItem)
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameStarted, isPaused])

  // 아이템 낙하 및 충돌 감지
  useEffect(() => {
    if (!gameStarted || isPaused) return

    const updateItems = () => {
      setItems((prevItems) => {
        const elapsedTime = GAME_DURATION - timeLeft
        const difficultyMultiplier = getDifficultyMultiplier(elapsedTime)
        const gameArea = gameAreaRef.current
        const basket = basketRef.current

        if (!gameArea || !basket) return prevItems

        // 바구니의 실제 위치 계산
        const basketLeft = (basketPosition / 100) * gameArea.offsetWidth
        const basketRect = {
          x: basketLeft - basket.offsetWidth / 2, // 바구니 중심 기준
          y: gameArea.offsetHeight - basket.offsetHeight - 20,
          width: basket.offsetWidth,
          height: basket.offsetHeight
        }

        return prevItems
          .map((item) => {
            // 낙하 속도 계산
            const fallSpeed = BASE_FALL_SPEED * item.speed * difficultyMultiplier
            const newY = item.y + fallSpeed

            // 충돌 감지
            const itemRect = {
              x: item.x,
              y: newY,
              width: item.width,
              height: item.height
            }

            if (checkCollision(itemRect, basketRect)) {
              // 점수 획득
              const newScore = item.score
              setScore((prev) => prev + newScore)
              
              // 점수 팝업 추가
              setScorePopups((prev) => [
                ...prev,
                {
                  id: Date.now(),
                  x: item.x + item.width / 2,
                  y: item.y,
                  score: newScore
                }
              ])
              
              return null // 아이템 제거
            }

            // 화면 밖으로 나간 경우
            if (newY > gameArea.offsetHeight) {
              // 놓친 아이템이 아직 처리되지 않은 경우에만 목숨 감소
              if (!missedItemsRef.current.has(item.id)) {
                missedItemsRef.current.add(item.id)
                setLives((prev) => {
                  const newLives = prev - 1
                  if (newLives <= 0) {
                    handleGameEnd()
                    return 0
                  }
                  return newLives
                })
              }
              return null // 아이템 제거
            }

            return { ...item, y: newY }
          })
          .filter((item) => item !== null)
      })

      if (gameStarted && !isPaused) {
        animationFrameRef.current = requestAnimationFrame(updateItems)
      }
    }

    if (gameStarted && !isPaused) {
      animationFrameRef.current = requestAnimationFrame(updateItems)
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameStarted, isPaused, timeLeft, basketPosition, handleGameEnd])

  // 키보드 조작
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted || isPaused) return

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setBasketPosition((prev) => Math.max(0, prev - 5))
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setBasketPosition((prev) => Math.min(100, prev + 5))
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameStarted, isPaused])

  // 터치/드래그 조작
  const handleTouchStart = useCallback((e) => {
    if (!gameStarted || isPaused) return
    touchStartXRef.current = e.touches[0].clientX
  }, [gameStarted, isPaused])

  const handleTouchMove = useCallback((e) => {
    if (!gameStarted || isPaused) return
    e.preventDefault()
    const gameArea = gameAreaRef.current
    if (!gameArea) return

    const touchX = e.touches[0].clientX
    const gameAreaRect = gameArea.getBoundingClientRect()
    const relativeX = touchX - gameAreaRect.left
    const percentage = (relativeX / gameAreaRect.width) * 100
    setBasketPosition(Math.max(0, Math.min(100, percentage)))
  }, [gameStarted, isPaused])

  const handleStart = () => {
    setGameStarted(true)
    setIsPaused(false)
    setTimeLeft(GAME_DURATION)
    setScore(0)
    setLives(INITIAL_LIVES)
    setItems([])
    setBasketPosition(50)
    setScorePopups([])
    lastSpawnTimeRef.current = 0
    missedItemsRef.current.clear()
  }
  
  // 점수 팝업 애니메이션
  useEffect(() => {
    if (scorePopups.length === 0) return
    
    const timer = setTimeout(() => {
      setScorePopups((prev) => prev.slice(1))
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [scorePopups])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="game-logo">
          <h2>🎼 부산교사오케스트라 최고단원뽑기</h2>
        </div>
        <div className="game-stats">
          <div className="stat">
            <span>⏱️ 남은시간:</span>
            <span className="stat-value">{formatTime(timeLeft)}</span>
          </div>
          <div className="stat">
            <span>🏆 점수:</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat">
            <span>❤️ 목숨:</span>
            <span className="stat-value">{lives}</span>
          </div>
        </div>
      </div>

      {!gameStarted ? (
        <div className="game-start-screen">
          <div className="profile-display">
            <div className="profile-avatar-large">{profile?.avatar}</div>
            <div className="profile-name">{profile?.username}</div>
          </div>
          <button className="start-game-button" onClick={handleStart}>
            게임 시작
          </button>
        </div>
      ) : (
        <div
          className="game-area"
          ref={gameAreaRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="game-item"
              style={{
                left: `${item.x}px`,
                top: `${item.y}px`,
                transform: `scale(${item.speed === 1.5 ? 1.1 : 1})`
              }}
            >
              <div className="item-emoji">{item.emoji}</div>
              <div className="item-name">{item.name}</div>
            </div>
          ))}
          {scorePopups.map((popup) => (
            <div
              key={popup.id}
              className="score-popup"
              style={{
                left: `${popup.x}px`,
                top: `${popup.y}px`
              }}
            >
              +{popup.score}
            </div>
          ))}
          <div
            className="basket"
            ref={basketRef}
            style={{ left: `${basketPosition}%` }}
          >
            🧺
          </div>
        </div>
      )}
    </div>
  )
}

export default Game
