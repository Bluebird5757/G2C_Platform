import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { profileApi } from '../../api/services';
import { getErrorMessage } from '../../utils/constants';

export default function ConsumerProfilePage() {
  const [form, setForm] = useState({ name: '', city: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
        });
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

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
    return <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" /></div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold">Consumer Profile</h1>
      <form onSubmit={handleSubmit} className="card mt-8 space-y-5">
        {['name', 'city', 'phone', 'address'].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium capitalize mb-1">{field}</label>
            <input name={field} required={field === 'name' || field === 'city'} className="input-field" value={form[field]} onChange={handleChange} />
          </div>
        ))}
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save profile'}</button>
      </form>
    </div>
  );
}
