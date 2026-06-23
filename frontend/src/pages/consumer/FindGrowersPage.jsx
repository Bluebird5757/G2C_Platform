import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
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

// Blue marker icon for the consumer's location
const consumerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Green marker icon for growers
const growerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DEFAULT_CENTER = [30.9010, 75.8573]; // Ludhiana fallback

// Radius options in km
const RADIUS_OPTIONS = [
  { label: '2 km', value: 2 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '15 km', value: 15 },
  { label: '30 km', value: 30 },
  { label: '50 km', value: 50 },
  { label: 'All', value: Infinity },
];

// Haversine formula — returns distance in km
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function FindGrowersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [meta, setMeta] = useState({ categories: [], categoryItems: {} });
  const [filters, setFilters] = useState({ category: '', item: '' });
  const [results, setResults] = useState([]);
  const [selectedGrower, setSelectedGrower] = useState(null);
  const [searching, setSearching] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiSearching, setAiSearching] = useState(false);

  // Consumer location state
  const [consumerCoords, setConsumerCoords] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);

  // Radius state
  const [selectedRadius, setSelectedRadius] = useState(15); // default 15km
  const [showRadiusPanel, setShowRadiusPanel] = useState(false);

  // Load meta data on mount
  useEffect(() => {
    listingApi
      .getMeta()
      .then((metaRes) => {
        const cats = metaRes.data.data.categories;
        setMeta(metaRes.data.data);
        setFilters({
          category: cats[0] || '',
          item: metaRes.data.data.categoryItems[cats[0]]?.[0] || '',
        });
      })
      .catch((err) => toast.error(getErrorMessage(err)));
  }, []);

  // Load consumer location: try GPS first, fall back to profile coords
  useEffect(() => {
    const loadLocation = async () => {
      // Try browser geolocation first
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setConsumerCoords([pos.coords.latitude, pos.coords.longitude]);
            setLocationLoading(false);
          },
          async () => {
            // GPS denied/failed — try profile coordinates
            await fallbackToProfile();
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      } else {
        await fallbackToProfile();
      }
    };

    const fallbackToProfile = async () => {
      try {
        const { data } = await profileApi.getConsumerProfile();
        const p = data.data.profile;
        if (p.latitude && p.longitude && (p.latitude !== 0 || p.longitude !== 0)) {
          setConsumerCoords([p.latitude, p.longitude]);
        } else {
          setConsumerCoords(DEFAULT_CENTER);
        }
      } catch {
        setConsumerCoords(DEFAULT_CENTER);
      } finally {
        setLocationLoading(false);
      }
    };

    loadLocation();
  }, []);

  const items = meta.categoryItems[filters.category] || [];

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    try {
      // Don't send city — we do proximity filtering client-side
      const { data } = await listingApi.search({ ...filters, city: '' });
      setResults(data.data.listings);
      if (data.data.listings.length === 0) {
        toast('No growers found for these filters');
      } else {
        setShowRadiusPanel(true);
      }
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

      if (filtersUpdated) {
        setFilters(newFilters);
        toast.success(
          `AI detected: ${[parsed.category, parsed.item].filter(Boolean).join(' → ')}`
        );

        // Run search without city
        setSearching(true);
        const searchRes = await listingApi.search({ ...newFilters, city: '' });
        setResults(searchRes.data.data.listings);
        if (searchRes.data.data.listings.length === 0) {
          toast('No growers found for these filters');
        } else {
          setShowRadiusPanel(true);
        }
      } else {
        toast.error('Could not extract search filters. Please try another query.');
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAiSearching(false);
      setSearching(false);
    }
  };

  // Compute distances and filter by radius
  const filteredResults = useMemo(() => {
    if (!consumerCoords || results.length === 0) return [];

    const withDistance = results
      .map((listing) => {
        const gp = listing.growerProfile;
        if (!gp || (!gp.latitude && !gp.longitude)) {
          return { ...listing, distance: null };
        }
        const dist = haversineDistance(
          consumerCoords[0],
          consumerCoords[1],
          gp.latitude,
          gp.longitude
        );
        return { ...listing, distance: dist };
      })
      .filter((listing) => {
        if (selectedRadius === Infinity) return true;
        if (listing.distance === null) return false;
        return listing.distance <= selectedRadius;
      })
      .sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });

    return withDistance;
  }, [results, consumerCoords, selectedRadius]);

  // Compute optimal map zoom from selected radius
  const mapZoom = useMemo(() => {
    if (selectedRadius === Infinity) return 8;
    if (selectedRadius <= 2) return 15;
    if (selectedRadius <= 5) return 14;
    if (selectedRadius <= 10) return 13;
    if (selectedRadius <= 15) return 12;
    if (selectedRadius <= 30) return 11;
    return 10;
  }, [selectedRadius]);

  const mapCenter = consumerCoords || DEFAULT_CENTER;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl font-bold">Find Growers</h1>
      <p className="mt-1 text-gray-600 dark:text-slate-400 text-sm">
        Search by category & item, then filter by proximity radius.
      </p>

      {/* Location status badge */}
      <div className="mt-3">
        {locationLoading ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-primary-500" />
            Detecting your location...
          </span>
        ) : consumerCoords && consumerCoords !== DEFAULT_CENTER ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full font-medium">
            📍 Your location: {consumerCoords[0].toFixed(4)}, {consumerCoords[1].toFixed(4)}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 rounded-full font-medium">
            ⚠️ Using default location. Update your profile for accurate results.
          </span>
        )}
      </div>

      {/* AI Semantic Search Input */}
      <div className="card mt-6 bg-gradient-to-r from-primary-50/50 to-emerald-50/30 dark:from-slate-900 dark:to-slate-900/50 border border-primary-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-primary-800 dark:text-primary-400 flex items-center gap-1.5 mb-3">
          ✨ AI Smart Search
        </h3>
        <form onSubmit={handleAiSearch} className="flex gap-2">
          <input
            type="text"
            className="input-field py-2.5"
            placeholder="e.g. 'I want tomatoes' or 'any dairy products'..."
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
          Automatically selects category & item from your natural language query.
        </p>
      </div>

      {/* Category + Item Filters */}
      <form onSubmit={handleSearch} className="card mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            className="input-field"
            value={filters.category}
            onChange={(e) =>
              setFilters({
                ...filters,
                category: e.target.value,
                item: meta.categoryItems[e.target.value]?.[0] || '',
              })
            }
          >
            {meta.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Item</label>
          <select
            className="input-field"
            value={filters.item}
            onChange={(e) => setFilters({ ...filters, item: e.target.value })}
          >
            {items.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <button type="submit" disabled={searching} className="btn-primary w-full sm:w-auto">
            {searching ? 'Searching...' : 'Find Growers'}
          </button>
        </div>
      </form>

      {/* Radius Slider — shown after search returns results */}
      {showRadiusPanel && results.length > 0 && (
        <div className="card mt-6 bg-gradient-to-r from-indigo-50/40 to-violet-50/30 dark:from-slate-900 dark:to-slate-900/50 border border-indigo-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-indigo-800 dark:text-indigo-400 flex items-center gap-1.5 mb-4">
            🎯 Proximity Radius
          </h3>
          <div className="flex flex-wrap gap-2">
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedRadius(opt.value)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  selectedRadius === opt.value
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 scale-105'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium">
            Showing <strong className="text-indigo-600 dark:text-indigo-400">{filteredResults.length}</strong> grower{filteredResults.length !== 1 ? 's' : ''} within{' '}
            <strong className="text-indigo-600 dark:text-indigo-400">
              {selectedRadius === Infinity ? 'any distance' : `${selectedRadius} km`}
            </strong>
          </p>
        </div>
      )}

      {/* Map + Results Cards */}
      {showRadiusPanel && results.length > 0 && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Container */}
          <div className="lg:col-span-2 h-[500px] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md relative z-0">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapController center={mapCenter} zoom={mapZoom} />

              {/* Consumer "You are here" marker */}
              {consumerCoords && (
                <>
                  <Marker position={consumerCoords} icon={consumerIcon}>
                    <Popup>
                      <div className="text-center p-1">
                        <h4 className="font-bold text-blue-700 text-sm">📍 Your Location</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {consumerCoords[0].toFixed(4)}, {consumerCoords[1].toFixed(4)}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                  {selectedRadius !== Infinity && (
                    <Circle
                      center={consumerCoords}
                      radius={selectedRadius * 1000}
                      pathOptions={{
                        color: '#6366f1',
                        fillColor: '#6366f1',
                        fillOpacity: 0.06,
                        weight: 2,
                        dashArray: '6 4',
                      }}
                    />
                  )}
                </>
              )}

              {/* Grower markers — only show filtered results */}
              {filteredResults
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
                    icon={growerIcon}
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
                        {listing.distance !== null && (
                          <p className="text-[11px] text-indigo-600 font-bold mt-1">
                            📍 {listing.distance.toFixed(1)} km away
                          </p>
                        )}
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
            {filteredResults.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  No growers found within{' '}
                  {selectedRadius === Infinity ? 'any range' : `${selectedRadius} km`}.
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Try increasing the radius or changing filters.
                </p>
              </div>
            ) : (
              filteredResults.map((listing) => (
                <div
                  key={listing._id}
                  className="card hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-start justify-between">
                    <p className="font-semibold text-primary-700 dark:text-primary-400 text-lg">
                      {listing.growerProfile?.name || 'Organic Grower'}
                    </p>
                    {listing.distance !== null && (
                      <span className="shrink-0 ml-2 text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full">
                        {listing.distance.toFixed(1)} km
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs font-semibold bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded">
                      {listing.category}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {listing.growerProfile?.city || listing.city}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 font-medium">
                    Items:{' '}
                    <span className="text-slate-800 dark:text-slate-200 font-normal">
                      {listing.items.join(', ')}
                    </span>
                  </p>
                  {listing.distance !== null ? (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-2 font-medium">
                      📍 {listing.distance.toFixed(1)} km from you
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-2">
                      📍 No coordinates — distance unknown
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      viewGrower(listing.growerId._id || listing.growerId)
                    }
                    className="btn-primary mt-4 w-full text-sm py-2 font-bold"
                  >
                    View grower details
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Grower Detail Modal */}
      {selectedGrower && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedGrower(null)}
        >
          <div
            className="card max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedGrower.avatarUrl || 'https://via.placeholder.com/120'}
              alt=""
              className="mx-auto h-24 w-24 rounded-full object-cover border"
            />
            <h2 className="mt-4 text-xl font-bold text-center text-slate-800 dark:text-slate-100">
              {selectedGrower.name}
            </h2>

            {/* Rating Badge */}
            {selectedGrower.averageRating > 0 ? (
              <div className="flex items-center justify-center gap-1.5 mt-1.5 text-sm">
                <span className="text-amber-500 font-bold">
                  ★ {selectedGrower.averageRating.toFixed(1)}
                </span>
                <span className="text-slate-400">
                  ({selectedGrower.totalReviews} reviews)
                </span>
              </div>
            ) : (
              <p className="text-center text-xs text-slate-400 mt-1">
                No reviews yet
              </p>
            )}

            <dl className="mt-4 bg-slate-50/50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 space-y-2 text-sm">
              <div className="flex justify-between border-b border-slate-100/50 dark:border-slate-700/50 pb-1.5">
                <dt className="font-semibold text-slate-500">City</dt>
                <dd className="text-slate-800 dark:text-slate-200 font-medium">
                  {selectedGrower.city}
                </dd>
              </div>
              <div className="flex justify-between border-b border-slate-100/50 dark:border-slate-700/50 pb-1.5">
                <dt className="font-semibold text-slate-500">Category</dt>
                <dd className="text-slate-800 dark:text-slate-200 font-medium">
                  {selectedGrower.category}
                </dd>
              </div>
              <div className="flex justify-between border-b border-slate-100/50 dark:border-slate-700/50 pb-1.5">
                <dt className="font-semibold text-slate-500">Phone</dt>
                <dd className="text-slate-800 dark:text-slate-200 font-medium">
                  {selectedGrower.phone || '—'}
                </dd>
              </div>
              <div className="flex justify-between pb-0.5">
                <dt className="font-semibold text-slate-500">Address</dt>
                <dd className="text-slate-800 dark:text-slate-200 font-medium text-right max-w-[200px] truncate">
                  {selectedGrower.address || '—'}
                </dd>
              </div>
            </dl>

            {user && user.role === 'consumer' && (
              <button
                type="button"
                onClick={() =>
                  navigate('/chat', {
                    state: {
                      startChatWith: {
                        userId:
                          selectedGrower.userId._id || selectedGrower.userId,
                        name: selectedGrower.name,
                      },
                    },
                  })
                }
                className="btn-primary mt-3 w-full bg-indigo-600 border-indigo-600 hover:bg-indigo-700 text-xs py-2.5 font-bold shadow-md shadow-indigo-100 dark:shadow-none"
              >
                Message Grower 💬
              </button>
            )}

            {/* Available Products Section */}
            {selectedGrower.items && selectedGrower.items.length > 0 && (
              <div className="mt-4 border-t border-slate-100 dark:border-slate-700 pt-4 text-left">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Available Products
                </h3>
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
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800/40 rounded-full text-xs font-semibold transition-colors focus:outline-none"
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
              growerId={
                selectedGrower.userId._id || selectedGrower.userId
              }
              onReviewSubmit={() =>
                viewGrower(
                  selectedGrower.userId._id || selectedGrower.userId
                )
              }
            />

            <button
              type="button"
              onClick={() => setSelectedGrower(null)}
              className="btn-secondary mt-6 w-full py-2.5 font-semibold text-slate-700 dark:text-slate-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
