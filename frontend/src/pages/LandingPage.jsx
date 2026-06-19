import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 bg-[radial-gradient(100%_100%_at_50%_0%,rgba(34,197,94,0.08)_0%,rgba(255,255,255,0)_100%)]" />

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-4 py-1.5 text-xs font-semibold text-primary-800 ring-1 ring-inset ring-primary-600/10 mb-6">
          <span>🌾</span> 100% Direct Farm-to-Table Platform
        </div>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl leading-[1.1]">
          Connect with local growers, <br />
          <span className="bg-gradient-to-r from-primary-600 to-emerald-700 bg-clip-text text-transparent">
            directly from the source
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 leading-relaxed">
          G2C eliminates middlemen. Farmers list fresh produce, and buyers discover growers by city, category, and product. Transparent, fair trade, local.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link to="/register" className="btn-primary px-8 py-4 text-base shadow-lg shadow-primary-600/20 hover:shadow-primary-600/30">
            Get started free
          </Link>
          <Link to="/login" className="btn-secondary px-8 py-4 text-base">
            Sign in
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-100">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">How it works</h2>
          <p className="mt-3 text-slate-500 text-sm">Three simple steps to join the local grower revolution.</p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {[
            { step: '01', title: 'Register Account', desc: 'Sign up as a Grower (Farmer) or Consumer (Buyer) in under a minute.', color: 'bg-primary-50 text-primary-700' },
            { step: '02', title: 'List or Search', desc: 'Growers list available crops; consumers filter easily by city, category, or specific item.', color: 'bg-emerald-50 text-emerald-700' },
            { step: '03', title: 'Connect Direct', desc: 'View grower details and contact info. Deal direct, pay fairly, eat fresh.', color: 'bg-teal-50 text-teal-700' },
          ].map((item) => (
            <div key={item.step} className="card group relative flex flex-col items-center text-center p-8 hover:-translate-y-1">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.color} font-extrabold text-xl mb-6 shadow-sm`}>
                {item.step}
              </div>
              <h3 className="font-bold text-lg text-slate-900 group-hover:text-primary-600 transition-colors">{item.title}</h3>
              <p className="mt-3 text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 mb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 to-emerald-900 px-6 py-20 text-center shadow-xl sm:px-12 sm:py-24">
          {/* Gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
          
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Ready to taste fresh local produce?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-100">
            Join G2C today. Support local farmers and get access to organic produce directly from your neighborhood.
          </p>
          <div className="mt-8 flex justify-center">
            <Link to="/register" className="rounded-xl bg-white px-8 py-4 font-bold text-primary-900 shadow-md transition-all duration-300 hover:bg-slate-50 hover:shadow-lg active:scale-95">
              Create your account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
