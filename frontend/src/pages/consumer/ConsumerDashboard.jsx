import { Link } from 'react-router-dom';

export default function ConsumerDashboard() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Consumer Dashboard</h1>
      <p className="mt-2 text-gray-600">Find local growers and fresh produce near you.</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <Link to="/consumer/search" className="card group hover:border-primary-300 hover:shadow-md transition">
          <span className="text-4xl">🔍</span>
          <h2 className="mt-4 text-lg font-semibold group-hover:text-primary-700">Find Growers</h2>
          <p className="mt-2 text-sm text-gray-600">Search by city, category, and product.</p>
        </Link>
        <Link to="/consumer/profile" className="card group hover:border-primary-300 hover:shadow-md transition">
          <span className="text-4xl">👤</span>
          <h2 className="mt-4 text-lg font-semibold group-hover:text-primary-700">My Profile</h2>
          <p className="mt-2 text-sm text-gray-600">Update your contact and delivery details.</p>
        </Link>
      </div>
    </div>
  );
}
