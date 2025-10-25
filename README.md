# 🔷 Holocron

> *"The Force is what gives a Jedi his power. It's an energy field created by all living things. It surrounds us and penetrates us; it binds the galaxy together."*
>
> Just as the ancient Jedi and Sith preserved their knowledge in holocrons, you too can safeguard your thoughts, tasks, and wisdom in this personal, encrypted repository of knowledge.

**Holocron** is a local-first, encrypted note-taking and task management application. Like the mystical devices of old, it requires no connection to the galaxy's network—your knowledge remains yours alone, protected and private.

---

## 📜 The Lore

In the Star Wars universe, a **holocron** is a sophisticated information storage device used by both the Jedi Order and the Sith to preserve knowledge, teachings, and secrets. These ancient artifacts could only be opened by those strong in the Force, ensuring that the wisdom within remained protected.

### The Jedi Path (Light Side Features)
- **Mindful Note-Taking**: Capture your thoughts and insights with a rich text editor
- **Organized Knowledge**: Structure your notes in yearly hierarchies, just as the Jedi Archives were organized
- **Collaborative Sync**: Share your wisdom across devices through Git synchronization
- **Templates**: Use pre-defined structures for consistent knowledge capture
- **Peaceful Offline Work**: No external dependencies or cloud services required

### The Sith Code (Dark Side Power)
- **Encryption**: Your secrets are protected with local encryption (passphrase-based)
- **Complete Control**: No corporate overlords tracking your thoughts
- **Portable Knowledge**: Your holocron follows you—install it as a PWA on any device
- **Task Domination**: Mini-kanban boards to conquer your projects
- **Freedom from the Cloud**: Local-first architecture means YOU control your data

Like the balance of the Force, Holocron gives you the best of both paths—the Jedi's organization and sharing capabilities with the Sith's fierce protection of secrets.

---

## ✨ Features

### 📝 Note Management
- **Rich Text Editor** powered by Tiptap
  - Markdown support with live preview
  - Code blocks with syntax highlighting
  - Tables, task lists, and formatting
  - Internal note linking (force connections)
  - Drag-and-drop functionality

### 🎯 Task Management
- **Mini-Kanban Boards**
  - Multiple boards for different projects
  - Drag-and-drop task organization
  - Custom columns and workflows
  - Board icons and emojis
  - Persistent state with auto-save

### 🔐 Security & Privacy
- **Local-First Architecture**
  - All data stored on your machine
  - No external APIs or telemetry
  - No cloud dependency
  - Passphrase-based repository unlocking

### 🔄 Git Integration
- **Built-in Version Control**
  - Automatic Git repository initialization
  - Commit, pull, and push from UI
  - Branch management
  - Auto-sync capabilities
  - Conflict resolution

### 📱 Progressive Web App (PWA)
- **Install Anywhere**
  - Desktop installation (Windows, macOS, Linux)
  - Mobile installation (iOS, Android)
  - Offline functionality
  - Native app-like experience
  - Fast loading with aggressive caching

### 🎨 Modern UI
- **Beautiful Design**
  - shadcn/ui components
  - Tailwind CSS styling
  - Dark mode ready
  - Gradient glows and animations
  - Rajdhani font for that sci-fi aesthetic

### 📋 Templates
- **Pre-built Note Types**
  - Meeting notes
  - Project plans
  - Daily journals
  - Custom templates
  - Frontmatter support

---

## 🚀 Getting Started

### Prerequisites

Before you begin your journey as a Keeper of Knowledge, ensure you have:

- **Node.js** 20+ (the Force of modern JavaScript)
- **pnpm** package manager (recommended) or npm
- **Git** installed on your system

### Installation

```bash
# Clone the holocron repository
git clone https://github.com/yourusername/holocron.git
cd holocron

# Install dependencies
pnpm install

# The holocron awaits...
```

---

## 🌐 Running as a Web Application

### Development Mode

Perfect for local use and development:

```bash
pnpm dev
```

Then open your browser to:
```
http://localhost:3000
```

**What happens in dev mode:**
- Hot reloading enabled
- PWA features disabled (for faster iteration)
- Full development tools available
- Service workers not active

### Production Mode

For the full experience with optimizations:

```bash
# Build the application
pnpm build

# Start the production server
pnpm start
```

Then navigate to:
```
http://localhost:3000
```

**What happens in production:**
- Optimized bundle sizes
- PWA features enabled
- Service worker active
- Aggressive caching

---

## 📱 Installing as a PWA (Progressive Web App)

The true power of Holocron is unleashed when installed as a native application. The PWA allows you to carry your knowledge holocron with you across all devices.

### Desktop Installation (Chrome, Edge, Brave)

1. **Build and run in production mode:**
   ```bash
   pnpm build
   pnpm start
   ```

2. **Open in your browser:**
   ```
   http://localhost:3000
   ```

3. **Look for the install icon** in your address bar (usually a ⊕ or computer icon)

4. **Click "Install"** or navigate to:
   - Chrome: Menu → "Install Holocron..."
   - Edge: Menu → Apps → "Install this site as an app"

5. **Holocron now appears as a native app:**
   - In your Applications folder (macOS)
   - In your Start Menu (Windows)
   - In your app launcher (Linux)

### Mobile Installation (iOS Safari)

1. **Visit Holocron** in Safari (production mode required)

2. **Tap the Share button** (square with arrow pointing up)

3. **Scroll down and tap "Add to Home Screen"**

4. **Name your holocron** and tap "Add"

5. **Your holocron appears on your home screen** like any native app

### Mobile Installation (Android Chrome)

1. **Visit Holocron** in Chrome (production mode required)

2. **Tap the menu** (three dots)

3. **Select "Add to Home screen"** or "Install app"

4. **Confirm installation**

5. **Holocron appears in your app drawer** and home screen

### PWA Features When Installed

✅ **Standalone window** - No browser UI, feels like a native app
✅ **App icon** - Custom Holocron icon in your dock/taskbar
✅ **Offline access** - Continue working without internet
✅ **Fast loading** - Cached resources load instantly
✅ **Auto-updates** - Service worker updates automatically
✅ **Native experience** - System notifications ready
✅ **Quick actions** - App shortcuts for "New Note"

---

## 📖 First-Time Setup

When you first open Holocron, you'll be guided through the Setup Wizard:

### Step 1: Choose Your Repository

**Option A: Create New Repository**
1. Click "Select Directory"
2. Choose where to store your knowledge
3. Holocron initializes a Git repository
4. Creates folder structure automatically

**Option B: Use Existing Repository**
1. Click "Select Directory"
2. Navigate to your existing notes repo
3. Holocron detects the existing structure
4. You're ready to go!

### Step 2: Set Your Passphrase (Optional)

- Enter a passphrase to unlock your holocron
- Used for local authentication
- Not currently used for encryption (future feature)
- Can be changed in settings

### Step 3: Configure Git (Optional)

If you want to sync across devices:
1. Go to Settings → Git Configuration
2. Enter your Git credentials
3. Configure remote repository URL
4. Enable auto-sync if desired

---

## 🎯 Usage Guide

### Creating Notes

1. **Quick Note**: Click the "+ New" button in the sidebar
2. **From Template**: Click the template selector in the header
3. **Start Typing**: Notes auto-save every 2 seconds

### Organizing Notes

Notes are automatically organized by date:
```
notes/
  2025/
    01/
      15/
        my-note-title.md
        another-note.md
```

### Using Kanban Boards

1. **Create a Board**: Click "Board Management" → "New Board"
2. **Name Your Board**: Give it a name and optional icon
3. **Add Tasks**: Click "+" in any column
4. **Drag & Drop**: Move tasks between columns
5. **Auto-Sync**: Changes save automatically

### Syncing with Git

**Manual Sync:**
- Click the Git icon in the header
- View changes, commit message preview
- Click "Sync" to commit and push

**Auto-Sync:**
- Enable in Settings → Git
- Set your preferred interval
- Holocron syncs automatically in the background

---

## 🛠️ Configuration

### Settings Menu

Access via the ⚙️ icon in the header:

- **Repository Settings**: Change repo location, reinitialize
- **Git Configuration**: Username, email, remote URL
- **Auto-Sync Settings**: Enable/disable, set interval
- **Theme Settings**: Light/dark mode (coming soon)
- **Editor Preferences**: Font size, line height, etc.

### Environment Variables

Create a `.env.local` file for custom configuration:

```env
# Custom port (default: 3000)
PORT=3000

# Development mode
NODE_ENV=development
```

---

## 🏗️ Project Structure

```
holocron/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── fs/           # File system operations
│   │   ├── git/          # Git operations
│   │   ├── notes/        # Note CRUD
│   │   ├── kanban/       # Board operations
│   │   └── config/       # Configuration
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main application
├── components/            # React components
│   ├── editor/           # Tiptap editor
│   ├── git/              # Git UI
│   ├── kanban/           # Kanban boards
│   ├── notes/            # Notes sidebar
│   ├── settings/         # Settings dialog
│   ├── setup/            # Setup wizard
│   ├── templates/        # Template system
│   └── ui/               # shadcn/ui components
├── contexts/              # React contexts
│   ├── RepoContext.tsx   # Repository state
│   └── SettingsContext.tsx
├── lib/                   # Utilities
│   ├── kanban/           # Kanban logic
│   ├── notes/            # Note utilities
│   └── templates/        # Template definitions
├── public/                # Static assets
│   ├── manifest.json     # PWA manifest
│   ├── icon-*.png        # App icons
│   └── tesseract.png     # Logo
├── CLAUDE.md             # Development workflow
├── next.config.ts        # Next.js + PWA config
├── tailwind.config.ts    # Tailwind config
└── package.json          # Dependencies
```

---

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test --watch
```

Test coverage includes:
- Crypto functions
- Git operations
- Note schema validation
- Kanban logic

---

## 🔧 Development

### Tech Stack

- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Editor**: Tiptap (ProseMirror-based)
- **Git**: isomorphic-git
- **PWA**: @ducanh2912/next-pwa
- **Build**: Webpack (required for PWA)

### Development Workflow

According to `CLAUDE.md`:

1. **Always create a new branch** for features
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make small, atomic commits**
   ```bash
   git commit -m "feat: add new feature"
   ```

3. **Test before pushing**
   ```bash
   pnpm test
   pnpm build
   ```

4. **No external APIs or telemetry**
   - Keep it local-first
   - No tracking, no analytics
   - User privacy is paramount

### Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable releases |
| `dev` | Active feature integration |
| `feature/*` | Individual features |

---

## 📦 Building for Production

### Standard Web App

```bash
# Build optimized bundle
pnpm build

# Output in .next/ directory
# Deploy to any Node.js hosting
```

### Local Desktop App

Since this is local-first, the recommended deployment is:

```bash
# Build once
pnpm build

# Run locally
pnpm start

# Access at http://localhost:3000
# Install as PWA for best experience
```

### Portable Installation

You can package Holocron for sharing:

```bash
# Clone repo
git clone https://github.com/yourusername/holocron.git

# Install and build
cd holocron
pnpm install
pnpm build

# Share the entire folder
# Recipients run: pnpm start
```

---

## 🤝 Contributing

Holocron welcomes contributions from Jedi and Sith alike!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please follow the coding standards in `CLAUDE.md`.

---

## 🐛 Troubleshooting

### PWA Not Installing

**Problem**: Install button doesn't appear in browser

**Solutions**:
- Make sure you're running in production mode (`pnpm build && pnpm start`)
- PWA is disabled in development mode by design
- Use HTTPS or localhost (required for PWA)
- Try Chrome/Edge (best PWA support)

### Git Operations Failing

**Problem**: Can't commit or push changes

**Solutions**:
- Configure Git username/email in Settings
- Check remote repository credentials
- Ensure you have write access to the remote
- Verify your Git remote URL is correct

### Notes Not Saving

**Problem**: Changes aren't persisted

**Solutions**:
- Check repository path is writable
- Ensure disk space is available
- Check browser console for errors
- Try reinitializing the repository

### Build Errors

**Problem**: `pnpm build` fails

**Solutions**:
- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `pnpm install`
- Ensure Node.js 20+ is installed
- Check for TypeScript errors: `pnpm tsc --noEmit`

---

## 📄 License

This project is private and not currently licensed for public use.

---

## 🙏 Acknowledgments

- **shadcn/ui** - Beautiful component library
- **Tiptap** - Powerful rich text editor
- **isomorphic-git** - Pure JavaScript Git implementation
- **Next.js Team** - Amazing framework
- **George Lucas** - For the Star Wars universe and the holocron concept

---

## 🌟 May the Force Be With You

*"Your focus determines your reality."* - Qui-Gon Jinn

Keep your knowledge safe, your tasks organized, and your thoughts encrypted. The holocron is your ally in the eternal quest for productivity and wisdom.

---

**Built with ❤️ and the Force**

For issues, questions, or holocron wisdom, open an issue on GitHub.
