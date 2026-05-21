# InkDrop Project Context & Handoff Summary

This document serves as the master context and handoff guide for the **InkDrop** blogging platform. It is designed to be read by a new AI assistant session to restore context immediately, minimize token usage, and outline the exact steps required to complete the outstanding features.

---

## 1. Project Overview & Tech Stack
InkDrop is a minimal, print-inspired, distraction-free technical blogging platform and CMS.

- **Frontend**: React (Vite) + Tailwind CSS + TypeScript.
  - Core routes: `HomePage.tsx` (featured post + list), `PostPage.tsx` (prose reader with controls), `EditorPage.tsx` (split writing workspace), `LoginPage.tsx`, `RegisterPage.tsx`, `DraftsPage.tsx`.
- **Backend**: Express + Node.js + TypeScript + PostgreSQL (Neon Serverless).
  - Handles authentication (JWT access token + database-persisted refresh token rotation).
  - Handles image uploads directly to **Cloudinary** using **Multer**.
- **Database**: Neon serverless Postgres with transient-error connection retry handling.
- **Fonts & CSS**: *Outfit* (sans-serif UI) & *Lora* (serif prose), styled using vanilla CSS layers and custom Tailwind configurations.

---

## 2. Completed Milestones (What is Done)
- **Database Resilience**: Configured backend query pool retries for transient Neon DB cold starts.
- **Cloudinary Upload System**: Created a working backend middleware route for uploading images and retrieving secure URLs. Connected frontend forms (cover image dropzone and inline image buttons) to this pipeline.
- **Luxury Minimalist UI Overhaul**: Redesigned all forms (login, sign-up) using glassmorphic card overlays, centered layouts, custom cursor highlights, and high-performance Tailwind gradients.
- **Reader Adjustments**: Added typography control panels (sans vs serif, text sizes) and canvas width controls (`narrow`, `standard`, `full`) to `PostPage.tsx` and `EditorPage.tsx`.
- **Expanded seed.ts Draft**: Appended a large library of technical blog posts under the author `laksh` (discussing design systems, AST parsers, database connection pooling, typography, visual psychology, and SVG animations) to prevent placeholder slop.

---

## 3. Immediate Next Steps & Unfinished Work
To fulfill the user's latest request, the next agent must complete the following items:

### Step A: Run Database Seeding
Execute the seed script to clean out older, low-quality test accounts/posts and establish the premium articles written under `laksh` (username: `laksh`).
- **Command to run**: `npm run db:seed` in the `backend/` directory.

### Step B: Implement Split-Screen Resizing in `EditorPage.tsx`
The user pointed out that the split-pane ("flint print") mode has sizing/utilization issues. You need to implement left/right arrow controls in split-screen mode to adjust how much screen space the editor takes vs the markdown preview.
1. **File to modify**: [EditorPage.tsx](file:///c:/Users/LAKSH%20AGRAWAL/Desktop/VSCode/Hackathons%20or%20Something/InkDrop/frontend/src/pages/EditorPage.tsx).
2. **State to add**:
   ```tsx
   // '30/70' (editor 30%, preview 70%) up to '70/30' (editor 70%, preview 30%)
   const [splitRatio, setSplitRatio] = useState<'30/70' | '40/60' | '50/50' | '60/40' | '70/30'>(() => {
     const saved = localStorage.getItem('inkdrop-editor-split-ratio');
     return (saved as any) || '50/50';
   });
   ```
3. **Persist state**: Add a `useEffect` storing `splitRatio` inside `localStorage` (`inkdrop-editor-split-ratio`).
4. **Interactive Controls UI**:
   - In the editor header bar, when `viewMode === 'split'`, render an adjuster component:
     - Left Arrow (`←`): Shifts pane divider left (shrinking the editor pane, expanding the preview pane).
     - Label display: `30/70`, `40/60`, `50/50`, etc.
     - Right Arrow (`→`): Shifts pane divider right (expanding the editor pane, shrinking the preview pane).
5. **Grid Column Styling**:
   - Translate the `splitRatio` state to an inline style `gridTemplateColumns` or custom CSS style.
   - For example:
     - `30/70` -> `gridTemplateColumns: '3fr 7fr'`
     - `40/60` -> `gridTemplateColumns: '4fr 6fr'`
     - `50/50` -> `gridTemplateColumns: '1fr 1fr'`
     - `60/40` -> `gridTemplateColumns: '6fr 4fr'`
     - `70/30` -> `gridTemplateColumns: '7fr 3fr'`
   - Ensure the outer split container has `transition-all duration-300 ease-in-out` for smooth movement when adjusting the split ratio.

### Step C: Verify Compile & Execution
- Run `npm run build` in the `frontend/` directory to make sure there are no TypeScript compile-time errors.
- Test the split ratios manually by editing a post and clicking the arrows.

---

## 4. Current File Paths & Reference Links
- Backend seed script: [seed.ts](file:///c:/Users/LAKSH%20AGRAWAL/Desktop/VSCode/Hackathons%20or%20Something/InkDrop/backend/src/db/seed.ts)
- Markdown editor page: [EditorPage.tsx](file:///c:/Users/LAKSH%20AGRAWAL/Desktop/VSCode/Hackathons%20or%20Something/InkDrop/frontend/src/pages/EditorPage.tsx)
- Frontend index stylesheet: [index.css](file:///c:/Users/LAKSH%20AGRAWAL/Desktop/VSCode/Hackathons%20or%20Something/InkDrop/frontend/src/index.css)
- Database schema and connection: [index.ts](file:///c:/Users/LAKSH%20AGRAWAL/Desktop/VSCode/Hackathons%20or%20Something/InkDrop/backend/src/db/index.ts)
