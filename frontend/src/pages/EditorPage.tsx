import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { postService, Post } from '../services/postService';
import { useAuth } from '../contexts/AuthContext';

export default function EditorPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postId, setPostId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editPostId = searchParams.get('edit');

  const { isAuthenticated } = useAuth();

  // Load existing post for editing
  useEffect(() => {
    if (editPostId) {
      loadPost(editPostId);
    }
  }, [editPostId]);

  const loadPost = async (id: string) => {
    try {
      const post = await postService.getPostBySlug(id);
      setPostId(post.id);
      setTitle(post.title);
      setContent(post.content);
    } catch (err: any) {
      setError('Failed to load post');
      console.error(err);
    }
  };

  // Autosave functionality
  const savePost = useCallback(async () => {
    if (!title.trim() || !content.trim()) return;

    setIsSaving(true);
    setError('');

    try {
      if (postId) {
        // Update existing post
        await postService.updatePost(postId, { title, content });
      } else {
        // Create new post
        const newPost = await postService.createPost({ title, content });
        setPostId(newPost.id);
      }
      setLastSaved(new Date());
    } catch (err: any) {
      setError('Failed to save');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }, [title, content, postId]);

  // Autosave every 3 seconds after changes
  useEffect(() => {
    if (!title.trim() || !content.trim()) return;

    const timeoutId = setTimeout(() => {
      savePost();
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [title, content, savePost]);

  const handlePublish = async () => {
    if (!postId) {
      await savePost();
      return;
    }

    try {
      await postService.publishPost(postId);
      navigate('/');
    } catch (err: any) {
      setError('Failed to publish');
      console.error(err);
    }
  };

  const handleDiscard = () => {
    if (confirm('Discard this draft?')) {
      navigate('/drafts');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Editor Header */}
      <div className="border-b border-ink-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="flex items-center space-x-3 sm:space-x-4 order-1 sm:order-none">
              <button
                onClick={() => navigate('/drafts')}
                className="text-ink-600 dark:text-gray-400 hover:text-ink-900 dark:hover:text-white transition-colors text-sm sm:text-base"
              >
                ← Back to drafts
              </button>
              <div className="text-xs sm:text-sm text-ink-500 dark:text-gray-500">
                {isSaving && 'Saving...'}
                {!isSaving && lastSaved && `Saved ${formatTimeSince(lastSaved)}`}
                {!isSaving && !lastSaved && 'Unsaved draft'}
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 order-2 sm:order-none w-full sm:w-auto">
              <button
                onClick={handleDiscard}
                className="btn btn-ghost flex-1 sm:flex-none text-sm sm:text-base"
              >
                Discard
              </button>
              <button
                onClick={handlePublish}
                className="btn btn-primary flex-1 sm:flex-none text-sm sm:text-base"
                disabled={!title.trim() || !content.trim()}
              >
                Publish
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-2 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title..."
          className="w-full text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-ink-900 dark:text-white placeholder-ink-300 dark:placeholder-gray-600 focus:outline-none mb-6 sm:mb-8 bg-transparent leading-tight"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing... (Markdown supported)"
          className="w-full min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] text-lg sm:text-xl text-ink-800 dark:text-gray-300 placeholder-ink-300 dark:placeholder-gray-600 focus:outline-none resize-none font-serif leading-relaxed bg-transparent"
        />

        {/* Markdown tips */}
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-ink-200 dark:border-gray-700">
          <h3 className="text-xs sm:text-sm font-medium text-ink-700 dark:text-gray-300 mb-3">
            Markdown Tips
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-ink-600 dark:text-gray-400">
            <div>
              <code className="bg-ink-100 dark:bg-gray-800 px-2 py-1 rounded text-xs"># Heading 1</code>
            </div>
            <div>
              <code className="bg-ink-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">## Heading 2</code>
            </div>
            <div>
              <code className="bg-ink-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">**bold text**</code>
            </div>
            <div>
              <code className="bg-ink-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">*italic text*</code>
            </div>
            <div>
              <code className="bg-ink-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">[link](url)</code>
            </div>
            <div>
              <code className="bg-ink-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">`code`</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTimeSince(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 120) return '1 minute ago';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 7200) return '1 hour ago';
  return `${Math.floor(seconds / 3600)} hours ago`;
}
