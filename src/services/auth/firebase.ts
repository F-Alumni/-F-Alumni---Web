import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  type Auth,
} from 'firebase/auth'
import { env } from '@/app/config/env'

export interface FirebaseGoogleUser {
  idToken: string
  email: string
  fullName: string
  avatarUrl: string
}

let firebaseApp: FirebaseApp | null = null
let firebaseAuth: Auth | null = null

/**
 * Checks whether a real Firebase Web API Key is configured in environment variables.
 */
export function isFirebaseConfigured(): boolean {
  const key = env.firebase.apiKey?.trim() || ''
  return key.length > 10 && key.startsWith('AIza')
}

/**
 * Lazily initializes Firebase App & Auth instance for Project `alumniconnect-295ed`.
 */
export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured()) {
    return null
  }

  try {
    if (!firebaseApp) {
      const existing = getApps()
      firebaseApp =
        existing.length > 0
          ? existing[0]!
          : initializeApp({
              apiKey: env.firebase.apiKey,
              authDomain: env.firebase.authDomain,
              projectId: env.firebase.projectId,
              storageBucket: env.firebase.storageBucket,
              messagingSenderId: env.firebase.messagingSenderId,
              appId: env.firebase.appId,
              measurementId: env.firebase.measurementId,
            })
    }

    if (!firebaseAuth) {
      firebaseAuth = getAuth(firebaseApp)
    }

    return firebaseAuth
  } catch (err) {
    console.warn('Firebase Auth initialization warning:', err)
    return null
  }
}

/**
 * US-02: Triggers Firebase Google Sign-In Popup and returns the verified Google ID Token & profile.
 */
export async function signInWithFirebaseGoogle(): Promise<FirebaseGoogleUser> {
  const auth = getFirebaseAuth()
  if (!auth) {
    throw new Error('FIREBASE_NOT_CONFIGURED')
  }

  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({
    prompt: 'select_account',
  })

  const credential = await signInWithPopup(auth, provider)
  const user = credential.user
  const idToken = await user.getIdToken()

  return {
    idToken,
    email: user.email || '',
    fullName: user.displayName || user.email?.split('@')[0] || 'FPT Google User',
    avatarUrl: user.photoURL || '',
  }
}

/**
 * Signs out from Firebase session if initialized.
 */
export async function signOutFirebase(): Promise<void> {
  try {
    const auth = getFirebaseAuth()
    if (auth) {
      await firebaseSignOut(auth)
    }
  } catch {
    // Ignore
  }
}
