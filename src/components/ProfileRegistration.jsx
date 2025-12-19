import React, { useState } from 'react'

const AVATAR_OPTIONS = [
  '🎻', '🎺', '🎷', '🥁',
  '🎹', '🎸', '🎵', '🎼',
  '👨‍🎤', '👩‍🎤', '🎪', '🎭'
]

function ProfileRegistration({ onSubmit, onBack }) {
  const [username, setUsername] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (username.trim()) {
      onSubmit({
        username: username.trim(),
        avatar: selectedAvatar
      })
    }
  }

  return (
    <div className="profile-registration">
      <h2>프로필 등록</h2>
      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>아이디</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="아이디를 입력하세요"
            required
            maxLength={20}
          />
        </div>
        <div className="form-group">
          <label>프로필 아바타</label>
          <div className="profile-avatar-options">
            {AVATAR_OPTIONS.map((avatar, index) => (
              <div
                key={index}
                className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
                onClick={() => setSelectedAvatar(avatar)}
              >
                {avatar}
              </div>
            ))}
          </div>
        </div>
        <div className="form-buttons">
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            뒤로
          </button>
          <button type="submit" className="btn btn-primary">
            시작하기
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProfileRegistration

