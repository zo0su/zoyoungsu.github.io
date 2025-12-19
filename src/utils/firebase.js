import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, where, getDoc, doc, setDoc, updateDoc, increment } from 'firebase/firestore'

// Firebase 설정
// 환경 변수를 사용하여 API 키를 안전하게 관리합니다
// .env 파일에 실제 Firebase 설정 값을 입력하세요
// 자세한 설정 방법은 ENV_SETUP_GUIDE.md를 참조하세요

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Firebase가 설정되지 않은 경우를 위한 플래그
export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "your_api_key_here" &&
  firebaseConfig.apiKey !== "AIzaSyDummyKeyReplaceWithReal"
)

// Firebase 초기화
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// 점수 저장
export async function saveScore(username, avatar, score) {
  if (!isFirebaseConfigured) {
    console.warn('Firebase가 설정되지 않았습니다. 점수는 저장되지 않습니다.')
    return
  }
  
  try {
    const userRef = doc(db, 'users', username)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      const userData = userDoc.data()
      // 최고 점수 업데이트
      if (score > userData.bestScore) {
        await updateDoc(userRef, {
          bestScore: score,
          playCount: increment(1),
          lastPlayed: new Date().toISOString()
        })
      } else {
        await updateDoc(userRef, {
          playCount: increment(1),
          lastPlayed: new Date().toISOString()
        })
      }
    } else {
      // 새 사용자 생성
      await setDoc(userRef, {
        username,
        avatar,
        bestScore: score,
        playCount: 1,
        lastPlayed: new Date().toISOString()
      })
    }

    // 랭킹 기록 추가
    await addDoc(collection(db, 'rankings'), {
      username,
      avatar,
      score,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('점수 저장 실패:', error)
    throw error
  }
}

// 사용자 최고 기록 가져오기
export async function getUserBestScore(username) {
  if (!isFirebaseConfigured) {
    return null
  }
  
  try {
    const userRef = doc(db, 'users', username)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      const data = userDoc.data()
      return {
        score: data.bestScore || 0,
        playCount: data.playCount || 0
      }
    }
    return null
  } catch (error) {
    console.error('사용자 기록 조회 실패:', error)
    return null
  }
}

// TOP 랭킹 가져오기
export async function getTopRankings(limitCount = 10) {
  if (!isFirebaseConfigured) {
    return []
  }
  
  try {
    // users 컬렉션에서 bestScore 기준으로 정렬
    const usersRef = collection(db, 'users')
    const q = query(usersRef, orderBy('bestScore', 'desc'), limit(limitCount))
    const querySnapshot = await getDocs(q)

    const rankings = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      // bestScore가 0보다 큰 사용자만 포함
      if (data.bestScore > 0) {
        rankings.push({
          id: doc.id,
          username: data.username,
          avatar: data.avatar,
          score: data.bestScore || 0,
          playCount: data.playCount || 0
        })
      }
    })

    return rankings
  } catch (error) {
    console.error('랭킹 조회 실패 (bestScore 정렬 실패, fallback 시도):', error)
    
    // bestScore 필드가 없거나 인덱스가 없는 경우 fallback: 모든 사용자 가져와서 정렬
    try {
      const usersRef = collection(db, 'users')
      const querySnapshot = await getDocs(usersRef)
      
      const rankings = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        // bestScore가 0보다 큰 사용자만 포함
        if (data.bestScore !== undefined && data.bestScore > 0) {
          rankings.push({
            id: doc.id,
            username: data.username,
            avatar: data.avatar,
            score: data.bestScore || 0,
            playCount: data.playCount || 0
          })
        }
      })
      
      // 점수 기준으로 정렬 (내림차순)
      rankings.sort((a, b) => b.score - a.score)
      
      // 상위 limitCount개만 반환
      return rankings.slice(0, limitCount)
    } catch (fallbackError) {
      console.error('랭킹 조회 fallback 실패:', fallbackError)
      return []
    }
  }
}

