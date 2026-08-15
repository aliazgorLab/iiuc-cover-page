/**
 * Google Auth Singleton Guard
 * Prevents multiple calls to google.accounts.id.initialize()
 * avoiding GSI Logger warnings in React StrictMode and SPA page navigations.
 */

let isInitialized = false;

export const setupGoogleSingletonGuard = () => {
  if (typeof window === 'undefined') return;

  const patchGoogleObject = (googleObj) => {
    if (googleObj?.accounts?.id && !googleObj.accounts.id._guarded) {
      const originalInit = googleObj.accounts.id.initialize.bind(googleObj.accounts.id);
      
      googleObj.accounts.id.initialize = (config) => {
        if (isInitialized) {
          // Singleton guard: ignore duplicate calls to initialize()
          return;
        }
        isInitialized = true;
        return originalInit(config);
      };

      googleObj.accounts.id._guarded = true;
    }
  };

  if (window.google) {
    patchGoogleObject(window.google);
  } else {
    let internalGoogle = window.google;
    Object.defineProperty(window, 'google', {
      configurable: true,
      enumerable: true,
      get() {
        return internalGoogle;
      },
      set(val) {
        internalGoogle = val;
        patchGoogleObject(val);
      },
    });
  }
};
