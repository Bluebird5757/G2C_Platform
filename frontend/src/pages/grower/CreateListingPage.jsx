import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { listingApi } from '../../api/services';
import { getErrorMessage } from '../../utils/constants';

export default function CreateListingPage() {
  const [meta, setMeta] = useState({ categories: [], categoryItems: {} });
  const [category, setCategory] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    listingApi
      .getMeta()
      .then(({ data }) => {
        setMeta(data.data);
        setCategory(data.data.categories[0] || '');
      })
      .catch((err) => toast.error(getErrorMessage(err)));
  }, []);

  const items = meta.categoryItems[category] || [];

  const toggleItem = (item) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      toast.error('Select at least one item');
      return;
    }
    setSubmitting(true);
    try {
      await listingApi.create({ category, items: selectedItems });
      toast.success('Listing created!');
      navigate('/grower/listings');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold">Add Product Listing</h1>
      <p className="mt-1 text-sm text-gray-600">City is taken from your profile automatically.</p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select className="input-field" value={category} onChange={(e) => { setCategory(e.target.value); setSelectedItems([]); }}>
            {meta.categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Select items</label>
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleItem(item)}
                className={`rounded-full px-4 py-2 text-sm border transition ${
                  selectedItems.includes(item)
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Creating...' : 'Create listing'}
        </button>
      </form>
    </div>
  );
}
