import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { listingApi, profileApi } from '../../api/services';
import { getErrorMessage } from '../../utils/constants';

export default function FindGrowersPage() {
  const [meta, setMeta] = useState({ categories: [], categoryItems: {} });
  const [cities, setCities] = useState([]);
  const [filters, setFilters] = useState({ category: '', item: '', city: '' });
  const [results, setResults] = useState([]);
  const [selectedGrower, setSelectedGrower] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    Promise.all([listingApi.getMeta(), listingApi.getCities()])
      .then(([metaRes, citiesRes]) => {
        const cats = metaRes.data.data.categories;
        setMeta(metaRes.data.data);
        setCities(citiesRes.data.data.cities);
        setFilters({
          category: cats[0] || '',
          item: metaRes.data.data.categoryItems[cats[0]]?.[0] || '',
          city: citiesRes.data.data.cities[0] || '',
        });
      })
      .catch((err) => toast.error(getErrorMessage(err)));
  }, []);

  const items = meta.categoryItems[filters.category] || [];

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    try {
      const { data } = await listingApi.search(filters);
      setResults(data.data.listings);
      if (data.data.listings.length === 0) toast('No growers found for these filters');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSearching(false);
    }
  };

  const viewGrower = async (growerId) => {
    try {
      const { data } = await profileApi.getPublicGrower(growerId);
      setSelectedGrower(data.data.profile);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl font-bold">Find Growers</h1>
      <p className="mt-1 text-gray-600 text-sm">Search by category, product, and city.</p>

      <form onSubmit={handleSearch} className="card mt-8 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            className="input-field"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value, item: meta.categoryItems[e.target.value]?.[0] || '' })}
          >
            {meta.categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Item</label>
          <select className="input-field" value={filters.item} onChange={(e) => setFilters({ ...filters, item: e.target.value })}>
            {items.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <select className="input-field" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })}>
            {cities.length === 0 ? <option value="">No cities yet</option> : cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="sm:col-span-3">
          <button type="submit" disabled={searching} className="btn-primary w-full sm:w-auto">
            {searching ? 'Searching...' : 'Search growers'}
          </button>
        </div>
      </form>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((listing) => (
          <div key={listing._id} className="card">
            <p className="font-semibold text-primary-700">{listing.category}</p>
            <p className="text-sm text-gray-500 mt-1">City: {listing.city}</p>
            <p className="text-sm mt-2">Items: {listing.items.join(', ')}</p>
            <button
              type="button"
              onClick={() => viewGrower(listing.growerId._id || listing.growerId)}
              className="btn-primary mt-4 w-full text-sm py-2"
            >
              View grower details
            </button>
          </div>
        ))}
      </div>

      {selectedGrower && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedGrower(null)}>
          <div className="card max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <img src={selectedGrower.avatarUrl || 'https://via.placeholder.com/120'} alt="" className="mx-auto h-24 w-24 rounded-full object-cover" />
            <h2 className="mt-4 text-xl font-bold text-center">{selectedGrower.name}</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div><dt className="font-medium">City</dt><dd>{selectedGrower.city}</dd></div>
              <div><dt className="font-medium">Category</dt><dd>{selectedGrower.category}</dd></div>
              <div><dt className="font-medium">Phone</dt><dd>{selectedGrower.phone || '—'}</dd></div>
              <div><dt className="font-medium">Address</dt><dd>{selectedGrower.address || '—'}</dd></div>
            </dl>
            <button type="button" onClick={() => setSelectedGrower(null)} className="btn-secondary mt-6 w-full">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
