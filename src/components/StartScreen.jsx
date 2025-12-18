import React from 'react'

function StartScreen({ onStart }) {
  const handleClick = () => {
    console.log('게임 시작 버튼 클릭됨')
    if (onStart) {
      onStart()
    } else {
      console.error('onStart 함수가 전달되지 않았습니다')
    }
  }

  return (
    <div className="start-screen">
      <h1>🎼 부산교사오케스트라</h1>
      <h1>최고단원뽑기</h1>
      <p>악기들을 잡아서 점수를 획득하세요!</p>
      <button className="start-button" onClick={handleClick}>
        게임 시작
      </button>
    </div>
  )
}

export default StartScreen

