import { useEffect, useState } from 'react';

type FeedItem = {
  name: string;
  url: string;
  schedule: string;
};

export const Settings = () => {
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    schedule: 'daily',
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFeeds();
  }, []);

  const loadFeeds = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/feeds');
      const data = await response.json();
      setFeeds(data);
    } catch (error) {
      console.error('Error loading feeds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.url.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/internal/form/settings-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ name: '', url: '', schedule: 'daily' });
        await loadFeeds();
      }
    } catch (error) {
      console.error('Error adding feed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFeed = async (index: number) => {
    if (!confirm('Are you sure you want to delete this feed?')) return;

    try {
      const response = await fetch(`/api/feeds/${index}`, { method: 'DELETE' });
      if (response.ok) {
        await loadFeeds();
      }
    } catch (error) {
      console.error('Error deleting feed:', error);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Feed Settings</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Feed</h2>
        <form onSubmit={handleAddFeed} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Feed Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Tagesschau"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Feed URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              placeholder="https://example.com/feed.xml"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Schedule</label>
            <select
              value={formData.schedule}
              onChange={(e) =>
                setFormData({ ...formData, schedule: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {submitting ? 'Adding...' : 'Add Feed'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Active Feeds</h2>
        {loading ? (
          <p className="text-gray-500">Loading feeds...</p>
        ) : feeds.length === 0 ? (
          <p className="text-gray-500">No feeds configured yet.</p>
        ) : (
          <div className="space-y-3">
            {feeds.map((feed, index) => (
              <div
                key={index}
                className="flex justify-between items-start p-3 bg-gray-50 rounded-md"
              >
                <div>
                  <h3 className="font-medium">{feed.name}</h3>
                  <p className="text-sm text-gray-600 break-all">{feed.url}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Schedule: {feed.schedule}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteFeed(index)}
                  className="text-red-600 hover:text-red-800 font-medium text-sm ml-4 whitespace-nowrap"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
