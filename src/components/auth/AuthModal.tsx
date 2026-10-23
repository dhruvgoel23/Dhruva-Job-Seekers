import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { createOtpSession, verifyOtpCode, getResendCooldownRemaining, OtpSession } from '../../utils/otp';
import { X, Smartphone, Mail, Shield, CheckCircle, ArrowRight, RotateCw, UserCheck, Building2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login } = useApp();

  const [authStep, setAuthStep] = useState<'input' | 'otp'>('input');
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [identifier, setIdentifier] = useState<string>('+91 98765 43210');
  const [selectedRole, setSelectedRole] = useState<UserRole>('seeker');

  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpSession, setOtpSession] = useState<OtpSession | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const digitInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Timer tick for cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    if (!identifier.trim()) {
      setErrorMessage('Please enter a valid phone number or email.');
      return;
    }

    // Initialize session with known demo OTP '123456' for testing convenience
    const session = createOtpSession(identifier, '123456');
    setOtpSession(session);
    setResendCooldown(45);
    setAuthStep('otp');
    setOtpDigits(['', '', '', '', '', '']);

    setTimeout(() => {
      digitInputsRef.current[0]?.focus();
    }, 100);
  };

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pasted = value.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      digitInputsRef.current[Math.min(5, pasted.length)]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    // Auto-advance
    if (value && index < 5) {
      digitInputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = () => {
    if (!otpSession) return;
    setErrorMessage(null);
    const code = otpDigits.join('');
    if (code.length < 6) {
      setErrorMessage('Please enter all 6 digits of the code.');
      return;
    }

    const result = verifyOtpCode(otpSession, code);
    if (result.success) {
      login(identifier, selectedRole);
    } else {
      setErrorMessage(result.error || 'Verification failed. Please try again.');
    }
  };

  const handleUseDemoOtp = () => {
    setOtpDigits(['1', '2', '3', '4', '5', '6']);
    setErrorMessage(null);
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl text-neutral-100 flex flex-col">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
                <circle cx="12" cy="12" r="2" className="fill-current" />
              </svg>
            </div>
            <span className="font-semibold text-sm text-white">Dhruva Login</span>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {authStep === 'input' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Role Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-400">Select Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('seeker')}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                      selectedRole === 'seeker'
                        ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span className="text-xs font-semibold text-white">Job Seeker</span>
                    <span className="text-[10px] text-neutral-400">Discover & apply</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('company')}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                      selectedRole === 'company'
                        ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span className="text-xs font-semibold text-white">Company</span>
                    <span className="text-[10px] text-neutral-400">Post & hire</span>
                  </button>
                </div>
              </div>

              {/* Method Switcher */}
              <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('phone');
                    setIdentifier('+91 98765 43210');
                  }}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
                    authMethod === 'phone' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Phone OTP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('email');
                    setIdentifier('aarav.sharma@example.com');
                  }}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
                    authMethod === 'email' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email OTP
                </button>
              </div>

              {/* Identifier Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">
                  {authMethod === 'phone' ? 'Mobile Number' : 'Work or Personal Email'}
                </label>
                <input
                  type={authMethod === 'phone' ? 'tel' : 'email'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={authMethod === 'phone' ? '+91 98765 43210' : 'name@company.com'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {errorMessage && (
                <p className="text-xs text-red-400 font-medium">{errorMessage}</p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-1.5"
              >
                Send 6-Digit Verification Code
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-white">Enter Verification Code</h4>
                <p className="text-xs text-neutral-400">
                  Sent to <span className="text-white font-mono">{identifier}</span>
                </p>
              </div>

              {/* 6 Digit Inputs */}
              <div className="flex justify-between gap-1.5">
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      digitInputsRef.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-11 h-12 rounded-xl bg-neutral-950 border border-neutral-800 text-center text-lg font-bold font-mono text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                ))}
              </div>

              {/* Demo Helper */}
              <button
                type="button"
                onClick={handleUseDemoOtp}
                className="w-full py-1.5 px-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-colors"
              >
                Tap to Autofill Demo OTP: 123456
              </button>

              {errorMessage && (
                <p className="text-xs text-red-400 font-medium text-center">{errorMessage}</p>
              )}

              <button
                type="button"
                onClick={handleVerifyOtp}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
              >
                Verify & Enter Dhruva
              </button>

              {/* Resend with Cooldown */}
              <div className="flex items-center justify-between text-xs pt-1 text-neutral-400">
                <button
                  type="button"
                  onClick={() => setAuthStep('input')}
                  className="hover:text-white transition-colors"
                >
                  Change identifier
                </button>

                {resendCooldown > 0 ? (
                  <span className="font-mono text-neutral-500">Resend in {resendCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <RotateCw className="w-3 h-3" /> Resend Code
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
