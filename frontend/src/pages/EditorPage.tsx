import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { postService } from '../services/postService';
import { useAuth } from '../contexts/AuthContext';

export default function EditorPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [postId, setPostId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('edit');
  const [isDragging, setIsDragging] = useState(false);

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
      if (post.cover_image_url) {
        setCoverImageUrl(post.cover_image_url);
      }
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
        await postService.updatePost(postId, { title, content, coverImageUrl });
      } else {
        // Create new post
        const newPost = await postService.createPost({ title, content, coverImageUrl });
        setPostId(newPost.id);
      }
      setLastSaved(new Date());
    } catch (err: any) {
      setError('Failed to save');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }, [title, content, postId, coverImageUrl]);

  // Autosave every 3 seconds after changes
  useEffect(() => {
    if (!title.trim() || !content.trim()) return;

    const timeoutId = setTimeout(() => {
      savePost();
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [title, content, savePost]);

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    setError('');
    try {
      const result = await postService.uploadImage(file);
      setCoverImageUrl(result.imageUrl);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload image. Make sure Cloudinary credentials are set.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  const insertMarkdownText = (prefix: string, suffix = '') => {
    const textarea = document.getElementById('editor-textarea') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    const replacement = prefix + selected + suffix;
    const newContent = text.substring(0, start) + replacement + text.substring(end);

    setContent(newContent);

    // Focus back and set selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');
    try {
      const result = await postService.uploadImage(file);
      insertMarkdownText(`![ImageDescription](${result.imageUrl})`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload inline image. Make sure Cloudinary is configured.');
      console.error(err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

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
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors flex flex-col">
      {/* Editor Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate('/drafts')}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium"
              >
                ← Back to drafts
              </button>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {isSaving && 'Saving...'}
                {!isSaving && lastSaved && `Saved ${formatTimeSince(lastSaved)}`}
                {!isSaving && !lastSaved && 'Unsaved draft'}
              </div>
            </div>

            {/* View Switcher Toolbar */}
            <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 text-xs font-semibold self-center">
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'edit'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'split'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Split View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'preview'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Live Preview
              </button>
            </div>

            <div className="flex items-center space-x-3 w-full md:w-auto">
              <button
                onClick={handleDiscard}
                className="btn btn-ghost text-sm py-1.5 px-4 flex-1 md:flex-none"
              >
                Discard
              </button>
              <button
                onClick={handlePublish}
                className="btn btn-primary text-sm py-1.5 px-4 flex-1 md:flex-none"
                disabled={!title.trim() || !content.trim()}
              >
                Publish
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-2 rounded border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Markdown Toolbar */}
      {viewMode !== 'preview' && (
        <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 sticky top-[69px] z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => insertMarkdownText('**', '**')}
              title="Bold"
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-sm w-9 h-9 flex items-center justify-center"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => insertMarkdownText('*', '*')}
              title="Italic"
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 italic text-sm w-9 h-9 flex items-center justify-center"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => insertMarkdownText('[', '](url)')}
              title="Add Link"
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium"
            >
              Link
            </button>
            <button
              type="button"
              onClick={() => insertMarkdownText('`', '`')}
              title="Code Block"
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-mono"
            >
              &lt;/&gt;
            </button>
            <button
              type="button"
              onClick={() => insertMarkdownText('\n- ', '')}
              title="Bulleted List"
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm"
            >
              • List
            </button>
            <span className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2"></span>
            <label className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer flex items-center gap-1.5 text-sm h-9">
              📷 Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleInlineImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* Editor & Preview Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={`h-full ${viewMode === 'split' ? 'grid grid-cols-2 gap-8' : 'block'}`}>
          
          {/* Editor Input Panel */}
          {(viewMode === 'edit' || viewMode === 'split') && (
            <div className="flex flex-col space-y-6 h-full">
              {/* Cover Image Upload Card */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                    : coverImageUrl
                    ? 'border-green-300 dark:border-green-800 bg-transparent'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-gray-50 dark:bg-gray-900/30'
                }`}
              >
                {isUploading ? (
                  <div className="py-8 text-gray-600 dark:text-gray-400 flex flex-col items-center justify-center gap-2">
                    <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm font-medium">Uploading image to Cloudinary...</span>
                  </div>
                ) : coverImageUrl ? (
                  <div className="relative group rounded-lg overflow-hidden max-h-72">
                    <img
                      src={coverImageUrl}
                      alt="Cover preview"
                      className="w-full h-full object-cover rounded-lg max-h-72"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <label className="btn py-1.5 px-3 text-xs bg-white text-gray-900 hover:bg-gray-100 border-none cursor-pointer rounded-md font-medium">
                        Change Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setCoverImageUrl('')}
                        className="btn py-1.5 px-3 text-xs bg-red-600 hover:bg-red-700 text-white border-none rounded-md font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="cursor-pointer">
                    <label className="cursor-pointer block py-4">
                      <div className="text-gray-400 dark:text-gray-500 mb-3 flex justify-center">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                        Upload Cover Image
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1.5">
                        Drag and drop, or click to browse (Max 5MB)
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Title Input */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post Title..."
                className="w-full text-3xl sm:text-4xl font-serif font-bold text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700 focus:outline-none bg-transparent leading-tight border-b border-gray-100 dark:border-gray-800 pb-3"
              />

              {/* Editor Textarea */}
              <textarea
                id="editor-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing... (Markdown supported)"
                className="w-full min-h-[500px] flex-1 text-lg text-gray-800 dark:text-gray-300 placeholder-gray-300 dark:placeholder-gray-700 focus:outline-none resize-none font-serif leading-relaxed bg-transparent"
              />
            </div>
          )}

          {/* Right Panel: Live Markdown Preview */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className={`prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none bg-gray-50/50 dark:bg-gray-900/30 rounded-xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin`}>
              {coverImageUrl && (
                <img
                  src={coverImageUrl}
                  alt={title || 'Cover image'}
                  className="w-full h-64 object-cover rounded-xl mb-6 shadow-sm animate-scale-in"
                />
              )}
              <h1 className="font-serif font-bold text-gray-900 dark:text-white leading-tight mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
                {title || 'Untitled Post'}
              </h1>
              {content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              ) : (
                <p className="text-gray-400 italic">Start writing in the editor to see your live preview here.</p>
              )}
            </div>
          )}
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
