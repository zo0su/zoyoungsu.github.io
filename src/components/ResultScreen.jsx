import React, { useEffect, useState } from 'react'
import { saveScore, getUserBestScore } from '../utils/firebase'

function ResultScreen({ result, profile, onPlayAgain, onViewRanking }) {
  const [userBest, setUserBest] = useState(null)
  const [isNewRecord, setIsNewRecord] = useState(false)

  useEffect(() => {
    if (result && profile) {
      // 점수 저장
      saveScore(profile.username, profile.avatar, result.score).then(() => {
        // 사용자 최고 기록 확인
        getUserBestScore(profile.username).then((best) => {
          setUserBest(best)
          if (best && result.score >= best.score) {
            setIsNewRecord(true)
          }
        })
      })
    }
  }, [result, profile])

  return (
    <div className="result-screen">
      <h2>게임 종료!</h2>
      {isNewRecord && (
        <div style={{ color: '#f5576c', fontSize: '1.5rem', marginBottom: '10px' }}>
          🎉 신기록 달성! 🎉
        </div>
      )}
      <div className="score-display">{result?.score || 0}점</div>
      <div style={{ marginTop: '20px', color: '#666' }}>
        <p>남은 시간: {Math.floor((result?.timeLeft || 0) / 60)}분 {result?.timeLeft % 60}초</p>
        {userBest && (
          <div style={{ marginTop: '15px', padding: '15px', background: '#f5f5f5', borderRadius: '10px' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>내 최고 기록</p>
            <p style={{ fontSize: '1.2rem', color: '#667eea' }}>{userBest.score}점</p>
            <p style={{ fontSize: '0.9rem', color: '#999', marginTop: '5px' }}>
              플레이 횟수: {userBest.playCount}회
            </p>
          </div>
        )}
      </div>
      <div className="result-buttons">
        <button className="btn btn-primary" onClick={onPlayAgain}>
          다시하기
        </button>
        <button className="btn btn-secondary" onClick={onViewRanking}>
          랭킹 보기
        </button>
      </div>
    </div>
  )
}

export default ResultScreen
