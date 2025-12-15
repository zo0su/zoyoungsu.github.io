import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, where, getDoc, doc, setDoc, updateDoc, increment } from 'firebase/firestore'

// Firebase 설정
// 실제 Firebase 설정을 사용하려면:
// 1. Firebase 콘솔(https://console.firebase.google.com)에서 프로젝트 선택
// 2. 프로젝트 설정 > 일반 탭에서 웹 앱 추가
// 3. firebaseConfig 객체의 값들을 복사하여 아래에 붙여넣기
// 4. Firestore 데이터베이스 생성 (테스트 모드로 시작 가능)
// 5. Firestore 인덱스 생성: users 컬렉션에 bestScore 필드에 대한 인덱스 필요

const firebaseConfig = {
    apiKey: "AIzaSyA_uaPzLGpSWLYBsh7WoM41srYVZq0_ao4",
    authDomain: "btogame-zo0su.firebaseapp.com",
    projectId: "btogame-zo0su",
    storageBucket: "btogame-zo0su.firebasestorage.app",
    messagingSenderId: "677275281428",
    appId: "1:677275281428:web:757b639124cc3f974a1f01",
    measurementId: "G-TW2DYNNGKW"
}

// Firebase가 설정되지 않은 경우를 위한 플래그
export const isFirebaseConfigured = firebaseConfig.apiKey !== "AIzaSyDummyKeyReplaceWithReal"

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
      rankings.push({
        id: doc.id,
        username: data.username,
        avatar: data.avatar,
        score: data.bestScore || 0,
        playCount: data.playCount || 0
      })
    })

    return rankings
  } catch (error) {
    console.error('랭킹 조회 실패:', error)
    // bestScore 필드가 없을 수 있으므로 fallback
    return []
  }
}

