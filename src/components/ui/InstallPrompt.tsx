'use client'

import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'
import { subscribeUser } from '@/actions/push.actions'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  // ✅ بدل window.atob
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [dismissed, setDismissed] = useState(false)
  const [pushSubscribed, setPushSubscribed] = useState(false)
  const [notificationsSupported, setNotificationsSupported] = useState(false) // ✅ جديد

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent))
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
    setDismissed(localStorage.getItem('pwa-dismissed') === 'true')
    setNotificationsSupported('Notification' in window) // ✅ هنا فقط

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/', updateViaCache: 'none' })
        .then(async (reg) => {
          const sub = await reg.pushManager.getSubscription()
          setPushSubscribed(!!sub)
        })
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    })
  }, [])

  async function enablePushNotifications() {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    })
    const serialized = JSON.parse(JSON.stringify(sub))
    await subscribeUser(serialized)
    setPushSubscribed(true)
  }

  function dismiss() {
    localStorage.setItem('pwa-dismissed', 'true')
    setDismissed(true)
  }

  if (isStandalone || dismissed) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-void border border-gold/20 rounded-xl p-4 shadow-xl md:max-w-sm md:left-auto md:right-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Download className="text-gold w-5 h-5" />
          <span className="text-ivory font-semibold text-sm">ثبّت لقيتها</span>
        </div>
        <button onClick={dismiss}>
          <X className="text-slate w-4 h-4" />
        </button>
      </div>

      <p className="text-slate text-xs mb-3">
        أضف التطبيق لشاشتك الرئيسية للوصول السريع
      </p>

      {isIOS ? (
        <p className="text-slate text-xs">
          اضغط على <strong className="text-ivory">مشاركة ⎋</strong> ثم{' '}
          <strong className="text-ivory">أضف للشاشة الرئيسية ➕</strong>
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {deferredPrompt && (
            <button
              onClick={() => deferredPrompt.prompt()}
              className="bg-gold text-obsidian text-xs font-semibold py-2 px-4 rounded-lg"
            >
              تثبيت التطبيق
            </button>
          )}
          {/* ✅ بدل 'Notification' in window مباشرة */}
          {!pushSubscribed && notificationsSupported && (
            <button
              onClick={enablePushNotifications}
              className="border border-gold/30 text-gold text-xs py-2 px-4 rounded-lg"
            >
              تفعيل الإشعارات الفورية 🔔
            </button>
          )}
        </div>
      )}
    </div>
  )
}