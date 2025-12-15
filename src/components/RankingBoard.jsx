import React, { useEffect, useState } from 'react'
import { getTopRankings } from '../utils/firebase'

function RankingBoard({ onBack }) {
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRankings()
  }, [])

  const loadRankings = async () => {
    setLoading(true)
    try {
      const topRankings = await getTopRankings(10)
      setRankings(topRankings)
    } catch (error) {
      console.error('랭킹 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ranking-board">
      <h2>🏆 랭킹 보드</h2>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          로딩 중...
        </div>
      ) : rankings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          아직 기록이 없습니다.
        </div>
      ) : (
        <ul className="ranking-list">
          {rankings.map((ranking, index) => (
            <li key={ranking.id} className="ranking-item">
              <div className="ranking-number">#{index + 1}</div>
              <div className="ranking-avatar">{ranking.avatar}</div>
              <div className="ranking-info">
                <div className="ranking-name">{ranking.username}</div>
                <div className="ranking-score">
                  최고 점수: <span className="ranking-score-value">{ranking.score}점</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div style={{ marginTop: '20px' }}>
        <button className="btn btn-secondary" onClick={onBack} style={{ width: '100%' }}>
          메인으로
        </button>
      </div>
    </div>
  )
}

export default RankingBoard
