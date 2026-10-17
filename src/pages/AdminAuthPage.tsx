import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  KeyRound,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  LockKeyhole
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export type AuthView = 'login' | 'signup' | 'verify' | 'forgot' | 'reset';

interface AdminAuthPageProps {
  initialView?: AuthView;
}

export const AdminAuthPage: React.FC<AdminAuthPageProps> = ({ initialView }) => {
  const {
    ownerStatus,
    checkAdminAuthStatus,
    loginAdmin,
    signupAdmin,
    verifyAdminEmail,
    resendAdminCode,
    forgotAdminPassword,
    resetAdminPassword,
    setCurrentPage,
    isAdminAuthenticated
  } = useShop();

  // If already authenticated, redirect immediately to the admin console
  useEffect(() => {
    if (isAdminAuthenticated) {
      setCurrentPage('admin');
    }
  }, [isAdminAuthenticated, setCurrentPage]);

  // Determine starting view based on props, URL params, or owner existence
  const [view, setView] = useState<AuthView>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const page = params.get('page');
      if (page === 'admin_verify' || params.get('code')) return 'verify';
      if (page === 'admin_reset_password' || params.get('token')) return 'reset';
      if (page === 'admin_forgot_password') return 'forgot';
      if (page === 'admin_signup') return 'signup';
      if (page === 'admin_login') return 'login';
    }
    if (initialView) return initialView;
    if (ownerStatus?.hasOwner) return 'login';
    return 'signup';
  });

  // Keep view aligned if ownerStatus updates from backend
  useEffect(() => {
    if (ownerStatus) {
      if (ownerStatus.hasOwner && view === 'signup') {
        // Owner already exists; default to login
        setView('login');
      } else if (!ownerStatus.hasOwner && view === 'login') {
        // No owner exists yet; default to first-owner sign up
        setView('signup');
      }
    }
  }, [ownerStatus]);

  // Check URL parameters on mount (e.g. from verification email or reset email link)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');
      const codeParam = params.get('code');
      const tokenParam = params.get('token');

      if (emailParam) {
        setVerifyEmail(emailParam);
        setForgotEmail(emailParam);
        setResetEmail(emailParam);
        setLoginEmail(emailParam);
      }

      if (codeParam) {
        setVerifyCode(codeParam);
        setView('verify');
      }

      if (tokenParam) {
        setResetToken(tokenParam);
        setView('reset');
      }
    }
  }, []);

  // Form States: Sign Up
  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);
  const [signupSubmitting, setSignupSubmitting] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  // Form States: Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Form States: Verification
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifySubmitting, setVerifySubmitting] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccessMsg, setVerifySuccessMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null);

  // Form States: Forgot Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [devTokenHint, setDevTokenHint] = useState<string | null>(null);

  // Form States: Reset Password
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Countdown timer for code resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // 1. Sign Up Handler
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (!signupFullName.trim()) {
      setSignupError('Please provide your Full Name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setSignupError('Please enter a valid email address.');
      return;
    }
    if (signupPassword.length < 8) {
      setSignupError('Password must contain at least 8 characters.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setSignupError('Password and Confirm Password do not match.');
      return;
    }

    setSignupSubmitting(true);
    const res = await signupAdmin({
      fullName: signupFullName.trim(),
      email: signupEmail.trim(),
      password: signupPassword,
      confirmPassword: signupConfirmPassword
    });

    setSignupSubmitting(false);
    if (res.success) {
      setVerifyEmail(res.email || signupEmail.trim());
      if (res.previewCode) {
        setDevCodeHint(res.previewCode);
      }
      setResendCooldown(30);
      setView('verify');
    } else {
      setSignupError(res.error || 'Failed to complete registration.');
    }
  };

  // 2. Login Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Please enter both your email and password.');
      return;
    }

    setLoginSubmitting(true);
    const res = await loginAdmin(loginEmail.trim(), loginPassword, rememberMe);
    setLoginSubmitting(false);

    if (!res.success) {
      if (res.requiresVerification) {
        setVerifyEmail(res.email || loginEmail.trim());
        setView('verify');
        setVerifyError('Your email address must be verified before entering the administrative console.');
        setResendCooldown(20);
      } else {
        setLoginError(res.error || 'Invalid email or password.');
      }
    }
  };

  // 3. Verification Handler
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError(null);
    setVerifySuccessMsg(null);

    const cleanCode = verifyCode.trim();
    if (!verifyEmail.trim()) {
      setVerifyError('Please specify the store owner email.');
      return;
    }
    if (!cleanCode || cleanCode.length < 4) {
      setVerifyError('Please enter the 6-digit authorization passcode.');
      return;
    }

    setVerifySubmitting(true);
    const res = await verifyAdminEmail(verifyEmail.trim(), cleanCode);
    setVerifySubmitting(false);

    if (!res.success) {
      setVerifyError(res.error || 'Invalid verification passcode.');
    }
  };

  // 4. Resend Code Handler
  const handleResendCode = async () => {
    if (resendCooldown > 0 || !verifyEmail.trim()) return;
    setVerifyError(null);
    setVerifySuccessMsg(null);

    const res = await resendAdminCode(verifyEmail.trim());
    if (res.success) {
      setResendCooldown(30);
      setVerifySuccessMsg('A new authorization passcode was sent to your email.');
      if (res.previewCode) {
        setDevCodeHint(res.previewCode);
      }
    } else {
      setVerifyError(res.error || 'Could not resend passcode. Please try again.');
    }
  };

  // 5. Forgot Password Handler
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setForgotError('Please enter a valid email address.');
      return;
    }

    setForgotSubmitting(true);
    const res = await forgotAdminPassword(forgotEmail.trim());
    setForgotSubmitting(false);

    if (res.success) {
      setForgotSuccess(true);
      setResetEmail(forgotEmail.trim());
      if (res.previewToken) {
        setDevTokenHint(res.previewToken);
        setResetToken(res.previewToken);
      }
    } else {
      setForgotError(res.error || 'Failed to dispatch recovery email.');
    }
  };

  // 6. Reset Password Handler
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (!resetEmail.trim() || !resetToken.trim()) {
      setResetError('Email and recovery token are required.');
      return;
    }
    if (resetNewPassword.length < 8) {
      setResetError('New password must be at least 8 characters long.');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('Password and Confirm Password do not match.');
      return;
    }

    setResetSubmitting(true);
    const res = await resetAdminPassword({
      email: resetEmail.trim(),
      token: resetToken.trim(),
      newPassword: resetNewPassword,
      confirmPassword: resetConfirmPassword
    });
    setResetSubmitting(false);

    if (res.success) {
      setLoginEmail(resetEmail.trim());
      setLoginPassword('');
      setView('login');
      // Pre-fill login error as a success notification
      setLoginError(null);
    } else {
      setResetError(res.error || 'Failed to reset password. Recovery link may have expired.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-12 bg-[#FAF6F0]">
      <div className="w-full max-w-md bg-[#FAF6F0] rounded-xl sm:rounded-2xl border border-[#EBDDCF] shadow-[0_4px_24px_rgba(43,29,23,0.06)] p-6 sm:p-8 relative">
        {/* Luxury Crest / Top Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#2B1D17] text-[#FAF6F0] mb-3 border border-[#C48A5A]/50">
            {view === 'verify' ? (
              <Mail className="w-6 h-6 text-[#C48A5A]" />
            ) : view === 'forgot' || view === 'reset' ? (
              <KeyRound className="w-6 h-6 text-[#C48A5A]" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-[#C48A5A]" />
            )}
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C48A5A] font-semibold block">
            Lumora Haute Couture
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl text-[#2B1D17] tracking-[0.04em] uppercase mt-1 leading-tight">
            {view === 'signup' && 'Store Owner Registration'}
            {view === 'login' && 'Atelier Executive Login'}
            {view === 'verify' && 'Email Verification'}
            {view === 'forgot' && 'Credential Recovery'}
            {view === 'reset' && 'Establish New Password'}
          </h1>
          <p className="text-xs text-[#6B4A3A] font-light mt-1.5 leading-relaxed">
            {view === 'signup' &&
              'Register the master governance account for the Lumora Atelier. Only the first store owner may sign up.'}
            {view === 'login' &&
              'Restricted administrative console for the authorized Lumora Maison owner.'}
            {view === 'verify' &&
              `Enter the 6-digit authorization passcode dispatched to ${verifyEmail || 'your email'}.`}
            {view === 'forgot' &&
              'Enter your store owner email address to receive password recovery instructions.'}
            {view === 'reset' &&
              'Enter the recovery token from your email and establish your new secure password.'}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: SIGN UP (Strictly for the First Store Owner) */}
        {/* ========================================================================= */}
        {view === 'signup' && (
          <div>
            {ownerStatus?.hasOwner ? (
              // If an owner already exists, lockdown public sign up completely
              <div className="space-y-4">
                <div className="p-4 bg-[#FAF6F0] border border-[#C48A5A]/40 text-left">
                  <div className="flex items-start gap-2.5">
                    <LockKeyhole className="w-5 h-5 text-[#C48A5A] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs uppercase font-bold tracking-wider text-[#2B1D17]">
                        Single-Owner Governance Locked
                      </h4>
                      <p className="text-xs text-[#6B4A3A] mt-1 leading-relaxed">
                        A verified store owner has already been registered for this atelier. Public sign-up has been permanently disabled to protect store integrity.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="w-full bg-[#2B1D17] hover:bg-[#6B4A3A] text-[#FAF6F0] py-3 text-xs uppercase tracking-[0.16em] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Admin Login</span>
                  <ArrowRight className="w-4 h-4 text-[#C48A5A]" />
                </button>
              </div>
            ) : (
              // First Store Owner Sign Up Form
              <form onSubmit={handleSignUpSubmit} className="space-y-4 text-left">
                {/* Informational First Owner Notice */}
                <div className="p-3 bg-[#FAF6F0] border-l-2 border-[#C48A5A] text-[11px] text-[#6B4A3A] leading-relaxed flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C48A5A] shrink-0" />
                  <span>
                    <strong>First-Time Setup:</strong> This form initializes the sole owner account. Public registration will close immediately after creation.
                  </span>
                </div>

                {signupError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{signupError}</span>
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="block text-[10.5px] uppercase tracking-wider font-semibold text-[#2B1D17] mb-1.5">
                    Full Name <span className="text-[#C48A5A]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={signupFullName}
                      onChange={(e) => setSignupFullName(e.target.value)}
                      placeholder="e.g. Amna Naeem"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#FAF6F0]/50 border border-[#E7D6C1] focus:border-[#C48A5A] focus:bg-white text-[#2B1D17] outline-none transition-colors"
                    />
                    <User className="w-4 h-4 text-[#C48A5A] absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-[10.5px] uppercase tracking-wider font-semibold text-[#2B1D17] mb-1.5">
                    Owner Email Address <span className="text-[#C48A5A]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="owner@lumora.luxury"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#FAF6F0]/50 border border-[#E7D6C1] focus:border-[#C48A5A] focus:bg-white text-[#2B1D17] outline-none transition-colors"
                    />
                    <Mail className="w-4 h-4 text-[#C48A5A] absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10.5px] uppercase tracking-wider font-semibold text-[#2B1D17]">
                      Password <span className="text-[#C48A5A]">*</span>
                    </label>
                    <span className="text-[10px] text-[#6B4A3A]">Minimum 8 characters</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Create master password"
                      className="w-full pl-9 pr-10 py-2.5 text-xs bg-[#FAF6F0]/50 border border-[#E7D6C1] focus:border-[#C48A5A] focus:bg-white text-[#2B1D17] outline-none transition-colors"
                    />
                    <Lock className="w-4 h-4 text-[#C48A5A] absolute left-3 top-3 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-2.5 text-[#6B4A3A] hover:text-[#2B1D17] cursor-pointer"
                    >
                      {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-[10.5px] uppercase tracking-wider font-semibold text-[#2B1D17] mb-1.5">
                    Confirm Password <span className="text-[#C48A5A]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showSignupConfirm ? 'text' : 'password'}
                      required
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="Repeat master password"
                      className="w-full pl-9 pr-10 py-2.5 text-xs bg-[#FAF6F0]/50 border border-[#E7D6C1] focus:border-[#C48A5A] focus:bg-white text-[#2B1D17] outline-none transition-colors"
                    />
                    <Lock className="w-4 h-4 text-[#C48A5A] absolute left-3 top-3 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowSignupConfirm(!showSignupConfirm)}
                      className="absolute right-3 top-2.5 text-[#6B4A3A] hover:text-[#2B1D17] cursor-pointer"
                    >
                      {showSignupConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {signupPassword && signupConfirmPassword && (
                    <div className="mt-1.5 text-[10.5px] flex items-center gap-1.5">
                      {signupPassword === signupConfirmPassword ? (
                        <span className="text-emerald-700 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                        </span>
                      ) : (
                        <span className="text-rose-600 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={signupSubmitting}
                  className="w-full bg-[#2B1D17] hover:bg-[#6B4A3A] disabled:opacity-50 text-[#FAF6F0] py-3 text-xs uppercase tracking-[0.16em] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 shadow-sm"
                >
                  {signupSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#C48A5A]" />
                      <span>Initializing Master Key...</span>
                    </>
                  ) : (
                    <>
                      <span>Initialize Store Owner Account</span>
                      <ArrowRight className="w-4 h-4 text-[#C48A5A]" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2 border-t border-[#E7D6C1]/60">
                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className="text-xs text-[#6B4A3A] hover:text-[#2B1D17] underline cursor-pointer"
                  >
                    Already have an account? Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: LOGIN */}
        {/* ========================================================================= */}
        {view === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-[10.5px] uppercase tracking-wider font-semibold text-[#2B1D17] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="owner@lumora.luxury"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#FAF6F0]/50 border border-[#E7D6C1] focus:border-[#C48A5A] focus:bg-white text-[#2B1D17] outline-none transition-colors"
                />
                <Mail className="w-4 h-4 text-[#C48A5A] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10.5px] uppercase tracking-wider font-semibold text-[#2B1D17]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(loginEmail);
                    setView('forgot');
                  }}
                  className="text-[10.5px] text-[#C48A5A] hover:text-[#2B1D17] underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter administrative password"
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-[#FAF6F0]/50 border border-[#E7D6C1] focus:border-[#C48A5A] focus:bg-white text-[#2B1D17] outline-none transition-colors"
                />
                <Lock className="w-4 h-4 text-[#C48A5A] absolute left-3 top-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-2.5 text-[#6B4A3A] hover:text-[#2B1D17] cursor-pointer"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#6B4A3A]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#C48A5A] rounded-none cursor-pointer"
                />
                <span>Remember me on this device (30 Days)</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginSubmitting}
              className="w-full bg-[#2B1D17] hover:bg-[#6B4A3A] disabled:opacity-50 text-[#FAF6F0] py-3 text-xs uppercase tracking-[0.16em] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer mt-3 shadow-sm"
            >
              {loginSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#C48A5A]" />
                  <span>Authorizing Session...</span>
                </>
              ) : (
                <>
                  <span>Authorize Executive Access</span>
                  <ArrowRight className="w-4 h-4 text-[#C48A5A]" />
                </>
              )}
            </button>

            {/* Alternative Link: If no owner exists yet, allow switching to Sign Up */}
            {!ownerStatus?.hasOwner && (
              <div className="text-center pt-2 border-t border-[#E7D6C1]/60">
                <button
                  type="button"
                  onClick={() => setView('signup')}
                  className="text-xs text-[#C48A5A] hover:text-[#2B1D17] font-semibold underline cursor-pointer"
                >
                  First-time owner? Register master account
                </button>
              </div>
            )}
          </form>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: EMAIL VERIFICATION */}
        {/* ========================================================================= */}
        {view === 'verify' && (
          <form onSubmit={handleVerifySubmit} className="space-y-4 text-left">
            {verifySuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{verifySuccessMsg}</span>
              </div>
            )}

            {verifyError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{verifyError}</span>
              </div>
            )}

            {/* Target Email Confirmation */}
            <div>
              <label className="block text-[10.5px] uppercase tracking-wider font-semibold text-[#2B1D17] mb-1.5">
                Owner Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={verifyEmail}
                  onChange={(e) => setVerifyEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#FAF6F0]/50 border border-[#E7D6C1] focus:border-[#C48A5A] text-[#2B1D17] outline-none"
                />
                <Mail className="w-4 h-4 text-[#C48A5A] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* 6-Digit Passcode Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10.5px] uppercase tracking-wider font-semibold text-[#2B1D17]">
                  6-Digit Passcode
                </label>
                <span className="text-[10px] text-[#6B4A3A]">Check inbox or spam folder</span>
              </div>
              <input
                type="text"
                required
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="123456"
                className="w-full py-3 text-center text-2xl font-mono tracking-[0.4em] bg-[#FAF6F0] border-2 border-[#C48A5A] text-[#2B1D17] font-bold outline-none focus:bg-white"
              />
            </div>

            {/* Development Mode Helper hint */}
            {devCodeHint && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between">
                <span>Passcode preview: <strong className="font-mono font-bold text-[#2B1D17]">{devCodeHint}</strong></span>
                <button
                  type="button"
                  onClick={() => setVerifyCode(devCodeHint)}
                  className="text-xs text-[#C48A5A] underline font-bold cursor-pointer"
                >
                  Auto-fill
                </button>
              </div>
            )}

            {/* Submit Verification */}
            <button
              type="submit"
              disabled={verifySubmitting || verifyCode.trim().length < 4}
              className="w-full bg-[#2B1D17] hover:bg-[#6B4A3A] disabled:opacity-50 text-[#FAF6F0] py-3 text-xs uppercase tracking-[0.16em] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {verifySubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#C48A5A]" />
                  <span>Verifying Passcode...</span>
                </>
              ) : (
                <>
                  <span>Verify & Unlock Console</span>
                  <CheckCircle2 className="w-4 h-4 text-[#C48A5A]" />
                </>
              )}
            </button>

            {/* Resend and Navigation */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E7D6C1]/60">
              <button
                type="button"
                onClick={() => setView('login')}
                className="text-[#6B4A3A] hover:text-[#2B1D17] flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0}
                className="text-[#C48A5A] hover:text-[#2B1D17] disabled:opacity-50 font-medium underline cursor-pointer"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Passcode'}
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: FORGOT PASSWORD */}
        {/* ========================================================================= */}
        {view === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4 text-left">
            {forgotSuccess ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-left">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs uppercase font-bold tracking-wider text-emerald-900">
                        Recovery Email Dispatched
                      </h4>
                      <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                        Instructions have been sent to <strong>{forgotEmail}</strong>. Please check your inbox for the password reset link or token.
                      </p>
                    </div>
                  </div>
                </div>

                {devTokenHint && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                    <p className="font-semibold mb-1">Recovery Token:</p>
                    <code className="block bg-white p-1.5 border border-amber-200 font-mono text-[10px] break-all">
                      {devTokenHint}
                    </code>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setView('reset')}
                  className="w-full bg-[#2B1D17] hover:bg-[#6B4A3A] text-[#FAF6F0] py-3 text-xs uppercase tracking-[0.16em] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Enter Reset Token & New Password</span>
                  <ArrowRight className="w-4 h-4 text-[#C48A5A]" />
                </button>
              </div>
            ) : (
              <>
                {forgotError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[10.5px] uppercase tracking-wider font-semibold text-[#2B1D17] mb-1.5">
                    Registered Store Owner Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="owner@lumora.luxury"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#FAF6F0]/50 border border-[#E7D6C1] focus:border-[#C48A5A] text-[#2B1D17] outline-none"
                    />
                    <Mail className="w-4 h-4 text-[#C48A5A] absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotSubmitting}
                  className="w-full bg-[#2B1D17] hover:bg-[#6B4A3A] disabled:opacity-50 text-[#FAF6F0] py-3 text-xs uppercase tracking-[0.16em] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {forgotSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#C48A5A]" />
                      <span>Dispatching Instructions...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Recovery Instructions</span>
                      <ArrowRight className="w-4 h-4 text-[#C48A5A]" />
                    </>
                  )}
                </button>
              </>
            )}

            <div className="text-center pt-2 border-t border-[#E7D6C1]/60">
              <button
                type="button"
                onClick={() => setView('login')}
                className="text-xs text-[#6B4A3A] hover:text-[#2B1D17] flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* VIEW 5: RESET PASSWORD */}
        {/* ========================================================================= */}
        {view === 'reset' && (
          <form onSubmit={handleResetSubmit} className="space-y-4 text-left">
            {resetError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{resetError}</span>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-[10.5px] uppercase tracking-wider font-semibold text-[#2B1D17] mb-1.5">
                Owner Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#FAF6F0]/50 border border-[#E7D6C1] focus:border-[#C48A5A] text-[#2B1D17] outline-none"
                />
                <Mail className="w-4 h-4 text-[#C48A5A] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Token */}
            <div>
              <label className="block text-[10.5px] uppercase tracking-wider font-semibold text-[#2B1D17] mb-1.5">
                Recovery Token
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Paste token from recovery email"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#FAF6F0]/50 border border-[#E7D6C1] focus:border-[#C48A5A] text-[#2B1D17] font-mono outline-none"
                />
                <KeyRound className="w-4 h-4 text-[#C48A5A] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-[10.5px] uppercase tracking-wider font-semibold text-[#2B1D17] mb-1.5">
                New Password (Minimum 8 Characters)
              </label>
              <div className="relative">
                <input
                  type={showResetPassword ? 'text' : 'password'}
                  required
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="Create new master password"
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-[#FAF6F0]/50 border border-[#E7D6C1] focus:border-[#C48A5A] text-[#2B1D17] outline-none"
                />
                <Lock className="w-4 h-4 text-[#C48A5A] absolute left-3 top-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                  className="absolute right-3 top-2.5 text-[#6B4A3A] hover:text-[#2B1D17] cursor-pointer"
                >
                  {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-[10.5px] uppercase tracking-wider font-semibold text-[#2B1D17] mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showResetConfirm ? 'text' : 'password'}
                  required
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                  placeholder="Repeat new master password"
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-[#FAF6F0]/50 border border-[#E7D6C1] focus:border-[#C48A5A] text-[#2B1D17] outline-none"
                />
                <Lock className="w-4 h-4 text-[#C48A5A] absolute left-3 top-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(!showResetConfirm)}
                  className="absolute right-3 top-2.5 text-[#6B4A3A] hover:text-[#2B1D17] cursor-pointer"
                >
                  {showResetConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={resetSubmitting}
              className="w-full bg-[#2B1D17] hover:bg-[#6B4A3A] disabled:opacity-50 text-[#FAF6F0] py-3 text-xs uppercase tracking-[0.16em] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {resetSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#C48A5A]" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Save New Password & Log In</span>
                  <ArrowRight className="w-4 h-4 text-[#C48A5A]" />
                </>
              )}
            </button>

            <div className="text-center pt-2 border-t border-[#E7D6C1]/60">
              <button
                type="button"
                onClick={() => setView('login')}
                className="text-xs text-[#6B4A3A] hover:text-[#2B1D17] flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
              </button>
            </div>
          </form>
        )}

        {/* Security Footer Notice */}
        <div className="mt-8 pt-4 border-t border-[#E7D6C1]/60 text-center text-[10px] text-[#8C6A58] uppercase tracking-wider flex items-center justify-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-[#C48A5A]" />
          <span>256-Bit Encrypted &bull; Single-Owner Governance</span>
        </div>
      </div>
    </div>
  );
};
