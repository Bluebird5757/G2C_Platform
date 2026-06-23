import { useEffect, useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { profileApi } from '../../api/services';
import { getErrorMessage } from '../../utils/constants';

export default function ConsumerProfilePage() {
  const [form, setForm] = useState({
    name: '',
    city: '',
    phone: '',
    address: '',
    latitude: 0,
    longitude: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detecting, setDetecting] = useState(false);

  // Address autocomplete state
  const [addressQuery, setAddressQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [fetchingSuggestions, setFetchingSuggestions] = useState(false);
  const debounceRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    profileApi
      .getConsumerProfile()
      .then(({ data }) => {
        const p = data.data.profile;
        setForm({
          name: p.name || '',
          city: p.city || '',
          phone: p.phone || '',
          address: p.address || '',
          latitude: p.latitude || 0,
          longitude: p.longitude || 0,
        });
        setAddressQuery(p.address || '');
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Nominatim search
  const fetchSuggestions = useCallback((query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setFetchingSuggestions(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=in`
        );
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setFetchingSuggestions(false);
      }
    }, 400);
  }, []);

  const handleAddressInput = (e) => {
    const val = e.target.value;
    setAddressQuery(val);
    setForm((prev) => ({ ...prev, address: val }));
    fetchSuggestions(val);
  };

  const selectSuggestion = (suggestion) => {
    const addr = suggestion.address || {};
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.county ||
      addr.state_district ||
      '';
    setForm((prev) => ({
      ...prev,
      address: suggestion.display_name,
      city: city,
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon),
    }));
    setAddressQuery(suggestion.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
    toast.success('Address selected — city, latitude & longitude filled!');
  };

  // Auto-detect location using GPS + reverse geocode
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setForm((prev) => ({ ...prev, latitude, longitude }));
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
          );
          const data = await res.json();
          if (data && data.display_name) {
            const addr = data.address || {};
            const city =
              addr.city ||
              addr.town ||
              addr.village ||
              addr.county ||
              addr.state_district ||
              '';
            setForm((prev) => ({
              ...prev,
              address: data.display_name,
              city: city,
            }));
            setAddressQuery(data.display_name);
            toast.success('Location detected & address auto-filled!');
          } else {
            toast.success('Coordinates detected, but address lookup failed.');
          }
        } catch {
          toast.success('Coordinates detected, but reverse geocoding failed.');
        } finally {
          setDetecting(false);
        }
      },
      (error) => {
        toast.error(`Location error: ${error.message}`);
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profileApi.updateConsumerProfile(form);
      toast.success('Profile saved');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold">Consumer Profile</h1>
      <p className="mt-1 text-gray-600 dark:text-slate-400 text-sm">
        Set up your location so we can find growers near you.
      </p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            name="name"
            required
            className="input-field"
            value={form.name}
            onChange={handleChange}
            placeholder="Your full name"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            name="phone"
            className="input-field"
            value={form.phone}
            onChange={handleChange}
            placeholder="e.g. +91 98765 43210"
          />
        </div>

        {/* Address with Autocomplete */}
        <div className="relative" ref={suggestionsRef}>
          <label className="block text-sm font-medium mb-1">
            Address
            <span className="text-xs text-slate-400 ml-1 font-normal">(type to search)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              className="input-field pr-8"
              value={addressQuery}
              onChange={handleAddressInput}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Start typing your address..."
              autoComplete="off"
            />
            {fetchingSuggestions && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-300 border-t-primary-600" />
              </div>
            )}
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
              {suggestions.map((s, idx) => (
                <li
                  key={s.place_id || idx}
                  onClick={() => selectSuggestion(s)}
                  className="px-4 py-3 cursor-pointer hover:bg-primary-50 dark:hover:bg-slate-700 transition-colors text-sm border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-primary-500 mt-0.5 shrink-0">📍</span>
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-200 leading-snug">
                        {s.display_name}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {s.type?.replace(/_/g, ' ')} • {parseFloat(s.lat).toFixed(4)}, {parseFloat(s.lon).toFixed(4)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* City (auto-filled but editable) */}
        <div>
          <label className="block text-sm font-medium mb-1">
            City
            <span className="text-xs text-slate-400 ml-1 font-normal">(auto-filled from address)</span>
          </label>
          <input
            name="city"
            required
            className="input-field bg-slate-50 dark:bg-slate-800/50"
            value={form.city}
            onChange={handleChange}
          />
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Latitude</label>
            <input
              name="latitude"
              type="number"
              step="any"
              className="input-field bg-slate-50 dark:bg-slate-800/50"
              value={form.latitude}
              onChange={(e) =>
                setForm({ ...form, latitude: Number(e.target.value) || 0 })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Longitude</label>
            <input
              name="longitude"
              type="number"
              step="any"
              className="input-field bg-slate-50 dark:bg-slate-800/50"
              value={form.longitude}
              onChange={(e) =>
                setForm({ ...form, longitude: Number(e.target.value) || 0 })
              }
            />
          </div>
        </div>

        {/* Detect My Location */}
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={detecting}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          {detecting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-300 border-t-primary-600" />
              Detecting...
            </>
          ) : (
            <>🛰️ Detect My Location</>
          )}
        </button>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 -mt-2 text-center">
          Uses GPS to auto-fill your address, city, latitude & longitude.
        </p>

        {/* Submit */}
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </form>
    </div>
  );
}
