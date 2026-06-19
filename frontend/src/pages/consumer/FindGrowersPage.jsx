import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { listingApi, profileApi, aiApi } from '../../api/services';
import { getErrorMessage } from '../../utils/constants';
import ReviewSection from '../../components/ReviewSection';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CITY_COORDINATES = {
  amritsar: [31.6340, 74.8723],
  bathinda: [30.2110, 74.9455],
  ludhiana: [30.9010, 75.8573],
};

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12);
  }, [center, map]);
  return null;
}

export default function FindGrowersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [meta, setMeta] = useState({ categories: [], categoryItems: {} });
  const [cities, setCities] = useState([]);
  const [filters, setFilters] = useState({ category: '', item: '', city: '' });
  const [results, setResults] = useState([]);
  const [selectedGrower, setSelectedGrower] = useState(null);
  const [searching, setSearching] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiSearching, setAiSearching] = useState(false);

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
      const growerListing = results.find(
        (r) => (r.growerId._id || r.growerId) === growerId
      );
      setSelectedGrower({
        ...data.data.profile,
        items: growerListing ? growerListing.items : [],
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleAiSearch = async (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setAiSearching(true);
    try {
      const { data } = await aiApi.parseSearch(aiQuery);
      const parsed = data.data;

      const newFilters = { ...filters };
      let filtersUpdated = false;

      if (parsed.category) {
        newFilters.category = parsed.category;
        filtersUpdated = true;
      }
      if (parsed.item) {
        const cat = parsed.category || filters.category;
        const availableItems = meta.categoryItems[cat] || [];
        if (availableItems.includes(parsed.item)) {
          newFilters.item = parsed.item;
          filtersUpdated = true;
        } else if (availableItems.length > 0) {
          newFilters.item = availableItems[0];
          filtersUpdated = true;
        }
      }
      if (parsed.city) {
        newFilters.city = parsed.city;
        filtersUpdated = true;
      }

      if (filtersUpdated) {
        setFilters(newFilters);
        toast.success(
          `AI Autoselected: ${[parsed.item, parsed.city]
            .filter(Boolean)
            .join(' in ')}`
        );

        // Run search directly
        setSearching(true);
        const searchRes = await listingApi.search(newFilters);
        setResults(searchRes.data.data.listings);
        if (searchRes.data.data.listings.length === 0) {
          toast('No growers found for these filters');
        }
      } else {
        toast.error('Could not extract search filters. Please try another query.');
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAiSearching(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl font-bold">Find Growers</h1>
      <p className="mt-1 text-gray-600 dark:text-slate-400 text-sm">Search by category, product, and city.</p>

      {/* AI Semantic Search Input */}
      <div className="card mt-8 bg-gradient-to-r from-primary-50/50 to-emerald-50/30 dark:from-slate-900 dark:to-slate-900/50 border border-primary-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-primary-800 dark:text-primary-400 flex items-center gap-1.5 mb-3">
          ✨ AI Smart Search
        </h3>
        <form onSubmit={handleAiSearch} className="flex gap-2">
          <input
            type="text"
            className="input-field py-2.5"
            placeholder="Type your query (e.g., 'I want potatoes in Amritsar' or 'any dairy products in Bathinda')..."
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
          />
          <button
            type="submit"
            disabled={aiSearching || !aiQuery.trim()}
            className="btn-primary py-2.5 px-6 font-bold text-xs"
          >
            {aiSearching ? 'Parsing...' : 'Search'}
          </button>
        </form>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
          Note: This will automatically parse your search query and autofill the category, product, and city filters below.
        </p>
      </div>

      <form onSubmit={handleSearch} className="card mt-6 grid gap-4 sm:grid-cols-3">
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

      {results.length > 0 && (
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Container */}
          <div className="lg:col-span-2 h-[500px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md relative z-0">
            <MapContainer
              center={CITY_COORDINATES[filters.city.toLowerCase()] || [31.1471, 75.3412]}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapController
                center={CITY_COORDINATES[filters.city.toLowerCase()] || [31.1471, 75.3412]}
              />
              {results
                .filter(
                  (r) =>
                    r.growerProfile &&
                    r.growerProfile.latitude &&
                    r.growerProfile.longitude
                )
                .map((listing) => (
                  <Marker
                    key={listing._id}
                    position={[
                      listing.growerProfile.latitude,
                      listing.growerProfile.longitude,
                    ]}
                  >
                    <Popup>
                      <div className="text-center p-1">
                        <h4 className="font-bold text-slate-800 text-sm">
                          {listing.growerProfile.name || 'Organic Grower'}
                        </h4>
                        <p className="text-xs text-primary-600 font-semibold mt-0.5">
                          {listing.category}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">
                          Items: {listing.items.slice(0, 3).join(', ')}
                          {listing.items.length > 3 ? '...' : ''}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            viewGrower(listing.growerId._id || listing.growerId)
                          }
                          className="mt-2 text-xs bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700 transition-colors font-medium"
                        >
                          View Details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>

          {/* Listings List */}
          <div className="h-[500px] overflow-y-auto pr-2 space-y-4">
            {results.map((listing) => (
              <div key={listing._id} className="card hover:shadow-lg transition-shadow duration-300">
                <p className="font-semibold text-primary-700 text-lg">
                  {listing.growerProfile?.name || 'Organic Grower'}
                </p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs font-semibold bg-primary-50 text-primary-700 px-2 py-0.5 rounded">
                    {listing.category}
                  </span>
                  <span className="text-xs text-gray-500">City: {listing.city}</span>
                </div>
                <p className="text-sm text-slate-600 mt-3 font-medium">
                  Items: <span className="text-slate-800 font-normal">{listing.items.join(', ')}</span>
                </p>
                {listing.growerProfile?.latitude && listing.growerProfile?.longitude ? (
                  <p className="text-xs text-emerald-600 flex items-center gap-1 mt-2">
                    📍 Map location available
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-2">
                    📍 No coordinates saved
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => viewGrower(listing.growerId._id || listing.growerId)}
                  className="btn-primary mt-4 w-full text-sm py-2 font-bold"
                >
                  View grower details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedGrower && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedGrower(null)}>
          <div className="card max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <img src={selectedGrower.avatarUrl || 'https://via.placeholder.com/120'} alt="" className="mx-auto h-24 w-24 rounded-full object-cover border" />
            <h2 className="mt-4 text-xl font-bold text-center text-slate-800">{selectedGrower.name}</h2>
            
            {/* Rating Badge */}
            {selectedGrower.averageRating > 0 ? (
              <div className="flex items-center justify-center gap-1.5 mt-1.5 text-sm">
                <span className="text-amber-500 font-bold">★ {selectedGrower.averageRating.toFixed(1)}</span>
                <span className="text-slate-400">({selectedGrower.totalReviews} reviews)</span>
              </div>
            ) : (
              <p className="text-center text-xs text-slate-400 mt-1">No reviews yet</p>
            )}

            <dl className="mt-4 bg-slate-50/50 p-3 rounded-lg border border-slate-100 space-y-2 text-sm">
                <div className="flex justify-between border-b border-slate-100/50 pb-1.5"><dt className="font-semibold text-slate-500">City</dt><dd className="text-slate-800 font-medium">{selectedGrower.city}</dd></div>
                <div className="flex justify-between border-b border-slate-100/50 pb-1.5"><dt className="font-semibold text-slate-500">Category</dt><dd className="text-slate-800 font-medium">{selectedGrower.category}</dd></div>
                <div className="flex justify-between border-b border-slate-100/50 pb-1.5"><dt className="font-semibold text-slate-500">Phone</dt><dd className="text-slate-800 font-medium">{selectedGrower.phone || '—'}</dd></div>
                <div className="flex justify-between pb-0.5"><dt className="font-semibold text-slate-500">Address</dt><dd className="text-slate-800 font-medium text-right max-w-[200px] truncate">{selectedGrower.address || '—'}</dd></div>
            </dl>

            {user && user.role === 'consumer' && (
              <button
                type="button"
                onClick={() =>
                  navigate('/chat', {
                    state: {
                      startChatWith: {
                        userId: selectedGrower.userId._id || selectedGrower.userId,
                        name: selectedGrower.name,
                      },
                    },
                  })
                }
                className="btn-primary mt-3 w-full bg-indigo-600 border-indigo-600 hover:bg-indigo-700 text-xs py-2.5 font-bold shadow-md shadow-indigo-100"
              >
                Message Grower 💬
              </button>
            )}

            {/* Available Products Section */}
            {selectedGrower.items && selectedGrower.items.length > 0 && (
              <div className="mt-4 border-t border-slate-100 pt-4 text-left">
                <h3 className="text-sm font-bold text-slate-800 mb-2">Available Products</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedGrower.items.map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() =>
                        addToCart(
                          selectedGrower.userId._id || selectedGrower.userId,
                          selectedGrower.name,
                          item
                        )
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-full text-xs font-semibold transition-colors focus:outline-none"
                    >
                      <span className="capitalize">{item}</span>
                      <span className="text-[10px] bg-primary-600 text-white rounded-full h-4 w-4 flex items-center justify-center font-bold">
                        +
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <ReviewSection 
              growerId={selectedGrower.userId._id || selectedGrower.userId} 
              onReviewSubmit={() => viewGrower(selectedGrower.userId._id || selectedGrower.userId)} 
            />

            <button type="button" onClick={() => setSelectedGrower(null)} className="btn-secondary mt-6 w-full py-2.5 font-semibold text-slate-700">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
