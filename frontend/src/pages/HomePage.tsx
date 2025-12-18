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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-ink-600 dark:text-gray-400">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Hero */}
        <div className="text-center mb-10 sm:mb-16 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-ink-900 dark:text-white mb-3 sm:mb-4">
            <Typewriter text="InkDrop" speed={100} />
          </h1>
          <p className="text-lg sm:text-xl text-ink-600 dark:text-gray-400 animate-slide-in-right">
            A calm space for expressive writing
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Posts List */}
        {posts.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <p className="text-ink-600 dark:text-gray-400 text-base sm:text-lg">
              No posts yet. Be the first to write!
            </p>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-12">
            {posts.map((post, index) => (
              <ScrollReveal key={post.id} direction="up" delay={index * 0.1}>
                <TiltCard className="transform-gpu">
                  <article className="border-b border-ink-200 dark:border-gray-700 pb-8 sm:pb-12 last:border-0">
                    <Link to={`/post/${post.slug}`} className="group block">
                      {post.cover_image_url && (
                        <img
                          src={post.cover_image_url}
                          alt={post.title}
                          className="w-full h-48 sm:h-64 object-cover rounded-lg mb-4 sm:mb-6 transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      )}
                  
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ink-900 dark:text-white mb-2 sm:mb-3 group-hover:text-ink-700 dark:group-hover:text-gray-300 transition-colors leading-tight">
                    {post.title}
                  </h2>
                  
                  {post.excerpt && (
                    <p className="text-base sm:text-lg text-ink-600 dark:text-gray-400 mb-3 sm:mb-4 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  
                  <div className="flex items-center text-xs sm:text-sm text-ink-500 dark:text-gray-500 flex-wrap gap-1">
                    <span className="font-medium text-ink-700 dark:text-gray-300">
                      {post.author.username}
                    </span>
                    <span className="mx-2">·</span>
                    <time>
                      {new Date(post.published_at!).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </div>
                </Link>
              </article>
            </TiltCard>
          </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
