import React, { useState, useEffect } from 'react';
import { useCitizen } from '../context/CitizenContext';
import { KonarkWheelIcon, IkatPatternDivider } from '../components/OdishaMotifs';
import {
  Shield, Phone, Mail, Lock, User, MapPin, Globe, CheckCircle2,
  AlertCircle, ArrowRight, RefreshCw, KeyRound, Check, Eye, EyeOff,
  Sparkles, FileText, ArrowLeft, Loader2
} from 'lucide-react';

interface CitizenAuthViewProps {
  initialTab?: 'register' | 'login';
  onAuthenticated?: () => void;
}

export const CitizenAuthView: React.FC<CitizenAuthViewProps> = ({
  initialTab = 'register',
  onAuthenticated
}) => {
  const {
    loginCitizen,
    registerCitizen,
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
  } = useCitizen();

  const [activeTab, setActiveTab] = useState<'register' | 'login'>(initialTab);
  const [step, setStep] = useState<'form' | 'otp' | 'forgot' | 'reset'>('form');

  // Form State
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('Bhubaneswar');
  const [postalCode, setPostalCode] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'or'>('en');
  const [consent, setConsent] = useState(false);

  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [otpValue, setOtpValue] = useState('');
  const [activeMobile, setActiveMobile] = useState('');
  const [devOtpNotification, setDevOtpNotification] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Recovery State
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // UI status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const switchTab = (tab: 'register' | 'login') => {
    setActiveTab(tab);
    setStep('form');
    setErrorMessage(null);
    setSuccessMessage(null);
    setFieldErrors({});
  };

  // Frontend Validations for Registration
  const validateRegistration = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = 'Full Name is required (minimum 2 characters).';
    }

    const cleanMobile = mobile.replace(/\D/g, '');
    if (!cleanMobile) {
      errors.mobile = 'Mobile number is required.';
    } else if (cleanMobile.length < 10 || cleanMobile.length > 12) {
      errors.mobile = 'Enter a valid 10-digit Indian mobile number.';
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Enter a valid email address.';
      }
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!consent) {
      errors.consent = 'You must accept the terms of service and privacy policy.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validateRegistration()) return;

    setLoading(true);
    const res = await registerCitizen({
      full_name: fullName.trim(),
      mobile: mobile.trim(),
      email: email.trim() ? email.trim() : undefined,
      password,
      confirm_password: confirmPassword,
      address_line: addressLine.trim() || undefined,
      locality: locality.trim() || undefined,
      city: city.trim() || 'Bhubaneswar',
      postal_code: postalCode.trim() || undefined,
      preferred_language: preferredLanguage,
      consent,
    });
    setLoading(false);

    if (!res.success) {
      if (res.code === 'MOBILE_EXISTS') {
        setErrorMessage('This mobile number is already associated with an account. Please sign in or recover your account.');
      } else if (res.code === 'EMAIL_EXISTS') {
        setErrorMessage('This email address is already associated with an account. Please sign in or recover your account.');
      } else {
        setErrorMessage(res.error || 'Registration failed. Please check your inputs.');
      }
      return;
    }

    // Success -> proceed to OTP verification
    setActiveMobile(res.mobile || mobile.trim());
    if (res.dev_otp) {
      setDevOtpNotification(res.dev_otp);
    }
    setStep('otp');
    setResendCooldown(60);
    setSuccessMessage('Registration initiated! An OTP has been sent to your mobile number. Please verify to activate your account.');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginIdentifier.trim()) {
      setErrorMessage('Mobile number or email address is required.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Password is required.');
      return;
    }

    setLoading(true);
    const res = await loginCitizen(loginIdentifier, loginPassword);
    setLoading(false);

    if (!res.success) {
      if (res.pendingMobile) {
        setActiveMobile(res.pendingMobile);
        setStep('otp');
        setErrorMessage(res.error || 'Account pending mobile verification. Please enter the OTP sent.');
        return;
      }
      setErrorMessage(res.error || 'Unable to sign in with those credentials. Check your details or recover your account.');
      return;
    }

    // Logged in successfully
    setSuccessMessage('Welcome back! Loading your dashboard...');
    if (onAuthenticated) {
      setTimeout(() => onAuthenticated(), 500);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!otpValue.trim()) {
      setErrorMessage('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    const res = await verifyOTP(activeMobile, otpValue.trim(), 'MOBILE_VERIFY');
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Invalid OTP. Please check and try again.');
      return;
    }

    setSuccessMessage('Registration successful! Your CIVIC NEXUS AI account has been created. Redirecting to your dashboard...');
    if (onAuthenticated) {
      setTimeout(() => onAuthenticated(), 600);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0 || !activeMobile) return;
    setLoading(true);
    const res = await resendOTP(activeMobile, 'MOBILE_VERIFY');
    setLoading(false);
    if (res.success) {
      if (res.dev_otp) setDevOtpNotification(res.dev_otp);
      setResendCooldown(60);
      setSuccessMessage('New OTP sent to your registered mobile number.');
    } else {
      setErrorMessage(res.error || 'Failed to resend OTP.');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!recoveryIdentifier.trim()) {
      setErrorMessage('Please enter your registered mobile number or email address.');
      return;
    }

    setLoading(true);
    const res = await forgotPassword(recoveryIdentifier.trim());
    setLoading(false);

    if (res.success && res.mobile) {
      setActiveMobile(res.mobile);
      if (res.dev_otp) setDevOtpNotification(res.dev_otp);
      setStep('reset');
      setResendCooldown(60);
      setSuccessMessage('Verification OTP sent! Enter OTP and choose a new password.');
    } else {
      setErrorMessage(res.error || 'If an account exists, an OTP has been sent.');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!otpValue.trim()) {
      setErrorMessage('Please enter the OTP.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await resetPassword(activeMobile, otpValue.trim(), newPassword, confirmNewPassword);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Password reset failed.');
      return;
    }

    setSuccessMessage('Password reset successful! Please sign in with your new password.');
    setStep('form');
    setActiveTab('login');
    setLoginPassword('');
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-heritage-ivory dark:bg-heritage-charcoal-dark py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white dark:bg-heritage-charcoal rounded-3xl border border-heritage-stone dark:border-heritage-charcoal-dark shadow-heritage-lg overflow-hidden transition-all duration-200">
        
        {/* Odisha Heritage Top Header */}
        <div className="bg-gradient-to-r from-heritage-maroon to-heritage-maroon-dark text-white p-6 sm:p-8 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: 'repeating-linear-gradient(45deg, #C49A45 0px, #C49A45 1px, transparent 1px, transparent 14px)' }}
          />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-heritage-gold/30 shadow-md">
                <KonarkWheelIcon size={32} className="text-heritage-gold animate-spin-slow" />
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-widest text-heritage-gold uppercase">
                  Odisha Smart City Platform
                </span>
                <h1 className="font-serif font-extrabold text-2xl sm:text-3xl tracking-tight text-white mt-0.5">
                  Welcome to CIVIC NEXUS AI
                </h1>
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs sm:text-sm text-heritage-stone/90 max-w-xl font-sans leading-relaxed relative z-10">
            Join your community and help make our city safer, smarter, and more responsive.
          </p>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="px-6 sm:px-8 pt-6 pb-2 border-b border-heritage-stone dark:border-heritage-charcoal-dark">
          <div className="flex p-1 rounded-2xl bg-heritage-stone/30 dark:bg-heritage-charcoal-dark max-w-md mx-auto">
            <button
              onClick={() => switchTab('register')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center space-x-1.5 ${
                activeTab === 'register' && step === 'form'
                  ? 'bg-heritage-maroon text-white shadow-sm'
                  : 'text-heritage-aged hover:text-heritage-charcoal dark:hover:text-heritage-ivory'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
            <button
              onClick={() => switchTab('login')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center space-x-1.5 ${
                activeTab === 'login' || step !== 'form'
                  ? 'bg-heritage-maroon text-white shadow-sm'
                  : 'text-heritage-aged hover:text-heritage-charcoal dark:hover:text-heritage-ivory'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center space-x-4 text-xs font-medium text-heritage-aged">
            {activeTab === 'register' && step === 'form' && (
              <span className="text-heritage-maroon dark:text-heritage-gold font-bold">
                Create Citizen Account
              </span>
            )}
            {activeTab === 'login' && step === 'form' && (
              <span className="text-heritage-maroon dark:text-heritage-gold font-bold">
                Citizen Portal Sign In
              </span>
            )}
          </div>
        </div>

        {/* Feedback alerts */}
        <div className="px-6 sm:px-8 pt-4">
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs flex items-start space-x-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-heritage-red" />
              <div className="flex-1 leading-relaxed">
                <span>{errorMessage}</span>
                {errorMessage.includes('already associated with an account') && (
                  <div className="mt-2.5 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => switchTab('login')}
                      className="px-3 py-1.5 rounded-lg bg-heritage-maroon text-white text-[11px] font-semibold hover:bg-heritage-maroon-dark transition-colors"
                    >
                      Go to Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('forgot');
                        setRecoveryIdentifier(mobile || email);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-heritage-maroon text-heritage-maroon dark:text-heritage-gold text-[11px] font-semibold hover:bg-heritage-maroon/5 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-xs flex items-center space-x-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-heritage-green" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Dev OTP Helper Banner */}
          {devOtpNotification && (
            <div className="mb-4 p-3 rounded-2xl bg-heritage-gold/15 border border-heritage-gold/40 text-heritage-charcoal dark:text-heritage-ivory text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-heritage-gold shrink-0" />
                <span>
                  <strong>Development Verification Code:</strong> Use OTP <span className="font-mono font-bold bg-white dark:bg-heritage-charcoal-dark px-2 py-0.5 rounded text-heritage-maroon dark:text-heritage-gold">{devOtpNotification}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOtpValue(devOtpNotification)}
                className="text-[11px] font-bold text-heritage-maroon dark:text-heritage-gold underline ml-2"
              >
                Auto-fill
              </button>
            </div>
          )}
        </div>

        {/* ── STEP: OTP VERIFICATION ────────────────────────────────────────── */}
        {step === 'otp' && (
          <div className="p-6 sm:p-8 space-y-5 animate-fade-in">
            <div className="text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-heritage-gold/20 text-heritage-maroon dark:text-heritage-gold flex items-center justify-center mx-auto mb-3">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-heritage-charcoal dark:text-heritage-ivory">
                Verify Mobile Number
              </h3>
              <p className="text-xs text-heritage-aged mt-1">
                Enter the 6-digit OTP sent to <strong className="text-heritage-charcoal dark:text-heritage-ivory">{activeMobile}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-4 max-w-sm mx-auto">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={otpValue}
                  onChange={e => setOtpValue(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 rounded-2xl border-2 border-heritage-stone dark:border-heritage-charcoal-dark bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:border-heritage-gold focus:outline-none"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || otpValue.length < 6}
                className="w-full py-3 rounded-xl bg-heritage-maroon hover:bg-heritage-maroon-dark text-white font-semibold text-sm shadow-heritage transition-all duration-150 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Verify & Activate Account</span>
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="text-heritage-aged hover:text-heritage-charcoal dark:hover:text-heritage-ivory"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  disabled={resendCooldown > 0 || loading}
                  onClick={handleResendOTP}
                  className="text-heritage-maroon dark:text-heritage-gold font-bold disabled:opacity-50"
                >
                  {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── STEP: FORGOT PASSWORD ─────────────────────────────────────────── */}
        {step === 'forgot' && (
          <div className="p-6 sm:p-8 space-y-5 animate-fade-in max-w-md mx-auto">
            <div>
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-xs text-heritage-aged hover:text-heritage-charcoal flex items-center space-x-1 mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
              <h3 className="font-serif font-bold text-lg text-heritage-charcoal dark:text-heritage-ivory">
                Account Recovery
              </h3>
              <p className="text-xs text-heritage-aged mt-1">
                Enter your registered Indian mobile number or email address to receive a secure recovery code.
              </p>
            </div>

            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                  Registered Mobile or Email
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-aged" />
                  <input
                    type="text"
                    value={recoveryIdentifier}
                    onChange={e => setRecoveryIdentifier(e.target.value)}
                    placeholder="+91 9437012345 or citizen@example.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-heritage-maroon hover:bg-heritage-maroon-dark text-white font-semibold text-sm shadow-heritage transition-all duration-150 flex items-center justify-center space-x-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Send Recovery Code</span>
              </button>
            </form>
          </div>
        )}

        {/* ── STEP: RESET PASSWORD ─────────────────────────────────────────── */}
        {step === 'reset' && (
          <div className="p-6 sm:p-8 space-y-5 animate-fade-in max-w-md mx-auto">
            <div>
              <h3 className="font-serif font-bold text-lg text-heritage-charcoal dark:text-heritage-ivory">
                Set New Password
              </h3>
              <p className="text-xs text-heritage-aged mt-1">
                Enter the OTP sent to <strong>{activeMobile}</strong> and choose a secure new password.
              </p>
            </div>

            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                  6-Digit OTP *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpValue}
                  onChange={e => setOtpValue(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory font-mono text-center tracking-widest text-base focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                  New Password (min. 8 characters) *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-heritage-maroon hover:bg-heritage-maroon-dark text-white font-semibold text-sm shadow-heritage transition-all duration-150 flex items-center justify-center space-x-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Update Password</span>
              </button>
            </form>
          </div>
        )}

        {/* ── STEP: REGISTRATION TAB ────────────────────────────────────────── */}
        {step === 'form' && activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 sm:p-8 space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-aged" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g., Biswaranjan Rout"
                    className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border ${
                      fieldErrors.fullName ? 'border-red-400 bg-red-50/20' : 'border-heritage-stone dark:border-heritage-charcoal-dark'
                    } bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none`}
                  />
                </div>
                {fieldErrors.fullName && <p className="text-[11px] text-red-500 mt-1">{fieldErrors.fullName}</p>}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                  Mobile Number (India) *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-aged" />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    placeholder="+91 94370 12345"
                    className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border ${
                      fieldErrors.mobile ? 'border-red-400 bg-red-50/20' : 'border-heritage-stone dark:border-heritage-charcoal-dark'
                    } bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none`}
                  />
                </div>
                {fieldErrors.mobile && <p className="text-[11px] text-red-500 mt-1">{fieldErrors.mobile}</p>}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                  Email Address <span className="text-heritage-aged font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-aged" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="citizen@domain.com"
                    className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border ${
                      fieldErrors.email ? 'border-red-400 bg-red-50/20' : 'border-heritage-stone dark:border-heritage-charcoal-dark'
                    } bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none`}
                  />
                </div>
                {fieldErrors.email && <p className="text-[11px] text-red-500 mt-1">{fieldErrors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-aged" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className={`w-full pl-9 pr-9 py-2.5 text-xs rounded-xl border ${
                      fieldErrors.password ? 'border-red-400 bg-red-50/20' : 'border-heritage-stone dark:border-heritage-charcoal-dark'
                    } bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-heritage-aged hover:text-heritage-charcoal"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-[11px] text-red-500 mt-1">{fieldErrors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-aged" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Must match password"
                    className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border ${
                      fieldErrors.confirmPassword ? 'border-red-400 bg-red-50/20' : 'border-heritage-stone dark:border-heritage-charcoal-dark'
                    } bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none`}
                  />
                </div>
                {fieldErrors.confirmPassword && <p className="text-[11px] text-red-500 mt-1">{fieldErrors.confirmPassword}</p>}
              </div>

              {/* Address Fields */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                  Address Line / Locality
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-aged" />
                  <input
                    type="text"
                    value={addressLine}
                    onChange={e => setAddressLine(e.target.value)}
                    placeholder="House/Plot No., Street, Rasulgarh / Saheed Nagar"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                  />
                </div>
              </div>

              {/* City & PIN */}
              <div>
                <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Bhubaneswar"
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                  PIN Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={postalCode}
                  onChange={e => setPostalCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="751010"
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                />
              </div>

              {/* Preferred Language */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                  Preferred Language
                </label>
                <div className="flex items-center space-x-2 p-2.5 rounded-xl border border-heritage-gold bg-heritage-gold/10 text-heritage-maroon dark:text-heritage-gold font-bold w-full max-w-xs">
                  <Globe className="w-4 h-4 text-heritage-gold" />
                  <span className="text-xs">English (Primary &amp; Default)</span>
                </div>
              </div>

              {/* Terms & Privacy Consent */}
              <div className="sm:col-span-2 pt-2">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={e => setConsent(e.target.checked)}
                    className="mt-0.5 rounded text-heritage-maroon focus:ring-heritage-gold w-4 h-4"
                  />
                  <span className="text-xs text-heritage-aged leading-relaxed">
                    I agree to the <span className="text-heritage-maroon dark:text-heritage-gold underline font-semibold">Terms of Service</span> and <span className="text-heritage-maroon dark:text-heritage-gold underline font-semibold">Privacy Policy</span>. No Aadhaar or PAN is required.
                  </span>
                </label>
                {fieldErrors.consent && <p className="text-[11px] text-red-500 mt-1">{fieldErrors.consent}</p>}
              </div>

            </div>

            {/* Action buttons */}
            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-heritage-maroon hover:bg-heritage-maroon-dark text-white font-bold text-sm shadow-heritage transition-all duration-150 disabled:opacity-60 flex items-center justify-center space-x-2 border border-heritage-gold/30 hover:scale-[1.01]"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Create Citizen Account</span>
                <ArrowRight className="w-4 h-4 text-heritage-gold" />
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  className="text-xs text-heritage-maroon dark:text-heritage-gold font-semibold hover:underline"
                >
                  Already Registered? Sign In
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ── STEP: SIGN IN TAB ─────────────────────────────────────────────── */}
        {step === 'form' && activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-6 sm:p-8 space-y-5 animate-fade-in max-w-lg mx-auto">
            <div className="space-y-1">
              <h2 className="font-serif font-bold text-xl text-heritage-maroon dark:text-heritage-gold">
                Welcome Back
              </h2>
              <p className="text-xs text-heritage-aged">
                Sign in to report civic issues, track complaints, and stay connected with your city.
              </p>
            </div>

            {/* Quick Demo Fill */}
            <div className="p-3 bg-heritage-gold/10 border border-heritage-gold/30 rounded-xl flex items-center justify-between">
              <div className="text-left">
                <p className="text-xs font-bold text-heritage-maroon dark:text-heritage-gold">Demo Citizen: Debabrata Mohanty</p>
                <p className="text-[10px] text-heritage-aged">Saheed Nagar, Ward 32 · citizen@civicnexus.gov.in</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLoginIdentifier('citizen@civicnexus.gov.in');
                  setLoginPassword('Password@123');
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-heritage-maroon text-white hover:bg-heritage-maroon-dark transition-colors"
              >
                Auto-fill
              </button>
            </div>

            <div className="space-y-4">
              {/* Identifier */}
              <div>
                <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                  Registered Mobile Number OR Email Address *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-aged" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={e => setLoginIdentifier(e.target.value)}
                    placeholder="+91 94370 12345 or citizen@example.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('forgot');
                      setRecoveryIdentifier(loginIdentifier);
                    }}
                    className="text-[11px] text-heritage-maroon dark:text-heritage-gold font-semibold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-aged" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-9 py-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-heritage-aged hover:text-heritage-charcoal"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-heritage-maroon hover:bg-heritage-maroon-dark text-white font-bold text-sm shadow-heritage transition-all duration-150 disabled:opacity-60 flex items-center justify-center space-x-2 border border-heritage-gold/30 hover:scale-[1.01]"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Sign In to Citizen Portal</span>
              <ArrowRight className="w-4 h-4 text-heritage-gold" />
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-heritage-aged">Don't have an account yet? </span>
              <button
                type="button"
                onClick={() => switchTab('register')}
                className="text-xs text-heritage-maroon dark:text-heritage-gold font-bold hover:underline"
              >
                Create Citizen Account
              </button>
            </div>
          </form>
        )}

        {/* Footer info strip */}
        <div className="p-4 bg-heritage-stone/20 dark:bg-heritage-charcoal-dark border-t border-heritage-stone dark:border-heritage-charcoal-dark text-center">
          <p className="text-[11px] text-heritage-aged">
            Protected by CIVIC NEXUS AI security protocols. Database-level unique account constraints & E.164 normalization active.
          </p>
        </div>

      </div>
    </div>
  );
};
