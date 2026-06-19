import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth, getErrorMessage } from '../context/AuthContext';
import { ROLES } from '../utils/constants';

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: ROLES.CONSUMER,
  });
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await register(form);
      toast.success('Account created!');
      navigate(user.role === 'grower' ? '/grower/profile' : '/consumer/profile');
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create account</h1>
          <p className="mt-2 text-sm text-slate-500">Join G2C as a grower or consumer</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
            <input type="email" name="email" required placeholder="name@example.com" className="input-field" value={form.email} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              className="input-field"
              placeholder="Min 8 chars, must contain a number"
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">I want to join as a</label>
            <select name="role" className="input-field" value={form.role} onChange={handleChange}>
              <option value={ROLES.CONSUMER}>Consumer (buyer)</option>
              <option value={ROLES.GROWER}>Grower (farmer)</option>
            </select>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full mt-2 py-3 shadow-md shadow-primary-600/10">
            {submitting ? 'Creating...' : 'Create account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary-700 hover:text-primary-800 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
