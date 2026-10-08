import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, CircleAlert, X } from 'lucide-react';
interface ToastItem { id: string; message: string; kind: 'success' | 'error'; }
const ToastContext = createContext<(message: string, kind?: ToastItem['kind']) => void>(() => {});
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]); const timers = useRef<number[]>([]);
  const notify = useCallback((message: string, kind: ToastItem['kind'] = 'success') => {
    const id = crypto.randomUUID(); setItems(prev => [...prev.slice(-2), { id, message, kind }]);
    const timer = window.setTimeout(() => { setItems(prev => prev.filter(item => item.id !== id)); timers.current = timers.current.filter(t => t !== timer); }, 5000);
    timers.current.push(timer);
  }, []);
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);
  return <ToastContext.Provider value={notify}>{children}<div className="toast-stack" aria-live="polite">{items.map(item => <div className={`toast ${item.kind}`} key={item.id}>{item.kind === 'success' ? <CheckCircle2 size={19} /> : <CircleAlert size={19} />}<span>{item.message}</span><button aria-label="알림 닫기" onClick={() => setItems(prev => prev.filter(t => t.id !== item.id))}><X size={16} /></button></div>)}</div></ToastContext.Provider>;
}
export const useToast = () => useContext(ToastContext);
