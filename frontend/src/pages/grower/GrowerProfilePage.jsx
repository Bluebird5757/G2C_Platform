import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { profileApi } from '../../api/services';
import { getErrorMessage } from '../../utils/constants';

const CATEGORIES = ['Milk Product', 'Fruits', 'Vegetables'];

export default function GrowerProfilePage() {
  const [form, setForm] = useState({
    name: '',
    city: '',
    phone: '',
    address: '',
    category: 'Vegetables',
    aadharLast4: '',
  });
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    profileApi
      .getGrowerProfile()
      .then(({ data }) => {
        const p = data.data.profile;
        setForm({
          name: p.name || '',
          city: p.city || '',
          phone: p.phone || '',
          address: p.address || '',
          category: p.category || 'Vegetables',
          aadharLast4: p.aadharLast4 || '',
        });
        setAvatarUrl(p.avatarUrl || '');
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await profileApi.updateGrowerProfile(form);
      toast.success('Profile saved');
      setAvatarUrl(data.data.profile.avatarUrl || avatarUrl);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const { data } = await profileApi.uploadGrowerAvatar(fd);
      setAvatarUrl(data.data.profile.avatarUrl);
      toast.success('Photo updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" /></div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold">Grower Profile</h1>
      <p className="mt-1 text-gray-600 text-sm">Complete your profile before listing products.</p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-5">
        <div className="flex items-center gap-4">
          <img src={avatarUrl || 'https://via.placeholder.com/80'} alt="Avatar" className="h-20 w-20 rounded-full object-cover border" />
          <label className="btn-secondary cursor-pointer">
            Upload photo
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </label>
        </div>

        {['name', 'city', 'phone', 'address'].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium capitalize mb-1">{field}</label>
            <input name={field} required={field === 'name' || field === 'city'} className="input-field" value={form[field]} onChange={handleChange} />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium mb-1">Primary category</label>
          <select name="category" className="input-field" value={form.category} onChange={handleChange}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Aadhar last 4 digits</label>
          <input name="aadharLast4" maxLength={4} pattern="\d{4}" className="input-field" value={form.aadharLast4} onChange={handleChange} />
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </form>
    </div>
  );
}
