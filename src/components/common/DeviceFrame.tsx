import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Smartphone, Monitor, ShieldCheck, Sun, Moon, BellRing, X } from 'lucide-react';

interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  const {
    viewportMode,
    setViewportMode,
    currentRole,
    switchRole,
    user,
    activePushToast,
    dismissPushToast,
    jobs,
    setSelectedJob,
    setActiveTab,
    theme,
    toggleTheme,
  } = useApp();
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  // Auto-dismiss push toast after 7 seconds
  useEffect(() => {
    if (activePushToast) {
      const timer = setTimeout(() => {
        dismissPushToast();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [activePushToast, dismissPushToast]);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans antialiased selection:bg-blue-500/20 transition-colors duration-200">
      {/* Top Universal Operating Bar (Apple macOS / Studio Style) */}
      <header className="h-14 border-b border-neutral-200 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between shrink-0 z-50 transition-colors">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold tracking-tight shadow-md shadow-blue-500/20">
              <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
                <circle cx="12" cy="12" r="2" className="fill-current" />
              </svg>
            </div>
            <div>
              <span className="font-semibold text-base tracking-tight text-neutral-900 dark:text-white flex items-center gap-1.5">
                Dhruva
                <span className="text-[11px] font-normal text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                  OS v2.6
                </span>
              </span>
            </div>
          </div>
          <span className="hidden md:inline text-neutral-300 dark:text-neutral-600 text-xs">·</span>
          <span className="hidden md:inline text-neutral-500 dark:text-neutral-400 text-xs">
            Unified Job Discovery & Identity Verified ATS
          </span>
        </div>

        {/* Center Viewport Switcher */}
        <div className="flex items-center bg-neutral-200/80 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 p-1 rounded-xl shadow-inner transition-colors">
          <button
            onClick={() => setViewportMode('mobile_ios')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewportMode === 'mobile_ios'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
            title="Preview iPhone 16 Pro native frame"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">iPhone 16 Pro</span>
            <span className="sm:hidden">iOS</span>
          </button>

          <button
            onClick={() => setViewportMode('mobile_android')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewportMode === 'mobile_android'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
            title="Preview Google Pixel 9 frame"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pixel 9</span>
            <span className="sm:hidden">Pixel</span>
          </button>

          <button
            onClick={() => {
              setViewportMode('desktop_company');
              switchRole('company');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewportMode === 'desktop_company'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
            title="Preview Desktop ATS workspace"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop ATS</span>
            <span className="sm:hidden">Desktop</span>
          </button>
        </div>

        {/* Right Persona, Theme Toggle & Verification Status */}
        <div className="flex items-center gap-2.5">
          {/* Quick Universal Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-neutral-200/80 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            title={`Toggle ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-600" />
            )}
          </button>

          <div className="hidden lg:flex items-center gap-2 text-xs">
            {user.isIdentityVerified ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Biometrics Verified
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                Liveness Pending
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 bg-neutral-200/80 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => {
                switchRole('seeker');
                if (viewportMode === 'desktop_company') setViewportMode('mobile_ios');
              }}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                currentRole === 'seeker'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              Job Seeker
            </button>
            <button
              onClick={() => {
                switchRole('company');
                setViewportMode('desktop_company');
              }}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                currentRole === 'company'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              Employer
            </button>
          </div>
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="flex-1 flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden relative">
        {viewportMode === 'desktop_company' ? (
          // Full-screen Desktop Workspace
          <div className="w-full h-full max-w-7xl mx-auto rounded-none sm:rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden flex flex-col relative transition-colors">
            {/* Desktop Push Toast Banner if active */}
            {activePushToast && (
              <div className="absolute top-4 right-6 z-50 animate-bounce-subtle max-w-sm">
                <div
                  onClick={() => {
                    if (activePushToast.jobId) {
                      const matched = jobs.find((j) => j.id === activePushToast.jobId);
                      if (matched) setSelectedJob(matched);
                    }
                    dismissPushToast();
                  }}
                  className="p-3.5 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border border-blue-500/40 rounded-2xl shadow-2xl cursor-pointer hover:border-blue-400 transition-all select-none space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-md bg-blue-600 flex items-center justify-center text-white">
                        <BellRing className="w-2.5 h-2.5" />
                      </div>
                      <span className="font-semibold text-neutral-900 dark:text-white tracking-tight uppercase text-[10px]">
                        DHRUVA · REAL-TIME JOB RADAR
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-neutral-400 font-mono">now</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissPushToast();
                        }}
                        className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1">{activePushToast.title}</div>
                    <div className="text-[11px] text-neutral-700 dark:text-neutral-300 font-medium">{activePushToast.subtitle}</div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-0.5">{activePushToast.message}</div>
                  </div>
                </div>
              </div>
            )}
            {children}
          </div>
        ) : (
          // Mobile Hardware Mockup Frame
          <div className="relative flex flex-col items-center justify-center h-full max-h-[920px] py-2">
            <div
              className={`relative bg-neutral-50 dark:bg-neutral-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col transition-all duration-300 ${
                viewportMode === 'mobile_ios'
                  ? 'w-[390px] h-[844px] rounded-[52px] border-[10px] border-[#d6d8dd] dark:border-[#222428] ring-1 ring-black/10 dark:ring-white/10'
                  : 'w-[400px] h-[860px] rounded-[42px] border-[10px] border-[#d1d4d8] dark:border-[#1d1f21] ring-1 ring-black/10 dark:ring-white/10'
              }`}
            >
              {/* iPhone Dynamic Island / Pixel Punch Hole */}
              {viewportMode === 'mobile_ios' ? (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-50 flex items-center justify-between px-3 pointer-events-none">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0d0d11]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#181b2e] ring-1 ring-blue-500/40" />
                </div>
              ) : (
                <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-50 ring-1 ring-neutral-700 pointer-events-none" />
              )}

              {/* Mobile Top Status Bar */}
              <div className="h-11 px-7 pt-2 flex items-center justify-between text-neutral-800 dark:text-neutral-200 text-xs font-semibold shrink-0 select-none z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md transition-colors">
                <span className="tracking-tight text-[13px]">{currentTime}</span>
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-600 dark:text-neutral-300">
                  {/* Signal bars */}
                  <svg className="w-4 h-3.5 fill-current" viewBox="0 0 16 12">
                    <rect x="0" y="8" width="2" height="4" rx="0.5" />
                    <rect x="4" y="6" width="2" height="6" rx="0.5" />
                    <rect x="8" y="3" width="2" height="9" rx="0.5" />
                    <rect x="12" y="0" width="2" height="12" rx="0.5" />
                  </svg>
                  {/* Wifi */}
                  <svg className="w-4 h-3.5 fill-current" viewBox="0 0 16 12">
                    <path d="M8 9.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM2.8 5.6a7.4 7.4 0 0110.4 0 .9.9 0 001.3-1.3 9.2 9.2 0 00-13 0 .9.9 0 001.3 1.3zM5.3 7.8a3.9 3.9 0 015.4 0 .9.9 0 001.3-1.3 5.7 5.7 0 00-8 0 .9.9 0 001.3 1.3z" />
                  </svg>
                  {/* Battery */}
                  <div className="w-5 h-2.5 rounded-sm border border-neutral-600 dark:border-neutral-300 p-0.5 flex items-center">
                    <div className="h-full w-3.5 bg-neutral-800 dark:bg-neutral-200 rounded-[1px]" />
                  </div>
                </div>
              </div>

              {/* Native Screen Interior with safe scroll */}
              <div className="flex-1 overflow-hidden flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 relative transition-colors duration-200">
                {/* Apple Native Push Banner Notification */}
                {activePushToast && (
                  <div className="absolute top-2 left-3 right-3 z-50 pointer-events-auto transition-transform duration-300 ease-out">
                    <div
                      onClick={() => {
                        if (activePushToast.jobId) {
                          const matched = jobs.find((j) => j.id === activePushToast.jobId);
                          if (matched) {
                            setSelectedJob(matched);
                            setActiveTab('home');
                          }
                        }
                        dismissPushToast();
                      }}
                      className="p-3 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl border border-neutral-200 dark:border-neutral-700/80 rounded-2xl shadow-2xl cursor-pointer hover:border-blue-500/50 transition-all select-none space-y-1.5 ring-1 ring-black/5 dark:ring-black/40"
                    >
                      <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-sm">
                            <BellRing className="w-2.5 h-2.5" />
                          </div>
                          <span className="font-bold text-neutral-900 dark:text-white tracking-tight uppercase text-[9.5px]">
                            DHRUVA · JOB RADAR
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-neutral-400 font-mono">now</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissPushToast();
                            }}
                            className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1">{activePushToast.title}</div>
                        <div className="text-[11px] text-neutral-700 dark:text-neutral-300 font-medium">{activePushToast.subtitle}</div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-0.5">{activePushToast.message}</div>
                      </div>

                      <div className="pt-1 flex items-center justify-between text-[10px]">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">Tap to inspect & one-tap apply →</span>
                        <span className="text-neutral-400">Dismiss</span>
                      </div>
                    </div>
                  </div>
                )}

                {children}
              </div>

              {/* Apple Home Indicator Bar */}
              <div className="h-6 flex items-center justify-center shrink-0 bg-neutral-50 dark:bg-neutral-950 select-none z-40 transition-colors">
                <div className="w-32 h-1 bg-neutral-400 dark:bg-neutral-600 rounded-full" />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
