import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { postService, PostWithAuthor } from '../services/postService';
import { useAuth } from '../contexts/AuthContext';

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<PostWithAuthor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Reader Settings State
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('lg');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (slug) {
      loadPost(slug);
    }
  }, [slug]);

  const loadPost = async (slug: string) => {
    try {
      const data = await postService.getPostBySlug(slug);
      setPost(data);
    } catch (err: any) {
      setError(err.response?.status === 404 ? 'Post not found' : 'Failed to load post');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;

    if (!confirm('Delete this post? This cannot be undone.')) {
      return;
    }

    try {
      await postService.deletePost(post.id);
      navigate('/');
    } catch (err: any) {
      setDeleteError('Failed to delete post');
      console.error(err);
    }
  };

  const isAuthor = user && post && user.id === post.author_id;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors">
        <div className="flex flex-col items-center justify-center gap-3">
          <svg className="animate-spin h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loading post...</span>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors">
        <div className="text-center p-6">
          <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Post not found'}
          </h1>
          <Link to="/" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors relative">
      
      {/* Floating Reader Settings Panel */}
      <div className="fixed bottom-6 right-6 z-20 md:bottom-auto md:top-24 md:right-8 lg:right-16 xl:right-24">
        <div className="relative">
          <button
            type="button"
            className="p-3 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-center focus:outline-none"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            title="Reading Preferences"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </button>
          
          {isSettingsOpen && (
            <div className="absolute right-0 bottom-14 md:bottom-auto md:top-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-xl w-60 z-30 animate-fade-in transition-all">
              <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Reader Preferences</h4>
              
              {/* Font Family Selector */}
              <div className="mb-4">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-2 font-medium">Font Style</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFontFamily('serif')}
                    className={`px-3 py-1.5 text-xs font-serif font-bold rounded-lg border transition-all ${
                      fontFamily === 'serif'
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Classic Serif
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontFamily('sans')}
                    className={`px-3 py-1.5 text-xs font-sans font-bold rounded-lg border transition-all ${
                      fontFamily === 'sans'
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Clean Sans
                  </button>
                </div>
              </div>

              {/* Font Size Selector */}
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-2 font-medium">Text Size</span>
                <div className="flex items-center justify-between gap-1 bg-gray-50 dark:bg-gray-900 p-1 rounded-lg">
                  {(['sm', 'base', 'lg', 'xl'] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setFontSize(size)}
                      className={`px-2.5 py-1 text-xs rounded transition-all font-semibold uppercase ${
                        fontSize === size
                          ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                      }`}
                    >
                      {size === 'base' ? 'A' : size === 'sm' ? 'a' : size === 'lg' ? 'A+' : 'A++'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 animate-fade-in">
        {/* Post Header */}
        <header className="mb-10">
          {post.cover_image_url && (
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-64 sm:h-96 object-cover rounded-2xl mb-8 shadow-sm animate-scale-in"
            />
          )}
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 border-b border-gray-100 dark:border-gray-800/80 pb-6">
            <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2.5">
                {post.author.avatar_url && (
                  <img
                    src={post.author.avatar_url}
                    alt={post.author.username}
                    className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-800"
                  />
                )}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {post.author.username}
                </span>
              </div>
              
              <span className="text-gray-300 dark:text-gray-700">·</span>
              
              <time className="text-sm font-medium">
                {new Date(post.published_at!).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>

            {isAuthor && (
              <div className="flex items-center gap-2 sm:space-x-2 animate-slide-in-right">
                <Link
                  to={`/editor?edit=${post.slug}`}
                  className="btn btn-secondary text-sm flex-1 sm:flex-none text-center"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="btn btn-ghost text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex-1 sm:flex-none"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {deleteError && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
              {deleteError}
            </div>
          )}
        </header>

        {/* Post Content */}
        <div
          className={`prose dark:prose-invert max-w-none ${
            fontFamily === 'serif' ? 'font-serif' : 'font-sans'
          } ${
            fontSize === 'sm'
              ? 'prose-sm'
              : fontSize === 'base'
              ? 'prose-base'
              : fontSize === 'lg'
              ? 'prose-lg'
              : 'prose-xl'
          }`}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Author Bio */}
        {post.author.bio && (
          <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-start space-x-4">
              {post.author.avatar_url && (
                <img
                  src={post.author.avatar_url}
                  alt={post.author.username}
                  className="w-16 h-16 rounded-full border border-gray-200 dark:border-gray-800 shadow-sm"
                />
              )}
              <div>
                <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white mb-2">
                  About {post.author.username}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {post.author.bio}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-16 text-center">
          <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">
            ← Back to all posts
          </Link>
        </div>
      </article>
    </div>
  );
}
