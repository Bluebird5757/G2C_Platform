import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute, { GuestRoute } from './routes/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import GrowerDashboard from './pages/grower/GrowerDashboard';
import GrowerProfilePage from './pages/grower/GrowerProfilePage';
import CreateListingPage from './pages/grower/CreateListingPage';
import MyListingsPage from './pages/grower/MyListingsPage';
import GrowerOrdersPage from './pages/grower/GrowerOrdersPage';
import ConsumerDashboard from './pages/consumer/ConsumerDashboard';
import ConsumerProfilePage from './pages/consumer/ConsumerProfilePage';
import FindGrowersPage from './pages/consumer/FindGrowersPage';
import ConsumerOrdersPage from './pages/consumer/ConsumerOrdersPage';
import ChatPage from './pages/chat/ChatPage';
import { ROLES } from './utils/constants';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-right" />
          <Routes>
            <Route element={<MainLayout />}>
              <Route index element={<LandingPage />} />

              <Route element={<GuestRoute />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
              </Route>

              <Route element={<ProtectedRoute roles={[ROLES.GROWER]} />}>
                <Route path="grower/dashboard" element={<GrowerDashboard />} />
                <Route path="grower/profile" element={<GrowerProfilePage />} />
                <Route path="grower/listings/new" element={<CreateListingPage />} />
                <Route path="grower/listings" element={<MyListingsPage />} />
                <Route path="grower/orders" element={<GrowerOrdersPage />} />
              </Route>

              <Route element={<ProtectedRoute roles={[ROLES.CONSUMER]} />}>
                <Route path="consumer/dashboard" element={<ConsumerDashboard />} />
                <Route path="consumer/profile" element={<ConsumerProfilePage />} />
                <Route path="consumer/search" element={<FindGrowersPage />} />
                <Route path="consumer/orders" element={<ConsumerOrdersPage />} />
              </Route>

              <Route element={<ProtectedRoute roles={[ROLES.GROWER, ROLES.CONSUMER]} />}>
                <Route path="chat" element={<ChatPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
