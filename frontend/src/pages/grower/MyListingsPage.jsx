import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { listingApi } from '../../api/services';
import { getErrorMessage } from '../../utils/constants';

export default function MyListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    listingApi
      .getMine()
      .then(({ data }) => setListings(data.data.listings))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entire listing?')) return;
    try {
      await listingApi.delete(id);
      toast.success('Listing deleted');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleRemoveItem = async (id, item) => {
    try {
      await listingApi.removeItem(id, item);
      toast.success(`Removed ${item}`);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" /></div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-bold">My Listings</h1>

      {listings.length === 0 ? (
        <p className="mt-8 text-gray-500">No listings yet. Add your first listing from the dashboard.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {listings.map((listing) => (
            <div key={listing._id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-primary-700">{listing.category}</p>
                  <p className="text-sm text-gray-500">City: {listing.city}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {listing.items.map((item) => (
                      <span key={item} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm">
                        {item}
                        <button type="button" onClick={() => handleRemoveItem(listing._id, item)} className="text-red-500 hover:text-red-700 ml-1">×</button>
                      </span>
                    ))}
                  </div>
                </div>
                <button onClick={() => handleDelete(listing._id)} className="text-sm text-red-600 hover:underline">
                  Delete listing
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
