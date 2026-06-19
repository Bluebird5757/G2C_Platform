import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashLink = user?.role === 'grower' ? '/grower/dashboard' : '/consumer/dashboard';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/30">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-primary-700 text-xl tracking-tight">
            <span className="text-2xl filter drop-shadow">🌾</span> G2C
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <NavLink to="/" className={({ isActive }) => isActive ? 'text-primary-600 font-bold' : 'hover:text-slate-950 transition-colors'} end>
              Home
            </NavLink>
            {isAuthenticated && (
              <NavLink to={dashLink} className={({ isActive }) => isActive ? 'text-primary-600 font-bold' : 'hover:text-slate-950 transition-colors'}>
                Dashboard
              </NavLink>
            )}
            {isAuthenticated && user?.role === 'consumer' && (
              <NavLink to="/consumer/search" className={({ isActive }) => isActive ? 'text-primary-600 font-bold' : 'hover:text-slate-950 transition-colors'}>
                Find Growers
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:inline text-xs font-semibold px-3 py-1.5 bg-slate-100 rounded-full text-slate-600">{user.email}</span>
                <button onClick={handleLogout} className="btn-secondary text-xs px-4 py-2">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-xs px-4 py-2 border-0 bg-transparent shadow-none hover:bg-slate-100/50">Login</Link>
                <Link to="/register" className="btn-primary text-xs px-4 py-2">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-white py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Grower2Consumer — Fresh from farm to your table.
      </footer>
    </div>
  );
}
