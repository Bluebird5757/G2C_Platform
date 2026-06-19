import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-emerald-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="max-w-2xl">
            <p className="mb-4 text-primary-100 font-medium">Farm to table, directly</p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Connect local growers with consumers near you
            </h1>
            <p className="mt-6 text-lg text-primary-50 leading-relaxed">
              G2C eliminates middlemen. Farmers list fresh produce; buyers discover growers by city, category, and product — fair trade, transparent, local.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/register" className="rounded-lg bg-white px-6 py-3 font-semibold text-primary-800 shadow hover:bg-primary-50">
                Get started free
              </Link>
              <Link to="/login" className="rounded-lg border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-gray-900">How it works</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {[
            { step: '1', title: 'Register', desc: 'Sign up as a Grower or Consumer in under a minute.' },
            { step: '2', title: 'List or Search', desc: 'Growers add produce; consumers filter by city and category.' },
            { step: '3', title: 'Connect', desc: 'View grower profiles and contact details — buy direct, pay fair.' },
          ].map((item) => (
            <div key={item.step} className="card text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold text-lg">
                {item.step}
              </div>
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="mt-2 text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-primary-50 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900">Ready to join?</h2>
          <p className="mt-2 text-gray-600">Whether you grow or buy — start today.</p>
          <Link to="/register" className="btn-primary mt-6 inline-flex">
            Create account
          </Link>
        </div>
      </section>
    </div>
  );
}
