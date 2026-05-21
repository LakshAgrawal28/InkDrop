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
  const [contentWidth, setContentWidth] = useState<'narrow' | 'wide' | 'full'>(() => {
    const saved = localStorage.getItem('inkdrop-content-width');
    return (saved as 'narrow' | 'wide' | 'full') || 'narrow';
  });

  useEffect(() => {
    localStorage.setItem('inkdrop-content-width', contentWidth);
  }, [contentWidth]);

  const getWidthClass = () => {
    switch (contentWidth) {
      case 'wide':
        return 'max-w-5xl';
      case 'full':
        return 'max-w-full lg:px-12';
      case 'narrow':
      default:
        return 'max-w-3xl';
    }
  };

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

  // skeleton Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-[#0b0c10] text-black dark:text-white transition-colors">
        <div className={`${getWidthClass()} mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 transition-all duration-300 ease-in-out`}>
          <div className="space-y-6">
            <div className="h-64 sm:h-96 w-full bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer"></div>
            <div className="h-10 w-3/4 bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer"></div>
            <div className="flex items-center space-x-4 py-4 border-y border-neutral-200 dark:border-neutral-800">
              <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer"></div>
              <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer"></div>
            </div>
            <div className="space-y-3 pt-4">
              <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer"></div>
              <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer"></div>
              <div className="h-4 w-5/6 bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer"></div>
              <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer"></div>
              <div className="h-4 w-2/3 bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-[#0b0c10] text-black dark:text-white transition-colors">
        <div className="text-center p-6 max-w-md border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-black/35 backdrop-blur-md p-8">
          <h1 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white mb-4">
            {error || 'Post not found'}
          </h1>
          <Link to="/" className="btn btn-secondary text-xs inline-block">
            ← BACK TO HOME
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0b0c10] text-black dark:text-white transition-colors relative">
      
      {/* Floating Reader Settings Panel (Minimalist design) */}
      <div className="fixed bottom-6 right-6 z-20 md:bottom-auto md:top-24 md:right-8 lg:right-16">
        <div className="relative">
          <button
            type="button"
            className="group w-14 h-14 sm:w-16 sm:h-16 bg-white/95 dark:bg-black/95 text-black dark:text-white border border-neutral-200 dark:border-neutral-800 rounded-full shadow-lg hover:shadow-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:border-black dark:hover:border-white transition-all duration-300 flex items-center justify-center focus:outline-none backdrop-blur-md"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            title="Reading Preferences"
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7 group-hover:rotate-90 transition-transform duration-500 ease-out text-neutral-600 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
            </svg>
          </button>
          
          {isSettingsOpen && (
            <div className="absolute right-0 bottom-18 md:bottom-auto md:top-18 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-5 shadow-xl w-72 z-30 transition-all font-sans">
              <h4 className="text-[10px] font-extrabold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-4">TYPOGRAPHY SETTINGS</h4>
              
              {/* Font Family Selector */}
              <div className="mb-4">
                <span className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-2 font-bold">Typeface</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFontFamily('serif')}
                    className={`py-2.5 px-3.5 text-xs sm:text-sm font-serif border transition-all ${
                      fontFamily === 'serif'
                        ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-semibold'
                        : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Lora Serif
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontFamily('sans')}
                    className={`py-2.5 px-3.5 text-xs sm:text-sm font-sans border transition-all ${
                      fontFamily === 'sans'
                        ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-semibold'
                        : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Outfit Sans
                  </button>
                </div>
              </div>

              {/* Font Size Selector */}
              <div className="mb-4">
                <span className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-2 font-bold">Text Scale</span>
                <div className="flex items-center justify-between gap-1 border border-neutral-200 dark:border-neutral-800 p-0.5">
                  {(['sm', 'base', 'lg', 'xl'] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setFontSize(size)}
                      className={`flex-1 py-2.5 text-xs sm:text-sm transition-all font-semibold uppercase ${
                        fontSize === size
                          ? 'bg-black dark:bg-white text-white dark:text-black'
                          : 'text-neutral-400 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      {size === 'sm' ? 'XS' : size === 'base' ? 'S' : size === 'lg' ? 'M' : 'L'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Page Width Selector */}
              <div>
                <span className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-2 font-bold">Page Width</span>
                <div className="grid grid-cols-3 gap-1 border border-neutral-200 dark:border-neutral-800 p-0.5">
                  {(['narrow', 'wide', 'full'] as const).map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setContentWidth(w)}
                      className={`py-2.5 text-xs transition-all font-semibold uppercase border ${
                        contentWidth === w
                          ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                          : 'border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-500 dark:text-neutral-400'
                      }`}
                    >
                      {w === 'narrow' ? 'Narrow' : w === 'wide' ? 'Wide' : 'Full'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <article className={`${getWidthClass()} mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 transition-all duration-300 ease-in-out animate-fade-in`}>
        {/* Post Header */}
        <header className="mb-10">
          {post.cover_image_url && (
            <div className="overflow-hidden border border-neutral-200 dark:border-neutral-800 mb-8 max-h-[480px]">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-full object-cover animate-scale-in"
              />
            </div>
          )}
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-neutral-900 dark:text-white mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b border-neutral-200 dark:border-neutral-800 pb-6 font-sans">
            <div className="flex items-center space-x-3 text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider flex-wrap gap-y-2">
              <div className="flex items-center space-x-2">
                {post.author.avatar_url && (
                  <img
                    src={post.author.avatar_url}
                    alt={post.author.username}
                    className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-800"
                  />
                )}
                <span className="font-bold text-neutral-900 dark:text-white">
                  {post.author.username}
                </span>
              </div>
              
              <span className="text-neutral-300 dark:text-neutral-800">|</span>
              
              <time className="font-medium">
                {new Date(post.published_at!).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>

              <span className="text-neutral-300 dark:text-neutral-800">|</span>

              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] tracking-widest text-neutral-450 dark:text-neutral-500 uppercase font-sans font-bold mr-1.5">
                  WIDTH:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (contentWidth === 'full') setContentWidth('wide');
                    else if (contentWidth === 'wide') setContentWidth('narrow');
                  }}
                  disabled={contentWidth === 'narrow'}
                  className="p-2 text-neutral-400 hover:text-black dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-neutral-900/50 transition-all duration-200 focus:outline-none"
                  title="Decrease Page Width"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <span className="text-[10px] tracking-wider font-sans font-bold text-neutral-800 dark:text-neutral-200 uppercase select-none min-w-[60px] text-center">
                  {contentWidth}
                </span>
                
                <button
                  type="button"
                  onClick={() => {
                    if (contentWidth === 'narrow') setContentWidth('wide');
                    else if (contentWidth === 'wide') setContentWidth('full');
                  }}
                  disabled={contentWidth === 'full'}
                  className="p-2 text-neutral-400 hover:text-black dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-neutral-900/50 transition-all duration-200 focus:outline-none"
                  title="Increase Page Width"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {isAuthor && (
              <div className="flex items-center gap-2">
                <Link
                  to={`/editor?edit=${post.slug}`}
                  className="btn btn-secondary text-xs py-2.5 px-5 flex-1 sm:flex-none text-center tracking-wider font-semibold"
                >
                  EDIT POST
                </Link>
                <button
                  onClick={handleDelete}
                  className="btn bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white border border-red-600/20 hover:border-red-600 text-xs py-2.5 px-5 flex-1 sm:flex-none transition-colors duration-300 tracking-wider font-semibold"
                >
                  DELETE
                </button>
              </div>
            )}
          </div>

          {deleteError && (
            <div className="border border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400 px-4 py-3 text-xs tracking-wider font-sans mb-4">
              {deleteError}
            </div>
          )}
        </header>

        {/* Post Content */}
        <div
          className={`prose dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200 leading-relaxed ${
            fontFamily === 'serif' ? 'font-serif' : 'font-sans'
          } ${
            fontSize === 'sm'
              ? 'text-sm sm:text-base prose-sm'
              : fontSize === 'base'
              ? 'text-base sm:text-lg prose-base'
              : fontSize === 'lg'
              ? 'text-lg sm:text-xl prose-lg'
              : 'text-xl sm:text-2xl prose-xl'
          }`}
        >
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ node, ...props }) => <h2 className="font-sans font-bold tracking-tight text-neutral-900 dark:text-white mt-10 mb-4" {...props} />,
              h3: ({ node, ...props }) => <h3 className="font-sans font-semibold tracking-tight text-neutral-900 dark:text-white mt-8 mb-3" {...props} />,
              p: ({ node, ...props }) => <p className="mb-6" {...props} />,
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-2 border-black dark:border-white pl-4 italic my-6 text-neutral-600 dark:text-neutral-400 bg-neutral-100/50 dark:bg-neutral-900/30 py-1 pr-2" {...props} />
              ),
              pre: ({ node, ...props }) => (
                <pre className="bg-neutral-900 text-neutral-100 p-4 overflow-x-auto border border-neutral-800 font-mono text-[0.875em] leading-normal my-6" {...props} />
              ),
              code: ({ node, inline, ...props }: any) => (
                inline 
                  ? <code className="bg-neutral-100 dark:bg-neutral-900 text-neutral-950 dark:text-neutral-50 px-1.5 py-0.5 font-mono text-[0.875em]" {...props} />
                  : <code className="font-mono text-[0.875em] block" {...props} />
              ),
              a: ({ node, ...props }) => (
                <a className="text-black dark:text-white underline underline-offset-4 decoration-1 hover:decoration-2 font-medium" {...props} />
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Author Bio Section */}
        {post.author.bio && (
          <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800 font-sans">
            <div className="flex items-start space-x-4">
              {post.author.avatar_url && (
                <img
                  src={post.author.avatar_url}
                  alt={post.author.username}
                  className="w-12 h-12 rounded-full border border-neutral-200 dark:border-neutral-800"
                />
              )}
              <div>
                <h3 className="text-xs uppercase tracking-widest font-extrabold text-neutral-900 dark:text-white mb-2">
                  ABOUT {post.author.username.toUpperCase()}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-serif italic">
                  {post.author.bio}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Back to Archive */}
        <div className="mt-16 text-center pt-8 border-t border-neutral-100 dark:border-neutral-900 font-sans">
          <Link to="/" className="text-xs tracking-widest font-semibold uppercase text-neutral-400 hover:text-black dark:hover:text-white transition-colors duration-200">
            ← BACK TO ARCHIVE
          </Link>
        </div>
      </article>
    </div>
  );
}
