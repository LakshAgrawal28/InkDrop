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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-ink-600 dark:text-gray-400">Loading post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-4xl font-serif font-bold text-ink-900 dark:text-white mb-4">
            {error || 'Post not found'}
          </h1>
          <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Post Header */}
        <header className="mb-12">
          {post.cover_image_url && (
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg mb-8"
            />
          )}
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-ink-900 dark:text-white mb-4 sm:mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center space-x-4 text-ink-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                {post.author.avatar_url && (
                  <img
                    src={post.author.avatar_url}
                    alt={post.author.username}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <span className="font-medium text-ink-900 dark:text-white">
                  {post.author.username}
                </span>
              </div>
              
              <span>·</span>
              
              <time>
                {new Date(post.published_at!).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>

            {isAuthor && (
              <div className="flex items-center gap-2 sm:space-x-2">
                <Link
                  to={`/editor?edit=${post.slug}`}
                  className="btn btn-secondary text-sm flex-1 sm:flex-none text-center"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="btn btn-ghost text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex-1 sm:flex-none"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {deleteError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {deleteError}
            </div>
          )}
        </header>

        {/* Post Content */}
        <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Author Bio */}
        {post.author.bio && (
          <div className="mt-16 pt-8 border-t border-ink-200 dark:border-gray-700">
            <div className="flex items-start space-x-4">
              {post.author.avatar_url && (
                <img
                  src={post.author.avatar_url}
                  alt={post.author.username}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h3 className="text-xl font-serif font-bold text-ink-900 dark:text-white mb-2">
                  {post.author.username}
                </h3>
                <p className="text-ink-600 dark:text-gray-400">
                  {post.author.bio}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link to="/" className="text-ink-600 dark:text-gray-400 hover:text-ink-900 dark:hover:text-white transition-colors">
            ← Back to all posts
          </Link>
        </div>
      </article>
    </div>
  );
}
