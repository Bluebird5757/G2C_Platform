import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth, getErrorMessage } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await login(form);
      toast.success('Welcome back!');
      navigate(user.role === 'grower' ? '/grower/dashboard' : '/consumer/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-16 bg-gradient-to-tr from-primary-50/20 via-slate-50 to-emerald-50/20">
      <div className="card w-full max-w-md border border-slate-100 shadow-xl shadow-slate-200/50 bg-white/90 backdrop-blur-sm p-8 sm:p-10">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-1.5 font-black text-primary-700 text-2xl tracking-tight mb-6">
            🌾 G2C
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign in</h1>
          <p className="mt-2 text-sm text-slate-500">Access your Grower2Consumer account</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
            <input type="email" name="email" required placeholder="name@example.com" className="input-field" value={form.email} onChange={handleChange} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-semibold text-slate-700">Password</label>
            </div>
            <input type="password" name="password" required placeholder="••••••••" className="input-field" value={form.password} onChange={handleChange} />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full mt-2 py-3 shadow-md shadow-primary-600/10">
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          New to G2C?{' '}
          <Link to="/register" className="font-bold text-primary-700 hover:text-primary-800 transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
