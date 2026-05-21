import pool from './index';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Starting database seeding with expanded blog posts...');
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Clear all existing data
    console.log('🗑️ Clearing existing data from refresh_tokens, posts, and users...');
    await client.query('TRUNCATE TABLE refresh_tokens, posts, users RESTART IDENTITY CASCADE;');
    console.log('✓ Database tables cleared');
    
    // 2. Hash password for seed users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    
    // 3. Insert users
    console.log('👥 Inserting seed users...');
    const userInsertResult = await client.query(`
      INSERT INTO users (email, username, password_hash, bio, avatar_url)
      VALUES 
        (
          'laksh@inkdrop.app', 
          'laksh', 
          $1, 
          'Lead developer and product architect of InkDrop. Passionate about minimalism, clean typography, and writing clean, scalable software systems.',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
        ),
        (
          'dieter@inkdrop.app', 
          'dieter', 
          $1, 
          'German industrial designer closely associated with the consumer products company Braun and the functionalist school of industrial design.',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80'
        ),
        (
          'helena@inkdrop.app', 
          'helena', 
          $1, 
          'Editorial designer and typography enthusiast. Crafting beautiful readable websites using classic serif typefaces and grid alignments.',
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80'
        )
      RETURNING id, username;
    `, [passwordHash]);
    
    const usersMap = new Map<string, string>();
    userInsertResult.rows.forEach(row => {
      usersMap.set(row.username, row.id);
    });
    console.log(`✓ Inserted ${userInsertResult.rowCount} users`);
    
    const lakshId = usersMap.get('laksh');
    const dieterId = usersMap.get('dieter');
    const helenaId = usersMap.get('helena');
    
    if (!lakshId || !dieterId || !helenaId) {
      throw new Error('Failed to retrieve seed user IDs');
    }
    
    // 4. Insert posts
    console.log('✍️ Inserting seed posts...');
    
    const originalPostsData = [
      {
        author_id: dieterId,
        title: 'The Ten Principles of Good Design',
        slug: 'ten-principles-good-design',
        excerpt: "Dieter Rams' legendary principles of design, exploring how simplicity, utility, and visual structure create timeless products.",
        cover_image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        content: `Good design is a key differentiator in a crowded world. In the late 1970s, Dieter Rams was increasingly concerned by the state of the world around him — "an impenetrable confusion of forms, colours and noises." Aware that he was a significant contributor to that world, he asked himself an important question: is my design good design?

As good design cannot be measured in a finite way, he set about expressing the ten most important principles for what he considered was good design.

### 1. Good design is innovative
The possibilities for innovation are not, by any means, exhausted. Technological development is always offering new opportunities for innovative design. But innovative design always develops in tandem with innovative technology, and can never be an end in itself.

### 2. Good design makes a product useful
A product is bought to be used. It has to satisfy certain criteria, not only functional, but also psychological and aesthetic. Good design emphasizes the usefulness of a product whilst disregarding anything that could possibly detract from it.

### 3. Good design is aesthetic
The aesthetic quality of a product is integral to its usefulness because products we use every day affect our person and our well-being. But only well-executed objects can be beautiful.

### 4. Good design makes a product understandable
It clarifies the product’s structure. Better still, it can make the product talk. At best, it is self-explanatory.

> "Good design is as little design as possible. Less, but better – because it concentrates on the essential aspects, and the products are not burdened with non-essentials. Back to purity, back to simplicity."
> — Dieter Rams

### 5. Good design is unobtrusive
Products fulfilling a purpose are like tools. They are neither decorative objects nor works of art. Their design should therefore be both neutral and restrained, to leave room for the user’s self-expression.

### 6. Good design is honest
It does not make a product more innovative, powerful or valuable than it really is. It does not attempt to manipulate the consumer with promises that cannot be kept.

### 7. Good design is long-lasting
It avoids being fashionable and therefore never appears antiquated. Unlike fashionable design, it lasts many years – even in today’s throwaway society.

### 8. Good design is thorough down to the last detail
Nothing must be arbitrary or left to chance. Care and accuracy in the design process show respect towards the user.

### 9. Good design is environmentally-friendly
Design makes an important contribution to the preservation of the environment. It conserves resources and minimizes physical and visual pollution throughout the lifecycle of the product.

### 10. Good design is as little design as possible
Less, but better – because it concentrates on the essential aspects, and the products are not burdened with non-essentials.
Back to purity, back to simplicity.`
      },
      {
        author_id: helenaId,
        title: 'Typography in Modern Editorial Webs',
        slug: 'typography-modern-editorial-webs',
        excerpt: 'Why typography is the unsung hero of minimalist design, and how to craft perfect layout grids on the web.',
        cover_image_url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        content: `Typography is the voice of the written word. On the web, where over 90% of all information is presented as text, typography is not just a styling choice—it is the user interface itself. In the era of the Swiss Editorial style, layout and type scale dictate the rhythm of comprehension.

### The Power of Serif & Sans-Serif Contrast
Contrast is the soul of visual interest. By combining a geometric or clean sans-serif typeface (like *Outfit* or *Inter*) for headers and UI labels with an elegant, readable serif (like *Lora* or *Merriweather*) for long-form prose, we create a clear division of labor:
* **Sans-serif (UI & Navigation):** Conveys precision, structure, and hierarchy.
* **Serif (Body Prose):** Offers comfort, high readability, and a slow, intentional pace of reading.

### Grid Systems and the Vertical Rhythm
A beautiful layout relies on invisible grids. On desktop viewports, editorial blogs should employ comfortable margins, off-center focal alignments, and generous line height (typically \`leading-relaxed\` or \`1.75\` for body text).

\`\`\`css
/* Example of optimal vertical rhythm styling */
article p {
  font-size: 1.125rem;
  line-height: 1.75;
  margin-bottom: 1.5rem;
  color: var(--color-gray-800);
}
\`\`\`

#### Key Rules for Perfect Line length
1. **Characters per Line:** Aim for 60-75 characters per line (including spaces) for optimal readability. Anything wider strains the eye; anything narrower disrupts the flow.
2. **Dynamic Scale:** Let your typography scale proportionally with the viewport, using CSS custom properties or tailwind arbitrary fluid utilities.
3. **Contrast Ratio:** Ensure text maintains at least a 4.5:1 contrast ratio against the background to respect accessibility guidelines.

Minimalism doesn't mean the absence of design; it means the absence of noise. By prioritizing type hierarchy, we respect our reader's attention.`
      },
      {
        author_id: lakshId,
        title: 'Designing a Draft-First CMS',
        slug: 'designing-draft-first-cms',
        excerpt: 'A deep dive into building InkDrop: choosing a database engine, designing local-first draft states, and securing authentication.',
        cover_image_url: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        content: `Most blogging platforms treat writing as a secondary action. You open a massive editor, fill in settings, pick taxonomies, configure SEO tags, and finally write. With **InkDrop**, we wanted to invert this hierarchy. Writing comes first; everything else is metadata.

### The Architecture
InkDrop is built on a modern, lightweight, and high-performance stack:
* **Frontend:** React + Tailwind CSS + TypeScript
* **Backend:** Express + PostgreSQL (Neon Serverless)
* **Authentication:** Stateless JWT Access Tokens + Stateful Database Refresh Tokens

\`\`\`ts
// How we handle security validation for draft publishing
async function publishDraft(postId: string, authorId: string) {
  const post = await PostModel.findById(postId);
  if (!post || post.author_id !== authorId) {
    throw new Error("Unauthorized action");
  }
  return PostModel.publish(postId);
}
\`\`\`

### Why Neon Serverless?
When deciding on database storage, we needed a relational engine that could handle nested joins (like attaching user profiles directly inside posts JSON objects) but scale down to zero when idle to save developer costs. 

Neon's serverless postgres provided exactly what we needed:
1. **Instant branching:** Allowing us to test schema migrations in isolation.
2. **PgBouncer integration out of the box:** Making connection pooling effortless.
3. **Cold-start recovery:** Ensuring data is loaded instantly upon request.

### The Future of Writing Interfaces
A draft-first editor must feel like a sheet of paper. Auto-saves should happen transparently in the background, keyboard shortcuts should rule the interface, and distraction-free modes should hide all UI noise. 

In our upcoming release, we are building local drafts syncing to prevent data loss even during network disconnects.`
      },
      {
        author_id: dieterId,
        title: 'Less, But Better',
        slug: 'less-but-better',
        excerpt: "An exploration of Weniger, aber besser—Dieter Rams' philosophy of minimalist design and life.",
        cover_image_url: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        content: `"Weniger, aber besser" — translation: *Less, but better*.

This phrase has become the rallying cry for minimalists, architects, designers, and software engineers globally. But what does it truly mean in practice? It is not merely the subtraction of elements for the sake of empty space. It is the deliberate refinement of what remains until nothing more can be removed without compromising utility.

### The Noise of Abundance
We live in an age of digital clutter. Apps are loaded with hundreds of features that 95% of users will never trigger. Notifications fight for every millisecond of our cognitive processing capacity. 

When we design interfaces or products, our default instinct is addition:
* *"Let's add another button."*
* *"Let's add a custom share widget."*
* *"Let's write another page of settings."*

But every addition introduces complexity, learning overhead, and technical debt.

### Applying "Less, But Better" to Code
In software architecture, this translates to avoiding premature abstractions, limiting dependencies, and choosing simple data models over complex polymorphic schemas. 

Next time you build a feature, ask yourself: *Does this serve the core utility, or is it visual noise?*`
      },
      {
        author_id: lakshId,
        title: 'The Art of Writing Technical Documentation',
        slug: 'art-writing-technical-documentation',
        excerpt: 'Why write docs before code? A look into documentation-driven development and how it refines architecture.',
        cover_image_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(), // today
        content: `Writing code is easy; writing clear software systems is hard. The single most effective tool for refining system design is writing the user-facing documentation before a single line of implementation is written.

### What is Documentation-Driven Development (DDD)?
In DDD, the development cycle starts by writing the \`README.md\` or API documentation:
1. **Write the Guide:** Explain how the feature works as if it is already finished.
2. **Define the Types/APIs:** Draft the requests and response JSON bodies.
3. **Write the Tests:** Define the inputs and expected outputs.
4. **Implement the Logic:** Write the minimal code to satisfy the docs and tests.

### Why does it work?
When we write code first, we get bogged down by internal technical constraints (database keys, library limits, performance quirks). We design APIs that match our database schemas rather than what makes sense to the consumer.

By starting with documentation, you force yourself to see the feature from the outside. If the explanation feels complicated, the API design is probably wrong.

> "A feature that cannot be documented simply is a feature that has not been understood."

Give documentation-driven design a try on your next project. It will save you hours of refactoring.`
      },
      {
        author_id: lakshId,
        title: 'The Psychology of Distraction-Free Writing',
        slug: 'psychology-distraction-free-writing',
        excerpt: 'Why minimalism and empty screen space are not just styling trends, but essential triggers for cognitive flow states.',
        cover_image_url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        content: `Writing is an act of high cognitive load. Every time your cursor blinks in a cluttered editor surrounded by sidebar widgets, tag inputs, layout blocks, and dynamic notifications, your brain performs micro-context switches. 

These switches consume prefrontal cortex energy, leaving less glucose for vocabulary recall, phrase structure, and structural editing.

### The Flow State Equation
In psychology, flow state is defined as an optimal state of consciousness where you feel your best and perform your best. Achieving this state requires:
1. **Clear goals:** Knowing what you want to communicate.
2. **Immediate feedback:** Seeing your thoughts take shape on paper.
3. **Low friction:** Eliminating visual and mechanical distractions.

By reducing the interface to a single column of prose, we drop the cognitive overhead. There is no sidebar to tweak. There are no tags to search. There is only the word.

> "Simplicity is not the style. It is the end result of an intense process of elimination."

### Creating Your Creative Sanctuary
To make the most of distraction-free interfaces:
* **Silence notifications:** Switch your device to Do Not Disturb.
* **Write first, format later:** Avoid highlighting text and styling headers while typing your draft. Let the raw markdown keep your hands on the keyboard.
* **Embrace the white space:** Empty margins allow your eyes to rest and keep your focus anchored on the current line.`
      },
      {
        author_id: lakshId,
        title: 'Why We Built InkDrop: A Manifesto for Writers',
        slug: 'why-we-built-inkdrop-manifesto',
        excerpt: 'Defining the core beliefs of InkDrop—that writing software should disappear, letting words stand on their own.',
        cover_image_url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        content: `Software has become too noisy. What started as tools to enhance productivity have slowly transformed into platforms designed to trap our attention. Word processors and blogging dashboards are bloated with secondary and tertiary operations.

We believe that writing is a sacred, intellectual act. It deserves a tool that respects it.

### Our Three Guiding Pillars

#### I. Draft-First Architecture
Writing is messy. It begins with incomplete sentences, chaotic fragments, and unresolved arguments. InkDrop is built around drafts as the primary status. A draft is not a second-class post; it is the natural state of writing.

#### II. Print-Inspired Typography
Web typography has largely forgotten the lessons of traditional print layout. We respect vertical grids, generous line height, and high-contrast letterforms. Every post on InkDrop looks like a page from a carefully designed physical book.

#### III. Absolute Zero Distraction
We will never build algorithms to recommend clickbait content. We will never add annoying popups or social shares. The reading view is clean. The writing view is blank.

\`\`\`
+------------------------------------------+
|                 INKDROP                  |
+------------------------------------------+
|                                          |
|  [ The raw text goes here. No noise. ]  |
|                                          |
+------------------------------------------+
\`\`\`

We built InkDrop because we wanted a place to think. We hope it becomes a sanctuary for your thoughts, too.`
      },
      {
        author_id: lakshId,
        title: 'Mastering CSS Grid: The Swiss Layout Guide',
        slug: 'mastering-css-grid-swiss-layout',
        excerpt: 'How to build asymmetric editorial grids on the web with Tailwind and raw CSS, inspired by Swiss design history.',
        cover_image_url: 'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
        content: `Swiss design—or the International Typographic Style—is known for its grid systems, asymmetrical layouts, and crisp sans-serif typefaces. While traditional web frameworks favor absolute symmetry, we can leverage CSS Grid to create stunning, modern editorial layouts.

### Designing the Grid
Instead of a simple repeating column list, modern publications use asymmetric spacing to guide the reader’s eye. Let's look at how we can implement this with Tailwind CSS:

\`\`\`html
<div class="grid grid-cols-12 gap-6">
  <!-- Asymmetrical sidebar text -->
  <aside className="col-span-12 md:col-span-4 border-r border-neutral-200 pr-6">
    <h3 className="text-xs uppercase tracking-widest font-extrabold">Section Info</h3>
    <p className="text-sm text-neutral-500 mt-2">Details on the layout structure.</p>
  </aside>
  
  <!-- Main article text -->
  <main className="col-span-12 md:col-span-8">
    <p className="text-lg font-serif">Prose starts here...</p>
  </main>
</div>
\`\`\`

### Key Elements of Swiss Editorial CSS
1. **Bold Asymmetry:** Position your headline in a wide span but offset the body text to a narrower column. This creates negative space that makes the page breathe.
2. **Solid Gridlines:** Use thin, high-contrast border gridlines (\`border-neutral-200\` or \`border-neutral-850\`) to separate items visually instead of relying on colored boxes.
3. **Heavy Tracking:** Keep header letterforms tight or use wide spacing with uppercase letters to build visual contrast.`
      },
      {
        author_id: lakshId,
        title: 'The Infinite Canvas: Designing for the Modern Web',
        slug: 'infinite-canvas-designing-modern-web',
        excerpt: 'Discussing the transition from fixed page heights to fluid screens and responsive layout scaling.',
        cover_image_url: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        content: `For decades, designers worked within the bounds of physical paper. A poster had a height. A book page had margins. In the early days of the web, we tried to force pages into fixed pixel containers (remember the 960px grid?).

Today, we design for the infinite canvas—a viewport that can shrink to a 320px watch screen or expand to a 4K desktop monitor.

### Fluid Layouts over Fixed Breakpoints
Instead of styling for specific device widths (e.g. mobile vs tablet vs laptop), we should design fluid systems that scale dynamically. By combining CSS clamping with viewport units, our typography and spacings adjust automatically:

\`\`\`css
/* Dynamically scale title font-size from 2rem to 4rem */
h1 {
  font-size: clamp(2rem, 5vw + 1rem, 4rem);
}
\`\`\`

### The Role of Adaptive Negative Space
On wide monitors, web apps often make the mistake of stretching content to fill the screen, resulting in unreadable line lengths. Alternatively, they lock content into a narrow box, wasting the available viewport.

The solution is **adaptive negative space**. By allowing margins to grow while holding the content column container at a highly legible width, we utilize the screen space gracefully without straining the reader's eyes.`
      },
      {
        author_id: lakshId,
        title: 'Refactoring 10,000 Lines of Code: Lessons Learned',
        slug: 'refactoring-10000-lines-lessons-learned',
        excerpt: 'A software engineering post explaining how to refactor messy codebases without breaking features.',
        cover_image_url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        content: `Refactoring is the process of improving the internal structure of code without changing its external behavior. It is one of the most vital tasks in software engineering, yet it is often delayed until technical debt stalls the entire product roadmap.

Last month, we refactored the core authentication and draft saving controller inside InkDrop. Here are three major lessons we learned.

### 1. Write the Tests First
Never attempt to refactor code that doesn't have coverage. Without test cases, refactoring is simply guessing. Before we rewrote the JWT token refresh routine, we built a comprehensive test script validating:
* Active access token requests.
* Expired token refresh rejections.
* Concurrent refresh requests.

### 2. Take Small, Atomic Steps
Do not try to refactor an entire folder in one go. Keep your changes small and build/verify continuously.
* Split your functions into pure and impure routines.
* Relocate database calls to isolated models.
* Verify compilation after each move.

\`\`\`
Messy Controller -> Isolated Data Models -> Refactored Endpoints
\`\`\`

### 3. Avoid the Temptation to Add Features
Refactoring time is not the time to add new buttons or options. If you find yourself editing business logic while cleaning up syntax, stop and commit your changes first. Keep refactoring and feature development completely separate.`
      },
      {
        author_id: lakshId,
        title: 'The Future of AI in Web Development',
        slug: 'future-ai-web-development',
        excerpt: 'An early preview of how automated design systems will evolve with AI assistants.',
        cover_image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        is_published: false,
        published_at: null,
        content: `This is a draft discussing the future of AI co-pilots in modern frontend design systems. 

How will coding change when visual agents can assemble full responsive grids in real-time? We will explore token-mapping auto-generation, visual linting pipelines, and interactive feedback interfaces.`
      },
      {
        author_id: lakshId,
        title: 'The Beauty of Monospaced Typography',
        slug: 'beauty-monospaced-typography',
        excerpt: 'Why fixed-width typefaces are not just for code editors, but a powerful design tool for structured editorial layouts.',
        cover_image_url: 'https://images.unsplash.com/photo-1548345680-f5475ea5df84?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
        content: `Monospaced typefaces—where every character occupies the exact same horizontal space—have a rich history. Born in the era of mechanical typewriters, they were a technical necessity. In the early days of computing, they were a hardware constraint. Today, they are a deliberate aesthetic choice.

While proportional typefaces (like *Outfit* or *Inter*) are designed for fluid reading, monospaced fonts (like *Fira Code* or *JetBrains Mono*) bring a sense of structure, precision, and engineering to a layout.

### The Mechanics of Fixed Width

In a proportional font, a lowercase "i" is narrow, and an uppercase "W" is wide. This creates a natural word flow but makes horizontal alignment unpredictable. In a monospaced font, the "i" is padded with white space to match the width of the "W".

This equality has unique advantages:
1. **Vertical Alignment:** Code, tables, and numeric data align in perfect columns.
2. **Text Density:** It enforces a steady visual pacing, forcing the reader to slow down.
3. **Structured Charm:** It evokes the aesthetic of vintage documents, technical blueprints, and raw terminal consoles.

### When to Use Monospaced Fonts in UI Design

Monospaced typography is most effective when used in small, high-contrast doses. In modern Swiss design, monospaced type is frequently used for:
* **Metadata & Captions:** Dates, read times, and tags look crisp and organized.
* **Numbers & Tables:** Displaying data values without columns jumping on update.
* **Navigation Links:** Giving utility items a distinct "systematic" look.

\`\`\`css
/* Styling system metrics with monospaced typeface */
.metadata-label {
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
\`\`\`

By introducing monospaced fonts alongside a rich serif or sans-serif face, you build a multi-layered typographic system that feels both academic and contemporary.`
      },
      {
        author_id: lakshId,
        title: 'Offline-First Web Apps: The Next Frontier',
        slug: 'offline-first-web-apps',
        excerpt: 'How to build resilient applications that work perfectly offline, sync seamlessly in the background, and never lose user data.',
        cover_image_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        content: `We live in an interconnected world, yet our connection is rarely perfect. Whether you are in a subway tunnel, on an airplane, or traveling in rural areas, network dropouts are a constant reality. Yet, the default behavior of most modern web applications is to display an offline dinosaur or a generic connection error.

**Offline-First** is a design and development philosophy that treats the network as an enhancement, not a requirement. It ensures that the application remains fully functional without an internet connection, saving data locally and syncing automatically when the connection is restored.

### The Core Architecture

Building an offline-first app requires moving the primary data store from the remote cloud server to the client's device:

1. **Service Workers:** Act as a network proxy, caching static assets (HTML, CSS, JS) and API endpoints so the app loads instantly.
2. **Local Database:** Databases like *IndexedDB* or *RxDB* store data directly in the browser's storage container.
3. **Background Sync:** A background process listens for connection recovery and triggers a secure replication pipeline.

\`\`\`ts
// Checking online status and queueing sync payloads
window.addEventListener('online', async () => {
  const localDrafts = await LocalDB.getPendingDrafts();
  if (localDrafts.length > 0) {
    await SyncService.uploadToCloud(localDrafts);
    console.log("✓ Local drafts successfully synchronized!");
  }
});
\`\`\`

### Handling Synchronization Conflicts

The hardest part of offline-first development is sync conflicts. If a user edits a post on their phone while offline, and simultaneously updates it on their tablet, which change wins?

To resolve this, modern apps use **Conflict-Free Replicated Data Types (CRDTs)** or event-sourcing architectures. Instead of saving the full final document, they save a log of individual keystrokes or changes with precise timestamps, merging them deterministically.

By building offline-first, you respect your user's time and creativity. A writer should never lose a sentence because their connection dropped.`
      },
      {
        author_id: lakshId,
        title: 'Designing for Dark Mode: Beyond #000000',
        slug: 'designing-dark-mode-beyond',
        excerpt: 'Why pure black causes visual strain, and how to create rich, harmonious dark interfaces using deep slate, charcoal, and neon accents.',
        cover_image_url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
        content: `Dark mode has evolved from a developer preference to a standard system setting. It reduces eye fatigue in low-light environments, saves battery life on OLED displays, and provides a sleek, modern aesthetic. However, designing a great dark mode is more complex than simply flipping background colors to black and text to white.

A naive dark mode—using pure black (\`#000000\`) backgrounds and pure white (\`#ffffff\`) text—often fails. It creates harsh, vibrating contrasts that cause high eye strain and halos for users with astigmatism.

### The Power of Slate and Charcoal

To design a premium dark interface, look to natural shadows rather than absolute darkness. By utilizing deep charcoal, dark navy, or rich slate tones, you create depth and allow components to cast soft shadows:

* **Primary Background:** Use tones like \`#0b0c10\`, \`#121212\`, or \`#1a1d24\`.
* **Elevated Surfaces:** Card and popup backgrounds should be slightly lighter (e.g. \`#1e2029\`) to visually represent physical elevation.
* **Muted Typography:** Use off-white or light gray (\`#e4e4e7\` or \`#a1a1aa\`) for paragraph text. This maintains readability without the blinding glow of pure white.

\`\`\`css
/* Dynamic elevated card states in dark mode */
.dark .card-surface {
  background-color: #121212;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}
\`\`\`

### Color Saturation Adjustments

Colors that look vibrant on a light background can look garish and vibrate on a dark background. When transitioning to dark mode:
1. **Desaturate Accents:** Lower the saturation of primary brand colors to maintain visual harmony.
2. **Increase Luminance:** Slightly increase the lightness of thin lines and icons to make them pop against dark backdrops.
3. **Harmonize Highlights:** Use low-opacity alpha values (e.g. \`rgba(255, 255, 255, 0.03)\`) for subtle hover animations rather than solid gray fills.

Good dark design is quiet, deep, and cohesive. Let the typography take center stage without flashing pixels.`
      },
      {
        author_id: lakshId,
        title: 'The Philosophy of UNIX Tools',
        slug: 'philosophy-unix-tools',
        excerpt: 'What a 50-year-old operating system philosophy can teach us about building modern, maintainable web applications.',
        cover_image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // 40 days ago
        content: `In 1978, Douglas McIlroy summarized the UNIX philosophy: *"Write programs that do one thing and do it well. Write programs to work together. Write programs to handle text streams, because that is a universal interface."*

Almost five decades later, the software engineering landscape has transformed completely. We build complex web apps using layers of monolithic frameworks, bundlers, and runtime engines. Yet, when applications grow large, they suffer from the same issues of bloat and rigidity that McIlroy sought to solve.

The core tenets of the UNIX philosophy remain the best guide for building maintainable codebases:

### I. Small is Beautiful

A component or helper function should have a single, well-defined responsibility. If a module handles API fetching, state validation, and UI rendering, it is too large. By breaking it into small modules, we make it easy to test, swap, and refactor.

### II. Expect the Output of Every Program to Become the Input to Another

In UNIX, programs are chained together using pipes (\`|\`). The output of \`ls\` becomes the input of \`grep\`. In web apps, this translates to designing clean, composable data structures. Avoid custom, proprietary object models; instead, pass primitive data types, JSON streams, or functional arrays.

\`\`\`ts
// Composing clean, functional transformations
const cleanAndSlugify = (title: string) => 
  title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
\`\`\`

### III. Build a Prototype as Soon as Possible

Do not spend weeks drawing UML diagrams and designing complex databases. Build the minimal working system, run it on actual viewports, observe how it behaves, and iterate based on real feedback.

By honoring simplicity and composability, our software systems become flexible enough to withstand the test of time.`
      },
      {
        author_id: lakshId,
        title: 'The Silent Power of Micro-Interactions',
        slug: 'silent-power-micro-interactions',
        excerpt: 'How subtle visual feedback, spring physics, and micro-animations elevate digital products from functional to premium.',
        cover_image_url: 'https://images.unsplash.com/photo-1508873696983-2df519f0397e?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
        content: `What separates an average digital product from a premium one? It is rarely the core feature list. Both apps allow you to write notes; both sites display articles. The difference lies in the details.

**Micro-interactions** are single-task engagement moments that serve a functional purpose: providing feedback, explaining states, or helping the user visualize progress. When executed with precision, they add "magic" and personality to an interface.

### The Anatomy of a Micro-Interaction

Every great micro-interaction consists of four key parts:

1. **Trigger:** The action that initiates the animation (e.g. clicking a button, hovering over a link, or a loading state starting).
2. **Rules:** What happens during the event.
3. **Feedback:** The visual, auditory, or haptic response (e.g. a thin line expanding, a subtle container scale).
4. **Loops & Modes:** How the interaction changes over time or behaves when repeated.

### Designing with Spring Physics

In the physical world, objects do not start and stop instantly. They have mass, inertia, and friction. When an interface element moves using linear math, it feels robotic and cheap.

By applying **spring physics** or cubic-bezier curves (e.g. \`cubic-bezier(0.16, 1, 0.3, 1)\`), elements move with natural inertia—speeding up quickly and decelerating smoothly.

\`\`\`css
/* Clean editorial hover line transition */
.editorial-link {
  position: relative;
}
.editorial-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.editorial-link:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}
\`\`\`

Keep your micro-interactions quiet. They should assist the user without screaming for attention.`
      },
      {
        author_id: helenaId,
        title: 'Developing for the Modern Web: Speed & Simplicity',
        slug: 'developing-modern-web-speed-simplicity',
        excerpt: 'An unpublished draft detailing web performance metrics and why simple static builds outperform bloated frameworks.',
        cover_image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        is_published: false,
        published_at: null,
        content: `Performance is user experience. When a website takes more than 3 seconds to load, half of your audience is already gone. 

### Why static site rendering wins
By delivering pre-rendered, lightweight HTML and vanilla CSS, we completely bypass client-side JavaScript hydration costs...`
      },
      {
        author_id: lakshId,
        title: 'The Architecture of a High-Performance Markdown Parser',
        slug: 'architecture-high-performance-markdown-parser',
        excerpt: 'Exploring the internals of abstract syntax trees (ASTs), compiler tokenization, and custom remark plugins for real-time editor rendering.',
        cover_image_url: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 48 * 24 * 60 * 60 * 1000), // 48 days ago
        content: `Writing text is simple, but compiling it dynamically into standard HTML structures is a classic compiler problem. In modern web editors, we rely on markdown parsers to transform raw text streams into rich visual documents. To build InkDrop's real-time editor, we had to design a highly optimized parsing and rendering engine.

### Inside the Abstract Syntax Tree (AST)

When you write a markdown string, the parser does not perform simple regex replacements. Doing so would be brittle and slow. Instead, the compilation pipeline operates in three discrete phases:

1. **Tokenization (Lexical Analysis):** Scanning character-by-character to identify syntax blocks (like asterisks for emphasis, hash signs for headers, or brackets for links).
2. **Parsing (Syntax Analysis):** Structuring these flat tokens into a hierarchical nested tree representation (AST).
3. **Compilation/Rendering:** Traversing the AST and outputting HTML elements or React component trees.

Here is what a simple markdown header looks like representationally inside our AST node model:

\`\`\`json
{
  "type": "heading",
  "depth": 2,
  "children": [
    {
      "type": "text",
      "value": "Inside the Abstract Syntax Tree (AST)"
    }
  ]
}
\`\`\`

### Extending the Parser with Custom Remark Plugins

By utilizing the Unified compiler ecosystem (composed of *remark* for markdown and *rehype* for HTML processing), we can write custom plugins that intercept nodes and inject custom classes or structures before rendering:

\`\`\`ts
// A custom plugin to inject typographic anchors to headers
import { visit } from 'unist-util-visit';

export function remarkHeaderAnchors() {
  return (tree: any) => {
    visit(tree, 'heading', (node: any) => {
      const textNode = node.children.find((c: any) => c.type === 'text');
      if (textNode) {
        const slug = textNode.value.toLowerCase().replace(/[^\\w\\s-]/g, '').replace(/\\s+/g, '-');
        node.data = node.data || {};
        node.data.hProperties = {
          ...node.data.hProperties,
          id: slug,
          className: 'group relative scroll-mt-24'
        };
      }
    });
  };
}
\`\`\`

### Mitigating Render Bottlenecks

In long documents, continuous parsing on every keystroke can quickly bottleneck the main thread. We solved this through two optimization techniques:
* **Debounced compilation:** Delaying the parsing step until the user pauses typing for 250ms.
* **Component Memoization:** Preventing the re-rendering of unchanged sections by slicing the document tree into separate blocks and only re-parsing the active block.

By understanding the underlying tree structures of our texts, we can build tools that feel completely instant, keeping the writer in flow.`
      },
      {
        author_id: lakshId,
        title: 'The Geometry of White Space in Swiss Typography',
        slug: 'geometry-white-space-swiss-typography',
        excerpt: 'How Swiss modernist designers leverage negative space as an active layout driver, and how to apply these rules to CSS grid design.',
        cover_image_url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 52 * 24 * 60 * 60 * 1000), // 52 days ago
        content: `In traditional web layouts, empty space is often seen as a waste of screen area—a gap waiting to be filled with banners, widgets, or related links. In the Swiss Modernist school of design, however, white space (or negative space) is not passive emptiness. It is a powerful, active layout driver that directs the user’s eye, defines hierarchy, and creates a sense of luxury.

### Emil Ruder and the Active Grid

Emil Ruder, a pioneer of Swiss design, taught that typography is about the relationship between printed and unprinted space. Without negative space, text becomes a wall of sound—loud, dense, and incomprehensible. By giving headers, lists, and quotes deep margins, we allow each idea to stand out.

> "White space is the breathing room of the page. It is not empty space; it is active space that holds the layout together."
> — Emil Ruder

### Implementing Asymmetric CSS Grids

To apply Swiss layouts to modern web apps, we avoid strict horizontal symmetry. Instead of centering everything, we use asymmetrical grids with negative space offsets. Here is how you can set up a Swiss-inspired grid with Tailwind:

\`\`\`html
<div class="grid grid-cols-12 gap-8 py-16">
  <!-- Left column: Tiny navigation and section details -->
  <aside class="col-span-12 lg:col-span-3 text-[10px] uppercase tracking-widest font-sans font-bold">
    <div class="sticky top-28 space-y-4">
      <span class="text-neutral-400 block border-b pb-2">01 / PRINCIPLE</span>
      <p class="text-neutral-900 dark:text-white leading-relaxed">Negative space defines structure.</p>
    </div>
  </aside>

  <!-- Right column: Main body text shifted off-center -->
  <main class="col-span-12 lg:col-span-8 lg:col-start-5 prose font-serif">
    <p>The prose flows in a wider column, offset by the empty spaces on either side...</p>
  </main>
</div>
\`\`\`

### Three Rules for Web Hierarchy
1. **Double Your Margins:** When designing editorial layouts, double the margin between sections. If you typically use \`mt-8\`, try \`mt-16\` or \`mt-24\`.
2. **Limit Line Width:** Never stretch body text across the full screen. Limit the text container to \`max-w-3xl\` (about 65-75 characters per line).
3. **Use Structural Border Rules:** Instead of coloring background cards, use thin borders (\`1px border-neutral-200\`) to separate columns cleanly.

By mastering white space, you respect your reader's attention and create an interface that feels quiet, clean, and premium.`
      },
      {
        author_id: lakshId,
        title: 'Optimizing Neon PostgreSQL for Serverless Connection Spikes',
        slug: 'optimizing-neon-postgres-serverless',
        excerpt: 'Strategies for managing database connections in serverless environments: PgBouncer, connection pooling, transient retries, and cold-start mitigations.',
        cover_image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 56 * 24 * 60 * 60 * 1000), // 56 days ago
        content: `Relational databases like PostgreSQL were originally designed for long-running, stateful servers. In a traditional app, the server opens a pool of database connections and keeps them active indefinitely. In a serverless environment (like Vercel functions), however, this model falls apart. 

Every time a serverless function is triggered, it spawns a temporary process, connects to the database, runs a query, and disappears. If a thousand users hit your API at once, your app will attempt to open a thousand simultaneous connections, quickly exhausting your database limits.

### Connection Pooling with PgBouncer

To solve this scaling problem, Neon serverless Postgres includes built-in connection pooling via PgBouncer. Instead of connecting directly to the standard Postgres port, you connect to the pooler endpoint. 

The pooler maintains a warm queue of active connections to the database engine. When your serverless function requests a query, the pooler assigns it an active connection for the duration of the query, then immediately reassigns it to the next function.

\`\`\`
Serverless Fn 1 ---\\
Serverless Fn 2 ----> PgBouncer Pooler ---> PostgreSQL Engine (Pool of 20 connections)
Serverless Fn 3 ---/
\`\`\`

### Handling Transient Connection Retries

Because serverless database pools scale down when idle, the very first database query after a period of inactivity can encounter a cold-start latency. In some cases, this causes the connection to time out, returning a temporary database error.

To make our application resilient, we implement retry logic with exponential backoff for our connection client:

\`\`\`ts
// A resilient database query wrapper with connection retries
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function resilientQuery(text: string, params?: any[], maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(text, params);
        return result;
      } finally {
        client.release();
      }
    } catch (err: any) {
      attempt++;
      console.warn(\`Database query attempt \${attempt} failed: \${err.message}\`);
      if (attempt >= maxRetries) throw err;
      // Wait with exponential backoff (e.g. 100ms, 200ms, 400ms)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
    }
  }
}
\`\`\`

### Serverless DB Best Practices
* **Use Connection Pooling connection strings:** In production, always append \`?sslmode=require\` or use the Neon pooled connection URL.
* **Keep connections brief:** Never open a connection at the top of a controller and run heavy async API fetches before releasing it. Run queries quickly and release the client immediately.
* **Relational Caching:** Cache heavy, read-only queries (like fetching user profile details or post categories) inside an in-memory cache to bypass the database entirely.

Scaling a database for serverless doesn't require switching to NoSQL. By configuring connection pools and adding retry layers, relational engines can scale infinitely.`
      },
      {
        author_id: lakshId,
        title: 'State Management Redefined: Clean Architecture in React 19',
        slug: 'state-management-clean-architecture-react',
        excerpt: 'A look at decoupling UI components from domain logic, using client-side stores as repositories, and managing local-first states.',
        cover_image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        content: `In the early days of React, state management was simple: you passed props down the tree. As apps grew, we introduced Redux, which centralized state but introduced massive amounts of boilerplate. Today, the trend has shifted toward lightweight state stores (like Zustand) or context bindings.

However, the real problem in modern React apps is not the choice of state library. It is the lack of architectural separation. We frequently write business logic, database syncing, and visual animations all within the same component file.

### Decoupling the UI from Domain Logic

To build an editor like InkDrop that scales without becoming spaghetti code, we apply the principles of **Clean Architecture**. The visual interface (React components) should be a thin layer that delegates actions to domain logic (pure functions or standalone stores):

\`\`\`
+-------------------------------------------------+
|               Visual UI Layer                   |
|  (React Pages, Forms, Toolbar, Buttons)         |
+------------------------+------------------------+
                         | Dispatches Actions
                         v
+-------------------------------------------------+
|             Domain Store Layer                  |
|  (Zustand Stores, Cache Repositories, Reducers)  |
+------------------------+------------------------+
                         | Calls Services
                         v
+-------------------------------------------------+
|             Infrastructure Layer                |
|  (API Clients, LocalStorage Syncer, Cloudinary) |
+-------------------------------------------------+
\`\`\`

### Implementing a Core Zustand Store

By using Zustand, we can isolate state and actions outside of the React render cycle, preventing unnecessary re-renders and making code testable in Node environments:

\`\`\`ts
// A decoupled store for managing post content drafts
import { create } from 'zustand';

interface PostDraftState {
  title: string;
  content: string;
  isSaving: boolean;
  lastSaved: Date | null;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  triggerSave: (postId: string, service: any) => Promise<void>;
}

export const usePostDraftStore = create<PostDraftState>((set, get) => ({
  title: '',
  content: '',
  isSaving: false,
  lastSaved: null,
  setTitle: (title) => set({ title }),
  setContent: (content) => set({ content }),
  triggerSave: async (postId, service) => {
    const { title, content } = get();
    if (!title.trim() || !content.trim()) return;
    
    set({ isSaving: true });
    try {
      await service.updatePost(postId, { title, content });
      set({ lastSaved: new Date() });
    } catch (error) {
      console.error('Draft autosave failed:', error);
    } finally {
      set({ isSaving: false });
    }
  }
}));
\`\`\`

### Benefits of Clean Separation
1. **Simplified Testing:** You can test the draft store and its saving routines using simple Jest or Vitest scripts, without mounting React components.
2. **Interchangeable UI:** If you decide to migrate from Tailwind to native CSS, or from React to React Native, your core business logic remains untouched.
3. **No Context Overhead:** Zustand stores do not suffer from the provider-re-render problem that plagues React Context when values change frequently.

Clean code is not about writing fewer lines. It is about drawing clear boundaries between separate concerns.`
      },
      {
        author_id: lakshId,
        title: 'The Aesthetics of Monochromatic Interfaces',
        slug: 'aesthetics-monochromatic-interfaces',
        excerpt: 'Designing stunning monochromatic dark and light interfaces that feel premium by manipulating lightness, tint ratios, and glassmorphic elevations.',
        cover_image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 64 * 24 * 60 * 60 * 1000), // 64 days ago
        content: `Color is one of the most expressive design elements in software. But color can also become visual noise. A neon green button, a bright blue header, and a red alert banner can fight for the user’s attention, creating an interface that feels chaotic and cheap.

A **monochromatic interface**—one that relies almost entirely on variations of a single hue, typically gray, black, or deep slate—forces you to focus on the essentials: typography, alignment, border weight, and negative space. It feels quiet, premium, and classic.

### Creating Depth Without Colors

In a monochromatic design, you cannot use red or blue to show that a component is elevated. Instead, you create depth by controlling the lightness values of your dark and light panels. Let's look at how we structure elevations in InkDrop:

* **Level 0 (Canvas Background):** Pure slate/dark gray (\`#0b0c10\` or \`#050505\`).
* **Level 1 (Card Containers):** A slightly lighter tone (\`#121212\` or \`#15171e\`) separated by thin borders.
* **Level 2 (Popups / Modals):** An elevated surface (\`#1e2029\` or \`#202430\`) with a subtle box-shadow.

\`\`\`css
/* Custom glassmorphism layers in a monochromatic system */
.monochrome-glass {
  background-color: rgba(18, 18, 18, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
}
\`\`\`

### Harnessing Tint Ratios

A common mistake in gray interfaces is using "dead grays" (pure neutral grays like \`#888888\`). These can look dull and muddy, especially on low-cost displays. 

Instead, inject a tiny amount of primary hue tint into your grays:
* **Cool Gray System:** Add 3% blue tint to create a clean, scientific, architectural tone.
* **Warm Gray System:** Add 3% amber or yellow tint to evoke classic cream paper, card stock, and vintage books.

### Micro-interactions as Highlights

When using a monochromatic palette, user interaction requires subtle visual feedback. Instead of changing a button background to bright blue on hover, use micro-animations:
1. **Expanding borders:** A thin line expands beneath a header link.
2. **Opacity shifts:** Nav links transition from \`text-neutral-500\` to high-contrast black or white.
3. **Container shifts:** Cards rise slightly (\`-translate-y-0.5\`) using spring animation curves.

Monochrome design is not the absence of color; it is the discipline of clarity. It trusts your typography to tell the story.`
      },
      {
        author_id: lakshId,
        title: 'Designing APIs for Developer Ergonomics',
        slug: 'designing-apis-developer-ergonomics',
        excerpt: 'API design principles: clear response modeling, descriptive error payloads, RESTful consistency, and writing self-documenting endpoints.',
        cover_image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 68 * 24 * 60 * 60 * 1000), // 68 days ago
        content: `API design is user interface design for developers. Just as you wouldn't place random buttons in a signup form, you shouldn't structure your API endpoints based on accidental database structures or quick hacks. A great API is predictable, consistent, and provides descriptive context when something fails.

Here are the guiding principles we used to design the API layer inside InkDrop.

### I. Consistency in Response Formats

A client app should never guess whether an endpoint returns a flat object or a nested list. All successful endpoints should conform to a standard envelope format:

\`\`\`json
{
  "status": "success",
  "data": {
    "post": {
      "id": "post_123",
      "title": "Designing APIs",
      "slug": "designing-apis"
    }
  }
}
\`\`\`

### II. Descriptive Error Payloads

HTTP status codes (like 400, 403, or 500) are useful for gateways and routers, but they are not detailed enough for developers. When a request fails, your API should return a descriptive JSON payload explaining:
1. **What went wrong:** A clear developer message.
2. **Why it went wrong:** Validations that failed.
3. **How to fix it:** Suggesting the correct format.

\`\`\`ts
// A standard Express error handler returning structured JSON
import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const statusCode = err.statusCode || 500;
  console.error(\`[API ERROR] \${req.method} \${req.url}:\`, err);
  
  res.status(statusCode).json({
    status: 'error',
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred.',
      details: err.details || null
    }
  });
}
\`\`\`

### III. RESTful Consistency & Slugs

When designing resource routes, adhere strictly to plural nouns and standard HTTP verbs:
* \`GET /api/posts\` (Fetch list of posts)
* \`POST /api/posts\` (Create a new post)
* \`PATCH /api/posts/:id\` (Modify post properties)
* \`DELETE /api/posts/:id\` (Remove a post)

Avoid mixing actions inside resource paths (like \`POST /api/posts/create-post\`). The HTTP verb already conveys the action.

By focusing on API ergonomics, you reduce the integration time for front-end developers, eliminate client-side parsing bugs, and build a system that is a pleasure to build upon.`
      },
      {
        author_id: lakshId,
        title: 'The Evolution of Web Rendering: From Server to Client and Back Again',
        slug: 'evolution-web-rendering-server-client',
        excerpt: 'A historical and architectural analysis of server-side rendering, single-page applications, and the return to hybrid React Server Components.',
        cover_image_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 72 * 24 * 60 * 60 * 1000), // 72 days ago
        content: `Web application rendering has come full circle. In the early days of the web, rendering was entirely server-side. Databases populated templates, which were sent as flat HTML to the browser. As web applications grew more complex, we shifted to client-side rendering (CSR), moving the rendering work entirely to the browser. Today, we are witnessing a synthesis of both approaches: React Server Components (RSC).

### The First Era: Server-Side Templates
In the late 1990s and 2000s, tools like PHP, Ruby on Rails, and Django ruled the web. The request-response cycle was simple:
1. User clicks a link.
2. Server processes the request, queries the database, and constructs an HTML page.
3. Server sends the full HTML page back.
4. Browser renders the HTML and fetches static CSS/JS files.

This approach was fast for initial page loads and excellent for SEO. However, every page transition required a full browser reload, resulting in jarring flashes and sluggish user interactions.

### The Second Era: Single-Page Applications (SPA)
With the advent of AJAX and powerful client-side engines (Angular, React, Vue), we shifted to Single-Page Applications. The server's role was reduced to providing static JS/CSS bundles and acting as an API gateway.

The cycle changed to:
1. Browser loads an empty HTML shell with a single \`<div id="root">\` and a large JavaScript bundle.
2. The JavaScript bundle executes, takes over the DOM, and fetches data from the API.
3. The client renders the UI dynamically.

While this provided app-like, smooth user transitions, it introduced significant drawbacks: massive initial bundle sizes, poor SEO indexation, and slow first-contentful-paint (FCP) metrics.

### The Modern Era: Hybrid Server Components
React Server Components (RSC) represent a paradigm shift. Instead of forcing developers to choose between server-only or client-only rendering, RSC merges them:

\`\`\`ts
// A React Server Component that fetches data directly from the DB
import db from '@/db';

export default async function ProductList() {
  const products = await db.query('SELECT * FROM products LIMIT 10');
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} item={product} />
      ))}
    </div>
  );
}
\`\`\`

By rendering static components on the server and transmitting a lightweight JSON-like structure rather than raw HTML or massive JS bundles, we preserve SPA interactions while restoring instant initial load times and natural search engine indexing.`
      },
      {
        author_id: lakshId,
        title: 'Mastering Git: Interactive Rebase, Bisect, and Reflog',
        slug: 'mastering-git-rebase-bisect-reflog',
        excerpt: 'An advanced guide to Git internals, command-line mastery, rewriting history safely, and tracking down regressions with binary search.',
        cover_image_url: 'https://images.unsplash.com/photo-1556075798-482a134b1557?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 76 * 24 * 60 * 60 * 1000), // 76 days ago
        content: `Most developers know the basics of Git: add, commit, push, and pull. But Git is not just a backup tool—it is a powerful version control engine that allows you to sculpt your commit history, debug regressions with mathematical efficiency, and recover seemingly lost code.

### 1. Cleaning History with Interactive Rebase
A clean git history makes pull requests easy to review and code archeology simple. Before submitting a branch, you can squash temporary commits, reorder steps, and rewrite messages using:

\`\`\`bash
git rebase -i HEAD~4
\`\`\`

This opens an interactive editor listing your last 4 commits:

\`\`\`bash
pick e3f2d1a docs: update README
pick a4b8c9d feat: add image upload endpoint
pick f2c1b3a tmp: debug logs
pick c4d5e6f fix: fix filename validation
\`\`\`

By changing the action verb of the third commit from \`pick\` to \`squash\` (or \`s\`), you merge the debug commit directly into the feature commit, creating a clean, logical progress trail.

### 2. Hunting Regressions with Git Bisect
When a bug suddenly appears in your master branch but you don't know which of the last 100 commits caused it, don't waste hours checking out random branches. Use \`git bisect\` to run a binary search through history:

\`\`\`bash
git bisect start
git bisect bad                 # Mark the current commit as broken
git bisect good v1.2.0         # Mark the last known working release
\`\`\`

Git will check out a commit exactly in the middle of that range. You run your tests:
* If the tests pass, type \`git bisect good\`.
* If the tests fail, type \`git bisect bad\`.

Git splits the remaining pool in half and checks out the next candidate. In just $O(\\log N)$ steps—typically 6 or 7 iterations for 100 commits—Git pinpoint the exact commit that broke the code.

### 3. Recovering Lost Work with Git Reflog
If you force push (\`git push -f\`) or run a hard reset (\`git reset --hard\`) that deletes your local work, do not panic. Git rarely deletes objects immediately. It stores all local head updates in the reference log:

\`\`\`bash
git reflog
\`\`\`

This lists every state adjustment you've made, even across resets:

\`\`\`bash
8a4f9b2 HEAD@{0}: reset: moving to HEAD~1
f3c2b1a HEAD@{1}: commit: feat: implement draft save
\`\`\`

To restore the state before your reset, simply check out the reflog address:

\`\`\`bash
git checkout f3c2b1a
\`\`\`

By mastering these three advanced Git commands, you elevate yourself from a basic user to a version control architect.`
      },
      {
        author_id: lakshId,
        title: "Designing a Custom CSS System: Lessons from Tailwind's Internals",
        slug: 'designing-custom-css-system-tailwind',
        excerpt: "How utility-first CSS engines work under the hood: token processing, AST parsing, dynamic stylesheet generation, and browser caching.",
        cover_image_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000), // 80 days ago
        content: `Utility-first CSS, popularized by Tailwind, has changed how we build user interfaces. Instead of writing custom CSS classes (like \`.card-container\`) and managing massive stylesheets, developers write utilities (like \`flex p-4 border border-neutral-200\`) directly in HTML.

But how do these engines generate stylesheets under the hood?

### The Pure CSS Bottleneck
In the early days of web development, we loaded large pre-built stylesheets containing every utility. This meant files were massive—often over 3MB of class mappings that went unused.

Modern utility engines solve this through dynamic build-time extraction.

### The Extraction Pipeline
When you run a development or production build, the compiler processes your codebase in four steps:

1. **File Scanning:** The engine scans your source files (JSX, TSX, HTML) for matching utility class name tokens using regex patterns.
2. **AST Parsing:** It maps identified class tokens against a predefined design token theme (defining spacings, border widths, colors).
3. **CSS Generation:** The compiler generates raw CSS rules for only the class names found in your codebase.
4. **Style Sheet Injection:** The resulting minimal stylesheet is injected into the HTML document or packaged as a production asset.

\`\`\`ts
// A simplified extraction step mock
function generateUtilityCSS(className: string, theme: any): string | null {
  const spacingMatch = className.match(/^p-(\\d+)$/);
  if (spacingMatch) {
    const val = parseInt(spacingMatch[1]) * 0.25;
    return \`.\${className} { padding: \${val}rem; }\`;
  }
  return null;
}
\`\`\`

By parsing files and compiling only what is used, stylesheet sizes drop from megabytes to just a few kilobytes, ensuring near-instant page load times.`
      },
      {
        author_id: lakshId,
        title: 'Building a Scalable Notification Engine: Pub/Sub and WebSockets',
        slug: 'building-scalable-notification-engine',
        excerpt: 'System design for real-time notification architectures handling cross-channel deliveries, user state tracking, and fallback queues.',
        cover_image_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 84 * 24 * 60 * 60 * 1000), // 84 days ago
        content: `Notification systems are a critical part of modern user engagement. Whether it is a real-time post alert, an email summary, or a browser push alert, notification engines must deliver messages reliably and instantly without slowing down core application APIs.

### The Monolithic Pitfall
In a naive system, when a user publishes a post, the web server queries the followers list, iterates over each follower, and makes blocking API requests to email and push providers.

If the author has 10,000 followers, this request will time out, blocking the web server and crashing the client app.

### The Distributed Architecture
To handle scales, we decouple notification generation from delivery using asynchronous event-driven queues:

1. **Core API Server:** Publishes an event (e.g. \`post.published\`) to a message broker.
2. **Message Broker (Redis Pub/Sub or RabbitMQ):** Queues the event and acknowledges receipt to the API server immediately.
3. **Worker Microservices:** Consume the events asynchronously from the queue.
4. **WebSocket Gateway:** Checks if target users are online and pushes messages to active connections instantly.
5. **Fallback Services:** If the user is offline, workers send email or SMS alerts.

\`\`\`ts
// Worker dispatching notifications in the background
import { Queue } from 'bullmq';

const notificationQueue = new Queue('notifications');

async function triggerPostNotification(postId: string, authorId: string) {
  await notificationQueue.add('dispatch', {
    postId,
    authorId,
    timestamp: new Date()
  });
}
\`\`\`

By delegating deliveries to background tasks, your main application server remains responsive, ensuring users experience zero latency during interactions.`
      },
      {
        author_id: lakshId,
        title: "The Pragmatic Programmer's Guide to TypeScript Types",
        slug: 'pragmatic-guide-typescript-types',
        excerpt: 'Moving beyond interfaces: a deep dive into conditional types, mapped types, template literal types, and type-level utility programming.',
        cover_image_url: 'https://images.unsplash.com/photo-1516116211223-4c5997634f19?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 88 * 24 * 60 * 60 * 1000), // 88 days ago
        content: `TypeScript has become the default language for modern web development. However, many developers limit their usage of TypeScript to simple types and basic interfaces. The real power of TypeScript lies in its advanced type system, which acts as a static compile-time validator for complex data states.

Let's explore key utilities that will make your type structures more expressive.

### 1. Mapped Types
Mapped types allow you to create new type definitions based on existing ones. If you want to make all properties of a post configuration optional and nullable, you can map over its keys:

\`\`\`ts
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

interface PostConfig {
  theme: 'dark' | 'light';
  showAuthors: boolean;
  maxWords: number;
}

type LooseConfig = Nullable<PostConfig>;
// Result: { theme: 'dark' | 'light' | null; showAuthors: boolean | null; ... }
\`\`\`

### 2. Conditional Types
Conditional types let you define types that resolve differently based on type assertions:

\`\`\`ts
type IsString<T> = T extends string ? true : false;

type A = IsString<string>; // true
type B = IsString<number>; // false
\`\`\`

### 3. Template Literal Types
Introduced in TypeScript 4.1, template literal types allow you to manipulate string patterns statically:

\`\`\`ts
type Direction = 'top' | 'right' | 'bottom' | 'left';
type PaddingClass = \`p-\${Direction}\`;
// Result: 'p-top' | 'p-right' | 'p-bottom' | 'p-left'
\`\`\`

By writing expressive types, you detect bugs during editing in your IDE rather than encountering runtime errors on production servers.`
      },
      {
        author_id: lakshId,
        title: 'Web Security Foundations: CSP, CORS, and SameSite Cookies',
        slug: 'web-security-foundations-csp-cors-samesite',
        excerpt: 'How to secure modern web clients against XSS, CSRF, and data leakage by mastering browser security policies and headers.',
        cover_image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 92 * 24 * 60 * 60 * 1000), // 92 days ago
        content: `Frontend security is often overlooked by developers, who assume that servers handle all defenses. However, browsers have complex sandbox boundaries that must be configured using HTTP headers to prevent Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF).

### 1. Content-Security-Policy (CSP)
A CSP defines which domains the browser is allowed to fetch scripts, styles, and images from. This is the single most effective defense against XSS injections:

\`\`\`http
Content-Security-Policy: default-src 'self'; script-src 'self' https://apis.google.com;
\`\`\`

By disabling inline scripts (\`<script>alert(1)</script>\`) and enforcing trusted source origins, you prevent malicious actors from executing hijacked code in your user's sessions.

### 2. Cross-Origin Resource Sharing (CORS)
CORS is a browser mechanism that blocks web pages from making requests to an API running on a different domain unless the API server explicitly permits it.

A common developer mistake is setting the origin header to a wildcard in production:

\`\`\`http
Access-Control-Allow-Origin: *
\`\`\`

This allows any malicious website to run authenticated credentials fetches against your API from a user's browser. Always set this to explicit origins:

\`\`\`http
Access-Control-Allow-Origin: https://inkdrop.app
\`\`\`

### 3. SameSite Cookie Attributes
To protect cookies against CSRF attacks—where another website triggers a request using your logged-in session—configure the \`SameSite\` attribute:

* **Strict:** Cookies are never sent on cross-site requests.
* **Lax:** Cookies are sent on standard navigation transitions but blocked on cross-site subresource queries (like images or form submissions).
* **None:** Cookies are sent everywhere, but require the \`Secure\` flag (HTTPS only).

By applying these security headers, you build a resilient frontend sandbox that keeps user sessions safe.`
      },
    ];

    const extraPosts = [
      {
        author_id: lakshId,
        title: 'Designing for Astigmatism and Visual Accessibility in Web Apps',
        slug: 'designing-astigmatism-visual-accessibility',
        excerpt: 'How standard dark modes can trigger halos and visual fatigue for users with astigmatism, and how to build high-contrast, accessible visual containers.',
        cover_image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000), // 95 days ago
        content: `Many developers design dark modes by simply replacing white backgrounds with pure black (#000000) and using bright, pure white (#ffffff) text. While this satisfies raw color contrast math, it creates a severe visual problem known as "halation" or the halo effect, particularly for the 30% to 40% of users who have some degree of astigmatism.

When high-contrast light text is displayed on an absolute black background, the light spreads across the user's retina, making the text look blurry or shadowed.

### The Science of Halation

For a eye with astigmatism, the cornea is curved more like a football than a basketball. This uneven curvature prevents light from focusing sharply on a single point on the retina. Instead, light rays scatter. On absolute black surfaces, the pupil dilates to let in more light, causing high-contrast white text to bleed over the dark boundaries, creating visual halos and causing rapid ocular fatigue.

### Designing Resilient Dark Modes

1. **Mute the Background:** Use dark grays, slate, or charcoal (e.g. \`#0f1015\` or \`#121214\`) instead of pure black. This reduces the extreme contrast threshold while keeping the display dark and energy-efficient.
2. **Soft-Toned Text:** Choose off-white or light neutral tones (\`#e4e4e7\` or \`#d4d4d8\`) instead of pure white (\`#ffffff\`).
3. **Increase Font Weight:** Thin fonts are particularly prone to disappearing or blurring on dark backgrounds. Use slightly heavier font weights (\`medium\` or \`font-semibold\`) for body text in dark mode.
4. **Generous Line Spacing:** Boost line height to \`1.7\` or \`1.8\` and increase letter spacing slightly to prevent characters from blending together.

\`\`\`css
/* Muted dark mode variables */
:root {
  --bg-dark: #0f1015;
  --text-dark: #e4e4e7;
  --line-height-prose: 1.75;
  --letter-spacing-body: 0.015em;
}
\`\`\``
      },
      {
        author_id: lakshId,
        title: 'The Power of SVG Animation: Building Smooth Micro-Interactions',
        slug: 'power-svg-animation-micro-interactions',
        excerpt: 'Deep-dive into animating Scalable Vector Graphics using CSS paths, stroke dashes, and spring-physics keyframes for responsive UI interfaces.',
        cover_image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 98 * 24 * 60 * 60 * 1000), // 98 days ago
        content: `Vector graphics are the ideal asset class for modern, high-density displays. Since SVGs are represented as mathematical instructions rather than fixed bitmap grids, they scale infinitely with zero pixelation. However, SVGs are not just static drawings; they are fully integrated into the browser's Document Object Model (DOM), meaning we can animate them using CSS and Javascript.

### Under the Hood: Stroke Dasharray and Dashoffset

One of the most powerful visual tricks in modern vector animation is the "drawing effect," where lines appear to write themselves on the screen. This is achieved by combining two CSS properties: \`stroke-dasharray\` and \`stroke-dashoffset\`.

* \`stroke-dasharray\`: Splits a solid outline into a pattern of dashes and gaps.
* \`stroke-dashoffset\`: Defines the starting position of that dash pattern.

By setting both properties to the exact total length of the SVG path, and then animating \`stroke-dashoffset\` down to zero, we create a beautiful line drawing motion:

\`\`\`css
/* CSS keyframes for drawing path stroke outlines */
@keyframes drawPath {
  from {
    stroke-dashoffset: 1000;
  }
  to {
    stroke-dashoffset: 0;
  }
}

.animated-vector-path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawPath 2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
\`\`\`

### Optimizing Vector Performance

When animating complex vector groups, browsers must perform layout calculations and pixel paints on every frame. To prevent screen jitter and maintain a smooth 60fps refresh rate:
- **Avoid Heavy Filters:** Drop shadows and Gaussian blur filters inside SVGs require massive CPU processing power. Use pure color gradients instead.
- **Hardware Acceleration:** Apply \`transform: translate3d(0, 0, 0)\` or \`will-change: transform\` to animated SVG layers to push rendering tasks directly to the GPU.`
      },
      {
        author_id: lakshId,
        title: 'Mastering JWT Security: Best Practices for Token Rotation',
        slug: 'mastering-jwt-security-token-rotation',
        excerpt: 'Securing serverless web authentication: stateless access tokens, secure database refresh cookies, token rotation, and preventing XSS/CSRF token theft.',
        cover_image_url: 'https://images.unsplash.com/photo-1633265487749-43dbbebdc626?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 102 * 24 * 60 * 60 * 1000), // 102 days ago
        content: `JSON Web Tokens (JWTs) have become the industry standard for serverless authentication. They allow servers to verify user identities statelessly without making a database query on every incoming HTTP request. However, this stateless convenience introduces a critical vulnerability: if an access token is intercepted, it remains valid until its expiration timestamp is reached, with no native way to revoke it.

To mitigate this risk, we must employ a dual-token architecture consisting of short-lived Access Tokens and stateful, rotating Refresh Tokens.

### Token Storage Strategy

Where you store tokens in the browser dictates your susceptibility to security exploits:
- **Access Tokens in Memory:** Keep the access token inside React state or local memory. It will disappear on tab reload, but it is completely safe from cross-site scripting (XSS) extraction.
- **Refresh Tokens in HttpOnly Cookies:** Store the refresh token in an HTTP-only, secure cookie with the \`SameSite=Lax\` flag. This prevents JavaScript from reading the token, neutralizing XSS thefts, and protects against Cross-Site Request Forgery (CSRF).

### Implementing Refresh Token Rotation

To prevent replay attacks—where an attacker steals a refresh token and uses it to maintain persistent access—we implement token rotation. Every time a refresh token is exchanged for a new access token, the old refresh token is invalidated, and a brand new refresh token is issued to the client.

If the server detects an exchange request using a *previously used* refresh token, it indicates that a theft has occurred. In response, the server instantly invalidates the entire session tree for that user, forcing a full logout across all active devices:

\`\`\`typescript
// Session reuse checking inside our Express middleware
async function handleTokenRefresh(req: Request, res: Response) {
  const { refreshToken } = req.cookies;
  const tokenRecord = await db.query('SELECT * FROM refresh_tokens WHERE token = $1', [refreshToken]);
  
  if (tokenRecord.rows[0]?.is_used) {
    // Security breach detected! Revoke all tokens for this user family
    await db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [tokenRecord.rows[0].user_id]);
    res.clearCookie('refreshToken');
    return res.status(403).json({ error: "Replay attack detected. Session revoked." });
  }
  
  // Mark token as used, generate new family, and send to cookie
}
\`\`\``
      },
      {
        author_id: lakshId,
        title: 'Why We Avoid Tailwind CSS in Large-Scale Design Systems',
        slug: 'why-we-avoid-tailwind-large-design-systems',
        excerpt: 'An engineering and architecture critique of inline utility bloat, and why modular vanilla CSS with design tokens offers superior styling isolation.',
        cover_image_url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 105 * 24 * 60 * 60 * 1000), // 105 days ago
        content: `Tailwind CSS has taken the web development community by storm, and for good reason: it accelerates initial prototyping, eliminates naming exhaustion, and keeps CSS files small. However, as software applications scale into large enterprise ecosystems with multi-team design systems, the utility-first approach begins to show structural limitations.

At InkDrop, we chose to move away from utility inline styling in favor of structured vanilla CSS powered by custom design tokens. Here is why.

### The Readability and Maintenance Tax

The most immediate issue with Tailwind is inline visual clutter. In a complex component with responsive states, hover styles, dark mode adjustments, and flex layouts, a single element's class list can easily stretch to 30 or 40 utility classes:

\`\`\`html
<!-- Inline markup layout clutter with utility classes -->
<div class="flex flex-col md:flex-row items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:shadow-md transition-all duration-300 gap-4 max-w-4xl mx-auto focus-within:ring-2 focus-within:ring-black">
  ...
</div>
\`\`\`

When scanning components during a refactor, it is incredibly difficult to separate structural markup boundaries from raw styling details. This slows down visual debugging and increases cognitive load.

### Scaling Themes and Customization

When building reusable component packages that need to be shared across multiple different sub-brands, utility classes lock the style rules directly into the component's HTML structure. 

By utilizing native CSS custom properties (variables) combined with structured CSS modules, we decouple the layout rules from the style attributes, allowing sub-brands to completely customize appearances simply by injecting a different theme variable file:

\`\`\`css
/* Reusable card structure using vanilla CSS variables */
.editorial-card {
  padding: var(--spacing-md);
  background-color: var(--color-surface);
  border: var(--border-width-thin) solid var(--color-border);
  transition: transform var(--transition-speed-smooth) ease;
}
\`\`\``
      },
      {
        author_id: lakshId,
        title: 'The Psychology of Visual Hierarchy: Controlling User Attention',
        slug: 'psychology-visual-hierarchy-user-attention',
        excerpt: 'How typographic weight, scale mapping, negative space density, and reading patterns (F and Z-shapes) dictate how users consume information.',
        cover_image_url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000), // 110 days ago
        content: `When a user lands on a webpage, they don't read every word from top to bottom. Instead, they perform a rapid visual scan lasting less than two seconds, deciding whether to stay or leave. Visual hierarchy is the deliberate organization of elements on a page to guide this scanning pattern, ensuring the most critical information is absorbed first.

By understanding visual psychology, we can control how the reader's eyes travel across our publication.

### Scanning Patterns: F and Z Shapes

Eye-tracking studies reveal that users scan screens in two distinct patterns based on content density:
- **The F-Shape Pattern:** Typically occurs on text-heavy pages like blog posts or documentation. The reader starts at the top, scans horizontally across the header, drops down slightly, scans a shorter horizontal row, and then tracks straight down the left margin, forming an "F".
- **The Z-Shape Pattern:** Occurs on visual-heavy pages like landing pages. The eye moves from top-left to top-right, cuts diagonally down to the bottom-left, and then scans across to the bottom-right.

### Typographic Anchoring

To make a page scan-friendly, you must insert typographic anchors that disrupt the default scanning motion, capturing attention:
1. **Typographic Scale:** Headers must be at least double the size of the body prose to serve as clean visual breaks.
2. **Color Density:** Use high-contrast headings (\`text-neutral-900\` on white) and low-contrast details (\`text-neutral-400\`) to tell the reader what is primary and what is secondary.
3. **White Space Framing:** Surround critical elements (like a newsletter input field or a call to action) with deep negative space. The lack of noise naturally draws the eye to the isolated object.

Visual design is not about making things look pretty; it is the discipline of mapping user attention. Design with intentional hierarchy, and your readers will follow.`
      },
      {
        author_id: lakshId,
        title: 'The Art of Clean Coding: Decoupling and Pure Functions',
        slug: 'art-clean-coding-decoupling-pure-functions',
        excerpt: 'Understanding the mathematics of code quality: how pure functions, single responsibilities, and immutable data reduce developer errors and technical debt.',
        cover_image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
        is_published: true,
        published_at: new Date(Date.now() - 115 * 24 * 60 * 60 * 1000), // 115 days ago
        content: `In computer programming, clean code is code that is easy to read, test, and maintain. Many developers believe that clean coding is an artistic style or a matter of personal preference. In reality, clean code is a set of formal engineering principles designed to minimize the complexity of software systems.

At the heart of this discipline are two mathematical concepts: pure functions and structural decoupling.

### The Power of Pure Functions

A function is considered pure if it satisfies two conditions:
1. **Determinism:** It always returns the exact same output for the same input.
2. **No Side Effects:** It does not modify any state or variables outside of its own block.

Because pure functions do not depend on external variables, they are incredibly easy to reason about and test in isolation:

\`\`\`typescript
// A pure calculation function
const calculateReadingTime = (wordsCount: number, speedWPM: number): number => {
  return Math.max(1, Math.ceil(wordsCount / speedWPM));
};
\`\`\`

By writing core business calculations as pure functions, you eliminate transient bugs caused by shared state modification and make your application logic predictable.`
      }
    ];

    const postsData = [...originalPostsData, ...extraPosts];


    
    for (const post of postsData) {
      await client.query(`
        INSERT INTO posts (author_id, title, slug, content, excerpt, cover_image_url, is_published, published_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        post.author_id,
        post.title,
        post.slug,
        post.content,
        post.excerpt,
        post.cover_image_url,
        post.is_published,
        post.published_at
      ]);
    }
    
    console.log(`✓ Inserted ${postsData.length} seed posts`);
    
    await client.query('COMMIT');
    console.log('✅ Database seeded successfully with expanded content!');
    
    console.log('\n🔐 SEED USER LOGIN DETAILS:');
    console.log('--------------------------------------------------');
    console.log('1. User: laksh (Lead Dev)');
    console.log('   Email:    laksh@inkdrop.app');
    console.log('   Password: password123');
    console.log('--------------------------------------------------');
    console.log('2. User: dieter (Design Visionary)');
    console.log('   Email:    dieter@inkdrop.app');
    console.log('   Password: password123');
    console.log('--------------------------------------------------');
    console.log('3. User: helena (Typography Expert)');
    console.log('   Email:    helena@inkdrop.app');
    console.log('   Password: password123');
    console.log('--------------------------------------------------');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);
