import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postService, Post } from '../services/postService';

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      const data = await postService.getMyDrafts();
      setDrafts(data);
    } catch (err: any) {
      setError('Failed to load drafts');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this draft?')) return;

    try {
      await postService.deletePost(id);
      setDrafts(drafts.filter((d) => d.id !== id));
    } catch (err: any) {
      alert('Failed to delete draft');
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50 dark:bg-gray-900">
        <div className="text-ink-600 dark:text-gray-400">Loading drafts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-serif font-bold text-ink-900 dark:text-white">
            My Drafts
          </h1>
          <Link to="/editor" className="btn btn-primary">
            New Post
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {drafts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-ink-600 dark:text-gray-400 text-lg mb-4">
              No drafts yet
            </p>
            <Link to="/editor" className="btn btn-primary">
              Create your first post
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-ink-200 dark:border-gray-700 p-6 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-serif font-bold text-ink-900 dark:text-white mb-2">
                      {draft.title}
                    </h2>
                    {draft.excerpt && (
                      <p className="text-ink-600 dark:text-gray-400 mb-3">
                        {draft.excerpt}
                      </p>
                    )}
                    <div className="text-sm text-ink-500 dark:text-gray-500">
                      Last edited {new Date(draft.updated_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/editor?edit=${draft.slug}`}
                      className="btn btn-secondary"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(draft.id)}
                      className="btn btn-ghost text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
