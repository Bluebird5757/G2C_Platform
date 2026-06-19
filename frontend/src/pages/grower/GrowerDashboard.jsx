import { Link } from 'react-router-dom';

const cards = [
  {
    title: 'My Profile',
    desc: 'Update your farm details, city, and contact info.',
    to: '/grower/profile',
    icon: '👤',
  },
  {
    title: 'Add Listing',
    desc: 'List fresh produce available for consumers.',
    to: '/grower/listings/new',
    icon: '🥬',
  },
  {
    title: 'Manage Listings',
    desc: 'View and remove items from your listings.',
    to: '/grower/listings',
    icon: '📋',
  },
];

export default function GrowerDashboard() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Grower Dashboard</h1>
      <p className="mt-2 text-gray-600">Manage your profile and product listings.</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.to} to={card.to} className="card group hover:border-primary-300 hover:shadow-md transition">
            <span className="text-4xl">{card.icon}</span>
            <h2 className="mt-4 text-lg font-semibold group-hover:text-primary-700">{card.title}</h2>
            <p className="mt-2 text-sm text-gray-600">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
