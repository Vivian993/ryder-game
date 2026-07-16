// Firebase 專案設定（這組 apiKey 是公開用的網頁金鑰，不是密碼，可以放在前端程式碼裡）
const firebaseConfig = {
  apiKey: "AIzaSyDGPR5tYZdfeHWpk76HWeuUkKDV5juTjt4",
  authDomain: "beyblade-x-app-4086b.firebaseapp.com",
  projectId: "beyblade-x-app-4086b",
  storageBucket: "beyblade-x-app-4086b.firebasestorage.app",
  messagingSenderId: "788931393957",
  appId: "1:788931393957:web:90d1409e022df7d6e0904c"
};

// 之後產生 VAPID 金鑰後，把它填在這裡（用來註冊瀏覽器推播）
const FCM_VAPID_KEY = ""; // TODO: 貼上 Firebase Console -> Cloud Messaging -> Web 憑證 的金鑰

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
