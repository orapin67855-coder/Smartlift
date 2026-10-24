/* ==========================================================
   SMARTLIFT
   FIREBASE CONFIGURATION
========================================================== */


/* ================= FIREBASE IMPORTS ================= */

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";


import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  RecaptchaVerifier,

  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,

  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,

  sendPasswordResetEmail,
  sendEmailVerification,

  updateProfile,
  signOut,
  onAuthStateChanged,

  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


/* ================= FIREBASE PROJECT CONFIG ================= */

/*
  วิธีนำค่ามาใส่

  1. เข้า Firebase Console
  2. เลือกโปรเจกต์ SmartLift
  3. กดรูปเฟือง Project settings
  4. เลื่อนลงมาที่ Your apps
  5. เลือก Web app หรือกดเพิ่ม Web app
  6. คัดลอก firebaseConfig มาแทนค่าด้านล่าง

  หมายเหตุ:
  Firebase Web API Key ไม่ใช่รหัสผ่านลับ
  แต่ต้องตั้งค่า Authentication, Firestore Rules
  และ Authorized domains ให้ถูกต้อง
*/

const firebaseConfig = {
  apiKey: "AIzaSyDEiI_E_GpgW8QjISrqDW8XtY9vlJbdo-o",
  authDomain: "smartlife-2656f.firebaseapp.com",
  projectId: "smartlife-2656f",
  storageBucket: "smartlife-2656f.firebasestorage.app",
  messagingSenderId: "654910267592",
  appId: "1:654910267592:web:ad3843ff366b8df5a1c5fd",
  measurementId: "G-79S9E8WVE1"
};

/* ================= BLUETOOTH CONFIG ================= */

/*
  เปลี่ยนค่า UUID ให้ตรงกับโค้ด ESP32 ของคุณ

  ตัวอย่าง ESP32:

  Service UUID:
  12345678-1234-1234-1234-1234567890ab

  Characteristic UUID:
  abcdefab-1234-1234-1234-abcdefabcdef

  รูปแบบข้อมูลที่ app.js รองรับ:

  JSON:
  {"type":"rep","correct":true,"battery":92}

  หรือข้อความ:
  REP,1
  REP,0

  REP,1 = ยกถูก
  REP,0 = ยกผิด
*/

const bluetoothConfig = {
  namePrefix: "SmartLift",

  serviceUUID:
    "12345678-1234-1234-1234-1234567890ab",

  characteristicUUID:
    "abcdefab-1234-1234-1234-abcdefabcdef"
};


/* ================= CONFIG VALIDATION ================= */

function hasPlaceholder(value) {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return true;
  }

  const normalized =
    value.toLowerCase();

  return (
    normalized.includes("ใส่_") ||
    normalized.includes("your_") ||
    normalized.includes("your-") ||
    normalized.includes("project_id") ||
    normalized.includes("api_key")
  );
}


function validateFirebaseConfig(config) {
  const requiredFields = [
    "apiKey",
    "authDomain",
    "projectId",
    "messagingSenderId",
    "appId"
  ];

  return requiredFields.every(
    (field) =>
      !hasPlaceholder(
        config[field]
      )
  );
}


/* ================= INITIALIZE FIREBASE ================= */

let firebaseReady = false;
let firebaseInitError = null;

let firebaseApp = null;
let auth = null;
let db = null;

let providers = {
  google: null,
  facebook: null,
  apple: null
};


try {
  if (
    !validateFirebaseConfig(
      firebaseConfig
    )
  ) {
    throw new Error(
      "Firebase config ยังไม่ได้ตั้งค่า กรุณาใส่ค่าจาก Firebase Console"
    );
  }


  firebaseApp =
    initializeApp(
      firebaseConfig
    );


  auth =
    getAuth(
      firebaseApp
    );


  db =
    getFirestore(
      firebaseApp
    );


  const googleProvider =
    new GoogleAuthProvider();

  googleProvider.setCustomParameters({
    prompt: "select_account"
  });


  const facebookProvider =
    new FacebookAuthProvider();

  facebookProvider.addScope(
    "email"
  );


  const appleProvider =
    new OAuthProvider(
      "apple.com"
    );

  appleProvider.addScope(
    "email"
  );

  appleProvider.addScope(
    "name"
  );


  providers = {
    google:
      googleProvider,

    facebook:
      facebookProvider,

    apple:
      appleProvider
  };


  firebaseReady = true;

} catch (error) {
  firebaseReady = false;

  firebaseInitError =
    error;

  console.warn(
    "SmartLift Firebase:",
    error.message
  );
}


/* ================= AUTH API EXPORT ================= */

const authApi = {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,

  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,

  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,

  sendPasswordResetEmail,
  sendEmailVerification,

  updateProfile,
  signOut,
  onAuthStateChanged,

  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
};


/* ================= FIRESTORE API EXPORT ================= */

const dbApi = {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
};


/* ================= EXPORTS ================= */

export {
  firebaseReady,
  firebaseInitError,

  firebaseApp,
  auth,
  db,

  providers,
  authApi,
  dbApi,

  bluetoothConfig
};