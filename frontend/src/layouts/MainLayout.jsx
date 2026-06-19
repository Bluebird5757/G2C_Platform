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
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-bold text-primary-700 text-xl">
            <span className="text-2xl">🌾</span> G2C
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <NavLink to="/" className={({ isActive }) => isActive ? 'text-primary-700' : 'hover:text-primary-600'} end>
              Home
            </NavLink>
            {isAuthenticated && (
              <NavLink to={dashLink} className={({ isActive }) => isActive ? 'text-primary-700' : 'hover:text-primary-600'}>
                Dashboard
              </NavLink>
            )}
            {isAuthenticated && user?.role === 'consumer' && (
              <NavLink to="/consumer/search" className={({ isActive }) => isActive ? 'text-primary-700' : 'hover:text-primary-600'}>
                Find Growers
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:inline text-sm text-gray-500">{user.email}</span>
                <button onClick={handleLogout} className="btn-secondary text-sm py-2">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm py-2">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2">Sign up</Link>
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
