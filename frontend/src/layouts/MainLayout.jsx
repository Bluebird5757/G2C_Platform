import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export default function MainLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const { cart, removeFromCart, updateQuantity, clearCart, checkout, totalAmount, cartCount } = useCart();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const handleLogout = () => {
    logout();
    clearCart();
    navigate('/');
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    const success = await checkout();
    setCheckingOut(false);
    if (success) {
      setIsCartOpen(false);
      navigate('/consumer/orders');
    }
  };

  const dashLink = user?.role === 'grower' ? '/grower/dashboard' : '/consumer/dashboard';
  const ordersLink = user?.role === 'grower' ? '/grower/orders' : '/consumer/orders';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/30 dark:bg-slate-950 transition-colors duration-200">
      <header className="sticky top-0 z-40 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-primary-700 dark:text-primary-500 text-xl tracking-tight">
            <span className="text-2xl filter drop-shadow">🌾</span> G2C
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <NavLink to="/" className={({ isActive }) => isActive ? 'text-primary-600 dark:text-primary-400 font-bold' : 'hover:text-slate-950 dark:hover:text-white transition-colors'} end>
              Home
            </NavLink>
            {isAuthenticated && (
              <NavLink to={dashLink} className={({ isActive }) => isActive ? 'text-primary-600 dark:text-primary-400 font-bold' : 'hover:text-slate-950 dark:hover:text-white transition-colors'}>
                Dashboard
              </NavLink>
            )}
            {isAuthenticated && user?.role === 'consumer' && (
              <NavLink to="/consumer/search" className={({ isActive }) => isActive ? 'text-primary-600 dark:text-primary-400 font-bold' : 'hover:text-slate-950 dark:hover:text-white transition-colors'}>
                Find Growers
              </NavLink>
            )}
            {isAuthenticated && (
              <NavLink to={ordersLink} className={({ isActive }) => isActive ? 'text-primary-600 dark:text-primary-400 font-bold' : 'hover:text-slate-950 dark:hover:text-white transition-colors'}>
                My Orders
              </NavLink>
            )}
            {isAuthenticated && (
              <NavLink to="/chat" className={({ isActive }) => isActive ? 'text-primary-600 dark:text-primary-400 font-bold' : 'hover:text-slate-950 dark:hover:text-white transition-colors'}>
                Messages
              </NavLink>
            )}
            {isAuthenticated && (
              <NavLink to="/price-trends" className={({ isActive }) => isActive ? 'text-primary-600 dark:text-primary-400 font-bold' : 'hover:text-slate-950 dark:hover:text-white transition-colors'}>
                Price Trends
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              aria-label="Toggle Theme"
            >
              <span className="text-xl">{isDark ? '☀️' : '🌙'}</span>
            </button>

            {isAuthenticated && user?.role === 'consumer' && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors focus:outline-none"
              >
                <span className="text-xl">🛒</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {isAuthenticated ? (
              <>
                <span className="hidden sm:inline text-xs font-semibold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 border dark:border-slate-700/50">{user.email}</span>
                <button onClick={handleLogout} className="btn-secondary text-xs px-4 py-2">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-xs px-4 py-2 border-0 bg-transparent shadow-none hover:bg-slate-100/50 dark:hover:bg-slate-800/50">Login</Link>
                <Link to="/register" className="btn-primary text-xs px-4 py-2">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Cart Drawer Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Background backdrop */}
            <div onClick={() => setIsCartOpen(false)} className="absolute inset-0 bg-slate-950/20 backdrop-blur-xs transition-opacity" />

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md">
                <div className="flex h-full flex-col bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-100 dark:border-slate-800">
                  {/* Cart Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-6 sm:px-6">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white" id="slide-over-title">Shopping Cart</h2>
                    <button
                      type="button"
                      onClick={() => setIsCartOpen(false)}
                      className="text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-400 focus:outline-none"
                    >
                      <span className="text-xl">✕</span>
                    </button>
                  </div>

                  {/* Cart Body */}
                  <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                    {cart.items.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center text-center">
                        <span className="text-5xl mb-4 opacity-50">🌾</span>
                        <p className="text-base font-medium text-slate-900 dark:text-white">Your cart is empty</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Add fresh items from a grower to start ordering.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ordering from</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{cart.growerName}</p>
                        </div>

                        <ul role="list" className="divide-y divide-slate-100 dark:divide-slate-800">
                          {cart.items.map((item) => (
                            <li key={item.name} className="flex py-4">
                              <div className="flex flex-1 flex-col">
                                <div>
                                  <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white">
                                    <h3 className="capitalize">{item.name}</h3>
                                    <p className="ml-4">₹{item.price * item.quantity}</p>
                                  </div>
                                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">₹{item.price} per unit</p>
                                </div>
                                <div className="flex flex-1 items-end justify-between text-xs mt-3">
                                  <div className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 rounded-md p-1 bg-white dark:bg-slate-800 shadow-xs">
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity(item.name, item.quantity - 1)}
                                      className="h-5 w-5 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded focus:outline-none dark:text-white"
                                    >
                                      -
                                    </button>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 px-1">{item.quantity}</span>
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity(item.name, item.quantity + 1)}
                                      className="h-5 w-5 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded focus:outline-none dark:text-white"
                                    >
                                      +
                                    </button>
                                  </div>

                                  <div className="flex">
                                    <button
                                      type="button"
                                      onClick={() => removeFromCart(item.name)}
                                      className="font-semibold text-rose-500 hover:text-rose-600 focus:outline-none"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Cart Footer */}
                  {cart.items.length > 0 && (
                    <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-6 sm:px-6 bg-slate-50/50 dark:bg-slate-950/50">
                      <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white">
                        <p>Total amount</p>
                        <p>₹{totalAmount}</p>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Orders are mock payments and pickup is coordinated directly.</p>
                      <div className="mt-6 space-y-3">
                        <button
                          onClick={handleCheckout}
                          disabled={checkingOut}
                          className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center"
                        >
                          {checkingOut ? 'Placing Order...' : 'Place Order'}
                        </button>
                        <button
                          onClick={clearCart}
                          className="btn-secondary w-full py-2.5 text-xs font-semibold text-rose-600 border border-slate-200 dark:border-slate-800 hover:bg-rose-50/20"
                        >
                          Clear Cart
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 text-center text-sm text-gray-500 dark:text-slate-400">
        © {new Date().getFullYear()} Grower2Consumer — Fresh from farm to your table.
      </footer>
    </div>
  );
}
