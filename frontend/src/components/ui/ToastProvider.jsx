import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toastStore } from './toastStore';
import { CheckCircle2, AlertOctagon, AlertTriangle, Info, Loader2, X } from 'lucide-react';
import { toast as reactToastifyToast } from 'react-toastify';

/**
 * Patch react-toastify's global toast instance to route calls
 * to our custom Framer-Motion Vercel/Linear style toast provider.
 */
if (typeof window !== 'undefined' && reactToastifyToast) {
  const patchType = (type, storeType) => {
    const orig = reactToastifyToast[type];
    reactToastifyToast[type] = (msg, options) => {
      toastStore.addToast(storeType, msg, null, options);
      if (typeof orig === 'function') {
        try { orig(msg, options); } catch (e) {}
      }
    };
  };

  patchType('success', 'success');
  patchType('error', 'error');
  patchType('info', 'info');
  patchType('warn', 'warning');
  patchType('warning', 'warning');
  patchType('loading', 'loading');
}

export const ToastProvider = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = toastStore.subscribe((newToasts) => {
      setToasts(newToasts);
    });
    return unsubscribe;
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return (
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      case 'error':
        return (
          <div className="w-7 h-7 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
            <AlertOctagon className="w-4 h-4" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 flex-shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      case 'loading':
        return (
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-7 h-7 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-300 flex-shrink-0">
            <Info className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence mode="sync">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -20, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="pointer-events-auto relative overflow-hidden bg-slate-900/90 backdrop-blur-xl text-white border border-slate-800/90 rounded-2xl p-4 shadow-2xl shadow-slate-950/50 flex items-start gap-3.5 group"
          >
            {/* Minimal Status Icon */}
            {getIcon(t.type)}

            {/* Content */}
            <div className="flex-1 min-w-0 pr-4">
              <h4 className="text-xs font-bold text-slate-100 leading-snug tracking-tight">
                {t.title}
              </h4>
              {t.description && (
                <p className="text-[11px] font-medium text-slate-400 mt-0.5 leading-relaxed">
                  {t.description}
                </p>
              )}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => toastStore.dismiss(t.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Sleek Progress Bar Indicator */}
            {t.duration > 0 && (
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: t.duration / 1000, ease: 'linear' }}
                style={{ originX: 0 }}
                className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                  t.type === 'success' ? 'bg-emerald-500' :
                  t.type === 'error' ? 'bg-rose-500' :
                  t.type === 'warning' ? 'bg-amber-400' :
                  'bg-sky-400'
                }`}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastProvider;
