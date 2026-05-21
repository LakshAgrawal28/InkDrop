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
  const [contentWidth, setContentWidth] = useState<'narrow' | 'standard' | 'full'>(() => {
    const saved = localStorage.getItem('inkdrop-editor-width');
    return (saved as 'narrow' | 'standard' | 'full') || 'standard';
  });

  useEffect(() => {
    localStorage.setItem('inkdrop-editor-width', contentWidth);
  }, [contentWidth]);

  const splitRatios = ['30/70', '40/60', '50/50', '60/40', '70/30'] as const;
  type SplitRatioType = typeof splitRatios[number];

  const [splitRatio, setSplitRatio] = useState<SplitRatioType>(() => {
    const saved = localStorage.getItem('inkdrop-editor-split-ratio');
    return (saved as SplitRatioType) || '50/50';
  });

  useEffect(() => {
    localStorage.setItem('inkdrop-editor-split-ratio', splitRatio);
  }, [splitRatio]);

  const getGridTemplateColumns = () => {
    switch (splitRatio) {
      case '30/70':
        return '3fr 7fr';
      case '40/60':
        return '4fr 6fr';
      case '60/40':
        return '6fr 4fr';
      case '70/30':
        return '7fr 3fr';
      case '50/50':
      default:
        return '1fr 1fr';
    }
  };

  const getWidthClass = () => {
    switch (contentWidth) {
      case 'narrow':
        return 'max-w-3xl';
      case 'full':
        return 'max-w-full lg:px-12';
      case 'standard':
      default:
        return 'max-w-7xl';
    }
  };

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
      setError('Autosave failed');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }, [title, content, postId, coverImageUrl]);

  // Autosave every 4 seconds after changes
  useEffect(() => {
    if (!title.trim() || !content.trim()) return;

    const timeoutId = setTimeout(() => {
      savePost();
    }, 4000);

    return () => clearTimeout(timeoutId);
  }, [title, content, savePost]);

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    setError('');
    try {
      const result = await postService.uploadImage(file);
      setCoverImageUrl(result.imageUrl);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload cover image.');
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
      setError(err.response?.data?.error || 'Failed to upload inline image.');
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
      setError('Failed to publish post');
      console.error(err);
    }
  };

  const handleDiscard = () => {
    if (confirm('Discard changes and return to drafts?')) {
      navigate('/drafts');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0b0c10] text-black dark:text-white transition-colors flex flex-col font-sans">
      {/* Editor Header Navigation */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-[#0b0c10]/95 backdrop-blur-sm sticky top-0 z-20">
        <div className={`${getWidthClass()} mx-auto px-4 sm:px-6 lg:px-8 py-4 transition-all duration-300 ease-in-out`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            {/* Status Panel */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/drafts')}
                className="text-xs uppercase tracking-widest font-bold text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
              >
                ← DRAFTS
              </button>
              <span className="text-neutral-300 dark:text-neutral-800">|</span>
              <div className="text-[10px] tracking-wider uppercase font-bold text-neutral-500">
                {isSaving ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-600 rounded-full animate-ping"></span>
                    SAVING DRAFT...
                  </span>
                ) : lastSaved ? (
                  `SAVED ${formatTimeSince(lastSaved)}`
                ) : (
                  'UNSAVED DRAFT'
                )}
              </div>
            </div>

            {/* View Mode Splitter & Canvas width Segment */}
            <div className="flex items-center gap-3 self-start md:self-center flex-wrap">
              <div className="flex border border-neutral-200 dark:border-neutral-800 p-0.5">
                {(['edit', 'split', 'preview'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 text-[11px] tracking-widest uppercase font-bold transition-all ${
                      viewMode === mode
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'text-neutral-500 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {mode === 'edit' ? 'WRITE' : mode === 'split' ? 'SPLIT' : 'PREVIEW'}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-1 border border-neutral-200 dark:border-neutral-800 p-0.5">
                <span className="text-[11px] tracking-widest text-neutral-450 dark:text-neutral-500 uppercase font-sans font-bold px-2.5">
                  CANVAS:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (contentWidth === 'full') setContentWidth('standard');
                    else if (contentWidth === 'standard') setContentWidth('narrow');
                  }}
                  disabled={contentWidth === 'narrow'}
                  className="p-2 text-neutral-400 hover:text-black dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none"
                  title="Decrease Canvas Width"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <span className="text-[10px] tracking-wider font-sans font-bold text-neutral-800 dark:text-neutral-200 uppercase select-none min-w-[72px] text-center">
                  {contentWidth}
                </span>
                
                <button
                  type="button"
                  onClick={() => {
                    if (contentWidth === 'narrow') setContentWidth('standard');
                    else if (contentWidth === 'standard') setContentWidth('full');
                  }}
                  disabled={contentWidth === 'full'}
                  className="p-2 text-neutral-400 hover:text-black dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none"
                  title="Increase Canvas Width"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {viewMode === 'split' && (
                <div className="flex items-center space-x-1 border border-neutral-200 dark:border-neutral-800 p-0.5">
                  <span className="text-[11px] tracking-widest text-neutral-450 dark:text-neutral-500 uppercase font-sans font-bold px-2.5">
                    SPLIT:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const currentIndex = splitRatios.indexOf(splitRatio);
                      if (currentIndex > 0) {
                        setSplitRatio(splitRatios[currentIndex - 1]);
                      }
                    }}
                    disabled={splitRatio === '30/70'}
                    className="p-2 text-neutral-400 hover:text-black dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none"
                    title="Shrink Editor (Shift Divider Left)"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <span className="text-[10px] tracking-wider font-sans font-bold text-neutral-800 dark:text-neutral-200 uppercase select-none min-w-[60px] text-center">
                    {splitRatio}
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const currentIndex = splitRatios.indexOf(splitRatio);
                      if (currentIndex < splitRatios.length - 1) {
                        setSplitRatio(splitRatios[currentIndex + 1]);
                      }
                    }}
                    disabled={splitRatio === '70/30'}
                    className="p-2 text-neutral-400 hover:text-black dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none"
                    title="Expand Editor (Shift Divider Right)"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Publish & Discard Actions */}
            <div className="flex items-center space-x-2.5">
              <button
                onClick={handleDiscard}
                className="btn btn-secondary text-xs py-2.5 px-5.5 font-semibold tracking-wider"
              >
                DISCARD
              </button>
              <button
                onClick={handlePublish}
                className="btn btn-primary text-xs py-2.5 px-5.5 font-semibold tracking-wider"
                disabled={!title.trim() || !content.trim()}
              >
                PUBLISH POST
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-3 border border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400 px-4 py-2.5 text-xs font-sans tracking-wide">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Editor Markdown Utility Toolbar */}
      {viewMode !== 'preview' && (
        <div className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/30 sticky top-[73px] z-10">
          <div className={`${getWidthClass()} mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap items-center gap-1 transition-all duration-300 ease-in-out`}>
            <button
              type="button"
              onClick={() => insertMarkdownText('**', '**')}
              title="Bold text"
              className="px-2 py-1 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold"
            >
              BOLD
            </button>
            <button
              type="button"
              onClick={() => insertMarkdownText('*', '*')}
              title="Italic text"
              className="px-2 py-1 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 italic"
            >
              ITALIC
            </button>
            <button
              type="button"
              onClick={() => insertMarkdownText('[', '](url)')}
              title="Link"
              className="px-2 py-1 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            >
              LINK
            </button>
            <button
              type="button"
              onClick={() => insertMarkdownText('`', '`')}
              title="Code block"
              className="px-2 py-1 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono"
            >
              CODE
            </button>
            <button
              type="button"
              onClick={() => insertMarkdownText('\n- ', '')}
              title="List item"
              className="px-2 py-1 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            >
              LIST
            </button>
            <button
              type="button"
              onClick={() => insertMarkdownText('\n> ', '')}
              title="Quote block"
              className="px-2 py-1 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 italic"
            >
              QUOTE
            </button>
            <span className="w-px h-4 bg-neutral-300 dark:bg-neutral-800 mx-2"></span>
            
            <label className="px-2 py-1 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 cursor-pointer flex items-center gap-1.5 transition-colors font-medium">
              <span>📷 UPLOAD IMAGE</span>
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

      <div className={`flex-1 ${getWidthClass()} w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col transition-all duration-300 ease-in-out`}>
        <div 
          className={`flex-1 ${viewMode === 'split' ? 'grid gap-8 transition-all duration-300 ease-in-out' : 'flex flex-col'}`}
          style={viewMode === 'split' ? { gridTemplateColumns: getGridTemplateColumns() } : undefined}
        >
          
          {/* Writing Area */}
          {(viewMode === 'edit' || viewMode === 'split') && (
            <div className="flex flex-col space-y-6 flex-1">
              
              {/* Cover Image Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border border-dashed p-6 text-center transition-colors ${
                  isDragging
                    ? 'border-neutral-900 bg-neutral-100 dark:border-white dark:bg-neutral-900/40'
                    : coverImageUrl
                    ? 'border-neutral-200 dark:border-neutral-850 bg-transparent'
                    : 'border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 bg-transparent'
                }`}
              >
                {isUploading ? (
                  <div className="py-8 text-neutral-500 flex flex-col items-center justify-center gap-3">
                    <div className="w-6 h-6 border-2 border-neutral-300 dark:border-neutral-700 border-t-black dark:border-t-white rounded-full animate-spin"></div>
                    <span className="text-xs uppercase tracking-widest font-bold">Uploading file to Cloudinary...</span>
                  </div>
                ) : coverImageUrl ? (
                  <div className="relative group max-h-72 overflow-hidden border border-neutral-200 dark:border-neutral-800">
                    <img
                      src={coverImageUrl}
                      alt="Cover image"
                      className="w-full h-full object-cover max-h-72"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <label className="btn py-1.5 px-3 text-[10px] tracking-wider bg-white text-black hover:bg-neutral-200 cursor-pointer font-bold">
                        CHANGE COVER
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
                        className="btn py-1.5 px-3 text-[10px] tracking-wider bg-red-650 text-white hover:bg-red-700 font-bold border-red-650"
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer block py-6">
                    <div className="text-neutral-400 dark:text-neutral-600 mb-2 flex justify-center">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <p className="text-xs uppercase tracking-widest font-bold text-black dark:text-white">
                      ADD COVER IMAGE
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mt-1">
                      Drag & Drop, or click to select cover (Max 5MB)
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
                )}
              </div>

              {/* Title Editor */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title your draft..."
                className="w-full text-3xl font-serif font-bold text-neutral-900 dark:text-white placeholder-neutral-300 dark:placeholder-neutral-800 focus:outline-none bg-transparent leading-tight border-b border-neutral-200 dark:border-neutral-800 pb-3"
              />

              {/* Markdown Editor Canvas */}
              <textarea
                id="editor-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Begin drafting... (Markdown symbols are supported)"
                className="w-full min-h-[480px] flex-1 text-base text-neutral-800 dark:text-neutral-300 placeholder-neutral-300 dark:placeholder-neutral-800 focus:outline-none resize-none font-serif leading-relaxed bg-transparent"
              />
            </div>
          )}

          {/* Preview Panel */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className={`prose dark:prose-invert max-w-none bg-white dark:bg-black/30 p-6 md:p-8 border border-neutral-200 dark:border-neutral-800 overflow-y-auto max-h-[calc(100vh-210px)] flex-1`}>
              {coverImageUrl && (
                <div className="overflow-hidden border border-neutral-200 dark:border-neutral-800 mb-6 max-h-72">
                  <img
                    src={coverImageUrl}
                    alt={title || 'Cover'}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <h1 className="font-serif font-bold text-neutral-900 dark:text-white leading-tight mb-4 border-b border-neutral-200 dark:border-neutral-800 pb-3">
                {title || 'Untitled Post'}
              </h1>
              {content ? (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h2: ({ node, ...props }) => <h2 className="font-sans font-bold tracking-tight text-neutral-900 dark:text-white mt-10 mb-4" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="font-sans font-semibold tracking-tight text-neutral-900 dark:text-white mt-8 mb-3" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-6 leading-relaxed font-serif" {...props} />,
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
                  {content}
                </ReactMarkdown>
              ) : (
                <p className="text-neutral-400 dark:text-neutral-600 italic font-serif">Compose editor content to preview rendering live.</p>
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

  if (seconds < 60) return 'JUST NOW';
  if (seconds < 120) return '1 MINUTE AGO';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} MINUTES AGO`;
  if (seconds < 7200) return '1 HOUR AGO';
  return `${Math.floor(seconds / 3600)} HOURS AGO`;
}
