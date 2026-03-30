import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
  Smartphone,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const initialLoginForm = {
  identifier: '',
  password: '',
};

const initialSignupForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  otpChannel: 'phone',
};

function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, login, requestSignup, verifySignup } = useAuth();
  const redirectTo = searchParams.get('redirect') || '/';
  const [activeTab, setActiveTab] = useState('login');
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [signupForm, setSignupForm] = useState(initialSignupForm);
  const [signupSession, setSignupSession] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loginState, setLoginState] = useState({ submitting: false, message: '', type: '' });
  const [signupState, setSignupState] = useState({ submitting: false, message: '', type: '' });
  const [verificationState, setVerificationState] = useState({
    submitting: false,
    message: '',
    type: '',
  });

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSignupChange = (event) => {
    const { name, value } = event.target;
    setSignupForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginState({ submitting: true, message: '', type: '' });

    try {
      await login(loginForm);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setLoginState({
        submitting: false,
        type: 'error',
        message: error.response?.data?.message || 'Unable to log in with those details.',
      });
      return;
    }

    setLoginState({ submitting: false, message: '', type: '' });
  };

  const handleSignupRequest = async (event) => {
    event.preventDefault();
    setSignupState({ submitting: true, message: '', type: '' });
    setVerificationState({ submitting: false, message: '', type: '' });

    if (signupForm.password !== signupForm.confirmPassword) {
      setSignupState({
        submitting: false,
        type: 'error',
        message: 'Password and confirm password must match.',
      });
      return;
    }

    try {
      const response = await requestSignup({
        name: signupForm.name,
        email: signupForm.email,
        phone: signupForm.phone,
        password: signupForm.password,
        otpChannel: signupForm.otpChannel,
      });

      setSignupSession(response);
      setSignupState({
        submitting: false,
        type: 'success',
        message: `OTP generated for your ${response.otpChannel === 'phone' ? 'phone number' : 'email address'}. Enter the 6-digit code to complete signup.`,
      });
    } catch (error) {
      setSignupState({
        submitting: false,
        type: 'error',
        message: error.response?.data?.message || 'Unable to start signup.',
      });
    }
  };

  const handleVerification = async (event) => {
    event.preventDefault();
    if (!signupSession) {
      return;
    }

    setVerificationState({ submitting: true, message: '', type: '' });

    try {
      await verifySignup({
        pendingSignupId: signupSession.pendingSignupId,
        verificationCode,
      });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setVerificationState({
        submitting: false,
        type: 'error',
        message: error.response?.data?.message || 'Verification failed.',
      });
      return;
    }

    setVerificationState({
      submitting: false,
      type: 'success',
      message: 'Signup complete.',
    });
  };

  return (
    <div className="section-shell py-10">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="luxury-panel rounded-[34px] border border-white/10 p-8 md:p-10">
          <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-100">
            <ShieldCheck size={14} />
            Customer Access
          </div>
          <h1 className="headline-font mt-5 text-5xl font-semibold text-stone-100">
            Signup with password, then verify with OTP.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-stone-400">
            Customers now create a password during signup and can choose whether the OTP is generated
            for their phone number or email address before the account becomes active.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-stone-100">Password Login</p>
              <p className="mt-2 text-sm leading-6 text-stone-400">
                Login uses email or phone number together with the password created during signup.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-stone-100">OTP Verification</p>
              <p className="mt-2 text-sm leading-6 text-stone-400">
                The account is created only after the OTP is verified successfully.
              </p>
            </div>
          </div>
          {redirectTo !== '/' ? (
            <div className="mt-8 rounded-[24px] border border-amber-200/20 bg-amber-200/10 p-5 text-sm text-amber-100">
              Login is required before continuing to that page.
            </div>
          ) : null}
        </section>

        <section className="luxury-panel rounded-[34px] border border-white/10 p-8 md:p-10">
          <div className="flex gap-3">
            {[
              ['login', 'Login'],
              ['signup', 'Sign Up'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setActiveTab(value)}
                className={`rounded-full px-5 py-2 text-sm uppercase tracking-[0.25em] transition ${
                  activeTab === value
                    ? 'bg-amber-200 text-black'
                    : 'border border-white/10 bg-white/5 text-stone-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <label className="block space-y-2">
                <span className="text-sm text-stone-400">Email Address or Mobile Number</span>
                <input
                  required
                  name="identifier"
                  value={loginForm.identifier}
                  onChange={handleLoginChange}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm text-stone-400">Password</span>
                <input
                  required
                  name="password"
                  type="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40"
                />
              </label>
              {loginState.message ? (
                <p className={`text-sm ${loginState.type === 'error' ? 'text-red-300' : 'text-emerald-300'}`}>
                  {loginState.message}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={loginState.submitting}
                className="inline-flex items-center gap-3 rounded-full bg-amber-200 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-black disabled:opacity-60"
              >
                <LogIn size={16} />
                {loginState.submitting ? 'Logging In' : 'Login'}
              </button>
            </form>
          ) : (
            <div className="mt-8 space-y-6">
              <form onSubmit={handleSignupRequest} className="space-y-5">
                <label className="block space-y-2">
                  <span className="text-sm text-stone-400">Full Name</span>
                  <input
                    required
                    name="name"
                    value={signupForm.name}
                    onChange={handleSignupChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300/40"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm text-stone-400">Email Address</span>
                  <input
                    required
                    type="email"
                    name="email"
                    value={signupForm.email}
                    onChange={handleSignupChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300/40"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm text-stone-400">Mobile Number</span>
                  <input
                    required
                    name="phone"
                    value={signupForm.phone}
                    onChange={handleSignupChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300/40"
                  />
                </label>
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-sm text-stone-400">Create Password</span>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <LockKeyhole size={16} className="text-stone-400" />
                      <input
                        required
                        name="password"
                        type="password"
                        value={signupForm.password}
                        onChange={handleSignupChange}
                        className="w-full bg-transparent outline-none"
                      />
                    </div>
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm text-stone-400">Confirm Password</span>
                    <input
                      required
                      name="confirmPassword"
                      type="password"
                      value={signupForm.confirmPassword}
                      onChange={handleSignupChange}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300/40"
                    />
                  </label>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-sm font-semibold text-stone-100">Generate OTP On</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {[
                      {
                        value: 'phone',
                        label: 'Phone Number',
                        icon: Smartphone,
                      },
                      {
                        value: 'email',
                        label: 'Email Address',
                        icon: Mail,
                      },
                    ].map((item) => {
                      const IconComponent = item.icon;

                      return (
                      <label
                        key={item.value}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${
                          signupForm.otpChannel === item.value
                            ? 'border-cyan-300/40 bg-cyan-300/10 text-cyan-100'
                            : 'border-white/10 bg-black/20 text-stone-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="otpChannel"
                          value={item.value}
                          checked={signupForm.otpChannel === item.value}
                          onChange={handleSignupChange}
                          className="sr-only"
                        />
                        <IconComponent size={16} />
                        {item.label}
                      </label>
                      );
                    })}
                  </div>
                </div>
                {signupState.message ? (
                  <p className={`text-sm ${signupState.type === 'error' ? 'text-red-300' : 'text-emerald-300'}`}>
                    {signupState.message}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={signupState.submitting}
                  className="inline-flex items-center gap-3 rounded-full bg-cyan-300 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-black disabled:opacity-60"
                >
                  <UserPlus size={16} />
                  {signupState.submitting ? 'Generating OTP' : 'Create Account & Generate OTP'}
                </button>
              </form>

              {signupSession ? (
                <form
                  onSubmit={handleVerification}
                  className="rounded-[28px] border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex items-center gap-3 text-cyan-100">
                    <KeyRound size={16} />
                    <p className="text-sm font-semibold uppercase tracking-[0.25em]">Verify Signup</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-stone-400">
                    Enter the OTP generated for{' '}
                    <span className="text-stone-100">{signupSession.otpTarget}</span> to activate the
                    customer account.
                  </p>
                  <div className="mt-4 rounded-2xl border border-amber-200/20 bg-amber-200/10 px-4 py-3 text-sm text-amber-100">
                    Demo OTP: <span className="font-semibold">{signupSession.verificationCode}</span>
                  </div>
                  <label className="mt-4 block space-y-2">
                    <span className="text-sm text-stone-400">OTP</span>
                    <input
                      required
                      value={verificationCode}
                      onChange={(event) => setVerificationCode(event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-cyan-300/40"
                    />
                  </label>
                  {verificationState.message ? (
                    <p
                      className={`mt-4 text-sm ${
                        verificationState.type === 'error' ? 'text-red-300' : 'text-emerald-300'
                      }`}
                    >
                      {verificationState.message}
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={verificationState.submitting}
                    className="mt-5 inline-flex items-center gap-3 rounded-full bg-amber-200 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-black disabled:opacity-60"
                  >
                    <CheckCircle2 size={16} />
                    {verificationState.submitting ? 'Verifying OTP' : 'Verify & Continue'}
                  </button>
                </form>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
