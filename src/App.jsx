import React, { useState } from 'react'
import StartScreen from './components/StartScreen'
import ProfileRegistration from './components/ProfileRegistration'
import Game from './components/Game'
import ResultScreen from './components/ResultScreen'
import RankingBoard from './components/RankingBoard'
import './styles/App.css'

function App() {
  const [screen, setScreen] = useState('start') // start, profile, game, result, ranking
  const [profile, setProfile] = useState(null)
  const [gameResult, setGameResult] = useState(null)

  const handleStart = () => {
    console.log('handleStart 호출됨, 화면을 profile로 변경')
    setScreen('profile')
  }

  const handleProfileSubmit = (profileData) => {
    setProfile(profileData)
    setScreen('game')
  }

  const handleGameEnd = (result) => {
    setGameResult(result)
    setScreen('result')
  }

  const handlePlayAgain = () => {
    setScreen('game')
  }

  const handleViewRanking = () => {
    setScreen('ranking')
  }

  const handleBackToStart = () => {
    setScreen('start')
    setProfile(null)
    setGameResult(null)
  }

  return (
    <div className="app">
      {screen === 'start' && <StartScreen onStart={handleStart} />}
      {screen === 'profile' && (
        <ProfileRegistration 
          onSubmit={handleProfileSubmit}
          onBack={handleBackToStart}
        />
      )}
      {screen === 'game' && (
        <Game 
          profile={profile}
          onGameEnd={handleGameEnd}
        />
      )}
      {screen === 'result' && (
        <ResultScreen 
          result={gameResult}
          profile={profile}
          onPlayAgain={handlePlayAgain}
          onViewRanking={handleViewRanking}
        />
      )}
      {screen === 'ranking' && (
        <RankingBoard 
          onBack={handleBackToStart}
        />
      )}
    </div>
  )
}

export default App

