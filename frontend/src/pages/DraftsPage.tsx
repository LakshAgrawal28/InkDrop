import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postService, Post } from '../services/postService';
import ScrollReveal from '../components/ScrollReveal';

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
      setError('Failed to load drafts from server');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this draft permanently?')) return;

    try {
      await postService.deletePost(id);
      setDrafts(drafts.filter((d) => d.id !== id));
    } catch (err: any) {
      alert('Failed to delete draft');
      console.error(err);
    }
  };

  // skeleton loading lists
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-[#0b0c10] text-black dark:text-white transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-neutral-200 dark:border-neutral-800">
            <div className="h-8 w-40 bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer"></div>
            <div className="h-10 w-28 bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer"></div>
          </div>
          {/* List Skeleton */}
          <div className="space-y-6">
            {[1, 2].map((n) => (
              <div key={n} className="border border-neutral-250 dark:border-neutral-800 p-6 space-y-4">
                <div className="h-6 w-2/3 bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer"></div>
                <div className="space-y-2">
                  <div className="h-3.5 w-full bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer"></div>
                  <div className="h-3.5 w-4/5 bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer"></div>
                </div>
                <div className="h-3 w-32 bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer pt-2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0b0c10] text-black dark:text-white transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Page Title & Action bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 pb-6 border-b border-neutral-200 dark:border-neutral-800 animate-slide-in-left font-sans">
          <div>
            <span className="text-[10px] tracking-[0.2em] font-extrabold text-neutral-400 dark:text-neutral-500 uppercase block mb-1">
              WORK IN PROGRESS
            </span>
            <h1 className="text-3xl font-extrabold uppercase tracking-widest text-neutral-900 dark:text-white">
              MY DRAFTS
            </h1>
          </div>
          <Link to="/editor" className="btn btn-primary text-xs self-start sm:self-center">
            CREATE DRAFT
          </Link>
        </div>

        {error && (
          <div className="border border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400 px-4 py-3 text-xs tracking-wide font-sans mb-6">
            {error}
          </div>
        )}

        {drafts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-neutral-200 dark:border-neutral-800">
            <p className="text-neutral-500 dark:text-neutral-400 font-serif italic mb-6">
              You have no active drafts.
            </p>
            <Link to="/editor" className="btn btn-primary text-xs">
              START WRITING
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {drafts.map((draft, index) => (
              <ScrollReveal key={draft.id} direction="left" delay={index * 0.05}>
                <div className="bg-white/60 dark:bg-black/35 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800/80 p-6 hover:border-black dark:hover:border-white transition-colors duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl sm:text-2xl font-serif font-bold text-neutral-900 dark:text-white mb-2 leading-snug">
                        {draft.title || 'Untitled Draft'}
                      </h2>
                      {draft.excerpt && (
                        <p className="text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2 text-sm font-serif">
                          {draft.excerpt}
                        </p>
                      )}
                      <div className="text-[10px] tracking-wider uppercase font-bold text-neutral-400 dark:text-neutral-500 font-sans">
                        LAST EDITED · {new Date(draft.updated_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:ml-4 flex-shrink-0 font-sans">
                      <Link
                        to={`/editor?edit=${draft.slug}`}
                        className="btn btn-secondary text-xs py-1.5 px-4 flex-1 sm:flex-none text-center"
                      >
                        EDIT
                      </Link>
                      <button
                        onClick={() => handleDelete(draft.id)}
                        className="btn bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white border border-red-600/20 text-xs py-1.5 px-4 flex-1 sm:flex-none transition-colors duration-300"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
