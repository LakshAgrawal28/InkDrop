import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postService, PostWithAuthor } from '../services/postService';
import ScrollReveal from '../components/ScrollReveal';
import Typewriter from '../components/Typewriter';

export default function HomePage() {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [contentWidth, setContentWidth] = useState<'narrow' | 'standard' | 'full'>(() => {
    const saved = localStorage.getItem('inkdrop-home-width');
    return (saved as 'narrow' | 'standard' | 'full') || 'standard';
  });

  useEffect(() => {
    localStorage.setItem('inkdrop-home-width', contentWidth);
  }, [contentWidth]);

  const getWidthClass = () => {
    switch (contentWidth) {
      case 'narrow':
        return 'max-w-4xl';
      case 'full':
        return 'max-w-full lg:px-12';
      case 'standard':
      default:
        return 'max-w-6xl';
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await postService.getPublishedPosts(20, 0);
      setPosts(data);
    } catch (err: any) {
      setError('Failed to load published posts');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getReadingTime = (content: string): string => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} MIN READ`;
  };

  // Skeleton Loader for Swiss Editorial Theme
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-[#0b0c10] text-black dark:text-white transition-colors">
        <div className={`${getWidthClass()} mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 transition-all duration-300 ease-in-out`}>
          {/* Header Skeleton */}
          <div className="text-center mb-16">
            <div className="h-10 w-48 bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer mx-auto mb-4"></div>
            <div className="h-4 w-64 bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer mx-auto"></div>
          </div>

          {/* Featured Post Skeleton */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 pb-12 mb-12 border-b border-neutral-200 dark:border-neutral-800">
            <div className="lg:col-span-7 h-80 sm:h-[400px] bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer mb-6 lg:mb-0"></div>
            <div className="lg:col-span-5 flex flex-col justify-between py-2">
              <div className="space-y-4">
                <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer"></div>
                <div className="h-8 w-full bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer"></div>
                <div className="h-8 w-3/4 bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer"></div>
                <div className="space-y-2 pt-2">
                  <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer"></div>
                  <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer"></div>
                  <div className="h-3 w-2/3 bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer"></div>
                </div>
              </div>
              <div className="h-10 w-40 bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer mt-6"></div>
            </div>
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex flex-col space-y-4">
                <div className="h-48 bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer"></div>
                <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer"></div>
                <div className="h-6 w-5/6 bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer"></div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer"></div>
                  <div className="h-3 w-4/5 bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer"></div>
                </div>
                <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 skeleton-shimmer pt-2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0b0c10] text-black dark:text-white transition-colors">
      <div className={`${getWidthClass()} mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 transition-all duration-300 ease-in-out`}>
        
        {/* Editorial Brand Masthead */}
        <div className="text-center mb-16 sm:mb-20">
          <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-neutral-400 dark:text-neutral-500 block mb-3 font-sans">
            THE ARCHIVE
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans tracking-[0.15em] uppercase font-extrabold text-neutral-900 dark:text-white mb-4">
            <Typewriter text="INKDROP" speed={80} />
          </h1>
          <p className="text-sm font-serif italic text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
            A quiet space dedicated to pure expression, curated stories, and minimal design.
          </p>
          <div className="w-12 h-[1px] bg-neutral-300 dark:bg-neutral-800 mx-auto mt-6"></div>
          
          {/* Arrow Viewport Width Adjuster */}
          <div className="flex items-center justify-center space-x-2.5 mt-5">
            <button
              type="button"
              onClick={() => {
                if (contentWidth === 'full') setContentWidth('standard');
                else if (contentWidth === 'standard') setContentWidth('narrow');
              }}
              disabled={contentWidth === 'narrow'}
              className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none"
              title="Decrease Viewport Width"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <span className="text-[9px] tracking-[0.2em] font-sans font-bold text-neutral-400 dark:text-neutral-500 uppercase select-none min-w-[100px]">
              {contentWidth} WIDTH
            </span>
            
            <button
              type="button"
              onClick={() => {
                if (contentWidth === 'narrow') setContentWidth('standard');
                else if (contentWidth === 'standard') setContentWidth('full');
              }}
              disabled={contentWidth === 'full'}
              className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none"
              title="Increase Viewport Width"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {error && (
          <div className="border border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400 px-4 py-3 text-sm font-sans tracking-wide mb-12 max-w-xl mx-auto text-center">
            {error}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-neutral-200 dark:border-neutral-800">
            <p className="text-neutral-500 dark:text-neutral-400 font-serif italic mb-6">
              The archive is currently empty.
            </p>
            <Link to="/editor" className="btn btn-primary text-xs">
              CREATE FIRST POST
            </Link>
          </div>
        ) : (
          <div>
            {/* Featured Post (Editorial Presentation) */}
            {posts.length > 0 && (
              <ScrollReveal direction="up" delay={0.05}>
                <Link to={`/post/${posts[0].slug}`} className="group block mb-16 lg:mb-20">
                  <div className="lg:grid lg:grid-cols-12 lg:gap-12 pb-12 lg:pb-16 border-b border-neutral-200 dark:border-neutral-800/80 items-center">
                    
                    {/* Cover Image - Crisp Sharp Corners */}
                    <div className="lg:col-span-7 mb-6 lg:mb-0 overflow-hidden border border-neutral-200 dark:border-neutral-800">
                      {posts[0].cover_image_url ? (
                        <div className="aspect-[16/10] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                          <img
                            src={posts[0].cover_image_url}
                            alt={posts[0].title}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[16/10] bg-neutral-100 dark:bg-neutral-900/50 flex items-center justify-center">
                          <span className="text-neutral-300 dark:text-neutral-800 font-sans tracking-[0.2em] font-extrabold text-2xl uppercase">
                            NO COVER
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Meta and Content */}
                    <div className="lg:col-span-5 flex flex-col justify-between py-2">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-[10px] tracking-widest uppercase font-extrabold text-black dark:text-white px-2 py-0.5 border border-black dark:border-white">
                            FEATURED
                          </span>
                          <span className="text-[10px] tracking-widest font-semibold text-neutral-400 dark:text-neutral-500 font-sans">
                            {getReadingTime(posts[0].content)}
                          </span>
                        </div>
                        
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-semibold text-neutral-900 dark:text-white mb-4 group-hover:underline underline-offset-4 decoration-1 decoration-neutral-400 transition-all leading-tight">
                          {posts[0].title}
                        </h2>
                        
                        {posts[0].excerpt && (
                          <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed font-serif line-clamp-3 mb-6">
                            {posts[0].excerpt}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-900">
                        {posts[0].author.avatar_url && (
                          <img
                            src={posts[0].author.avatar_url}
                            alt={posts[0].author.username}
                            className="w-6 h-6 rounded-full border border-neutral-200 dark:border-neutral-800"
                          />
                        )}
                        <div className="text-[11px] tracking-wider text-neutral-500 dark:text-neutral-400 uppercase font-sans">
                          <span className="font-bold text-neutral-800 dark:text-neutral-200">
                            {posts[0].author.username}
                          </span>
                          <span className="mx-2">·</span>
                          <time>
                            {new Date(posts[0].published_at!).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </time>
                        </div>
                      </div>
                    </div>

                  </div>
                </Link>
              </ScrollReveal>
            )}

            {/* Grid of Postings */}
            {posts.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                {posts.slice(1).map((post, index) => (
                  <ScrollReveal key={post.id} direction="up" delay={index * 0.05}>
                    <Link to={`/post/${post.slug}`} className="group flex flex-col h-full justify-between">
                      <div className="flex flex-col">
                        
                        {/* Cover Card */}
                        <div className="overflow-hidden border border-neutral-200 dark:border-neutral-800 mb-5">
                          {post.cover_image_url ? (
                            <div className="aspect-[16/10] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                              <img
                                src={post.cover_image_url}
                                alt={post.title}
                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
                              />
                            </div>
                          ) : (
                            <div className="aspect-[16/10] bg-neutral-100 dark:bg-neutral-900/30 flex items-center justify-center">
                              <span className="text-neutral-300 dark:text-neutral-800 font-sans tracking-widest text-xs font-bold uppercase">
                                INKDROP
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Category/Tag */}
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className="text-[10px] tracking-widest font-bold text-neutral-400 dark:text-neutral-500 uppercase font-sans">
                            {getReadingTime(post.content)}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg sm:text-xl font-serif font-semibold text-neutral-900 dark:text-white mb-3 group-hover:underline underline-offset-4 decoration-1 decoration-neutral-400 transition-all leading-snug">
                          {post.title}
                        </h3>
                        
                        {/* Short Excerpt */}
                        {post.excerpt && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-serif line-clamp-2 mb-4">
                            {post.excerpt}
                          </p>
                        )}
                      </div>

                      {/* Footer Metadata */}
                      <div className="flex items-center gap-2.5 pt-4 mt-auto border-t border-neutral-100 dark:border-neutral-900">
                        {post.author.avatar_url && (
                          <img
                            src={post.author.avatar_url}
                            alt={post.author.username}
                            className="w-5 h-5 rounded-full border border-neutral-200 dark:border-neutral-800"
                          />
                        )}
                        <div className="text-[10px] tracking-wider text-neutral-400 dark:text-neutral-500 uppercase font-sans">
                          <span className="font-bold text-neutral-800 dark:text-neutral-200">
                            {post.author.username}
                          </span>
                          <span className="mx-1.5">·</span>
                          <time>
                            {new Date(post.published_at!).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </time>
                        </div>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
