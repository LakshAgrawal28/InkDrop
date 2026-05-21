import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postService, PostWithAuthor } from '../services/postService';
import ScrollReveal from '../components/ScrollReveal';
import TiltCard from '../components/TiltCard';
import Typewriter from '../components/Typewriter';

export default function HomePage() {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await postService.getPublishedPosts(20, 0);
      setPosts(data);
    } catch (err: any) {
      setError('Failed to load posts');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getReadingTime = (content: string): string => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors">
        <div className="flex flex-col items-center justify-center gap-3">
          <svg className="animate-spin h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loading posts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Hero */}
        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            <Typewriter text="InkDrop" speed={100} />
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 animate-slide-in-right font-medium">
            A calm space for expressive writing
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-8 max-w-xl mx-auto">
            {error}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No posts yet. Be the first to write!
            </p>
          </div>
        ) : (
          <div>
            {/* Featured Post */}
            {posts.length > 0 && (
              <ScrollReveal direction="up" delay={0.05}>
                <Link to={`/post/${posts[0].slug}`} className="group block mb-12">
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50/80 to-white/80 dark:from-gray-900/60 dark:to-gray-800/40 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/60 p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 md:grid md:grid-cols-12 md:gap-8 items-center">
                    
                    {/* Card Image */}
                    {posts[0].cover_image_url ? (
                      <div className="md:col-span-6 rounded-2xl overflow-hidden h-64 md:h-80 shadow-md">
                        <img
                          src={posts[0].cover_image_url}
                          alt={posts[0].title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="md:col-span-6 rounded-2xl overflow-hidden h-64 md:h-80 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-950/30 dark:to-indigo-950/30 flex items-center justify-center shadow-inner">
                        <span className="text-indigo-400 dark:text-indigo-600 font-serif font-bold text-4xl">InkDrop</span>
                      </div>
                    )}

                    {/* Card Content */}
                    <div className="md:col-span-6 mt-6 md:mt-0 flex flex-col justify-between h-full py-2">
                      <div>
                        <div className="flex items-center gap-2.5 mb-3">
                          <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                            Featured
                          </span>
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                            {getReadingTime(posts[0].content)}
                          </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                          {posts[0].title}
                        </h2>
                        {posts[0].excerpt && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed line-clamp-3 mb-4">
                            {posts[0].excerpt}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 mt-4 md:mt-0">
                        {posts[0].author.avatar_url && (
                          <img
                            src={posts[0].author.avatar_url}
                            alt={posts[0].author.username}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div className="text-xs sm:text-sm">
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {posts[0].author.username}
                          </span>
                          <span className="mx-2 text-gray-400">·</span>
                          <time className="text-gray-500">
                            {new Date(posts[0].published_at!).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
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

            {/* Posts Grid */}
            {posts.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {posts.slice(1).map((post, index) => (
                  <ScrollReveal key={post.id} direction="up" delay={index * 0.05}>
                    <Link to={`/post/${post.slug}`} className="group block h-full">
                      <TiltCard className="bg-white/40 dark:bg-gray-800/10 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/60 rounded-2xl p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full transform-gpu cursor-pointer overflow-hidden">
                        <div className="flex flex-col">
                          {post.cover_image_url ? (
                            <div className="rounded-xl overflow-hidden h-48 w-full mb-4 shadow-sm">
                              <img
                                src={post.cover_image_url}
                                alt={post.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            </div>
                          ) : (
                            <div className="rounded-xl overflow-hidden h-48 w-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/10 dark:to-purple-950/10 flex items-center justify-center mb-4 border border-gray-100 dark:border-gray-800/50">
                              <span className="text-indigo-300 dark:text-indigo-950 font-serif font-bold text-2xl">InkDrop</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded">
                              {getReadingTime(post.content)}
                            </span>
                          </div>

                          <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                            {post.title}
                          </h3>
                          
                          {post.excerpt && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 mb-4">
                              {post.excerpt}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800/50">
                          {post.author.avatar_url && (
                            <img
                              src={post.author.avatar_url}
                              alt={post.author.username}
                              className="w-7 h-7 rounded-full"
                            />
                          )}
                          <div className="text-xs">
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                              {post.author.username}
                            </span>
                            <span className="mx-1.5 text-gray-400">·</span>
                            <time className="text-gray-500">
                              {new Date(post.published_at!).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </time>
                          </div>
                        </div>
                      </TiltCard>
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
