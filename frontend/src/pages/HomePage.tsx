import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postService, PostWithAuthor } from '../services/postService';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-ink-600">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-serif font-bold text-ink-900 mb-4">
            InkDrop
          </h1>
          <p className="text-xl text-ink-600">
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
          <div className="text-center py-16">
            <p className="text-ink-600 text-lg">
              No posts yet. Be the first to write!
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {posts.map((post) => (
              <article
                key={post.id}
                className="border-b border-ink-200 pb-12 last:border-0"
              >
                <Link to={`/post/${post.slug}`} className="group">
                  {post.cover_image_url && (
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="w-full h-64 object-cover rounded-lg mb-6"
                    />
                  )}
                  
                  <h2 className="text-3xl font-serif font-bold text-ink-900 mb-3 group-hover:text-ink-700 transition-colors">
                    {post.title}
                  </h2>
                  
                  {post.excerpt && (
                    <p className="text-lg text-ink-600 mb-4 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}
                  
                  <div className="flex items-center text-sm text-ink-500">
                    <span className="font-medium text-ink-700">
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
