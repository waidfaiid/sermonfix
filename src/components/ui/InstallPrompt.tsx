import { useState } from 'react'
import { Share, X } from 'lucide-react'

export function InstallPrompt() {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  const [dismissed, setDismissed] = useState(
    localStorage.getItem('installDismissed') === 'true',
  )

  if (!isIOS || isStandalone || dismissed) return null

  function dismiss() {
    localStorage.setItem('installDismissed', 'true')
    setDismissed(true)
  }

  return (
    <div className="fixed bottom-0 inset-x-0 bg-card border-t border-card-border p-4 z-50 safe-bottom animate-fade-in">
      <div className="flex items-start gap-3 max-w-sm mx-auto">
        <Share size={20} className="text-accent shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-text-primary text-sm font-medium mb-1">Als App installieren</p>
          <ol className="text-text-secondary text-xs space-y-1 list-none">
            <li>1. Tippe auf <strong className="text-text-primary">Teilen</strong> unten im Safari</li>
            <li>2. Wähle <strong className="text-text-primary">Zum Home-Bildschirm</strong></li>
          </ol>
        </div>
        <button
          onClick={dismiss}
          className="text-text-secondary hover:text-text-primary transition-colors p-1"
          aria-label="Schließen"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
