# 🔷 Holocron

> *"The Force is what gives a Jedi his power. It's an energy field created by all living things. It surrounds us and penetrates us; it binds the galaxy together."*
>
> Just as the ancient Jedi and Sith preserved their knowledge in holocrons, you too can safeguard your thoughts, tasks, and wisdom in this personal, encrypted repository of knowledge.

**Holocron** is a local-first, encrypted note-taking and task management application. Like the mystical devices of old, it requires no connection to the galaxy's network—your knowledge remains yours alone, protected and private.

---

## ⚡ Quick Start Commands

```bash
# Development (Turbopack - ultra-fast hot reload, no PWA)
pnpm dev                  # → http://localhost:3000

# Production (Full PWA support with service worker)
pnpm build               # Build optimized bundle + generate service worker
pnpm start               # → http://localhost:3000 (install as PWA here!)

# Testing
pnpm test                # Run all tests
pnpm test --watch        # Watch mode for TDD

# Clean build (if issues occur)
rm -rf .next && pnpm build
```

**Key Points:**
- 🚀 **Dev mode** (`pnpm dev`) = Fast development with Turbopack, NO PWA
- 📱 **Production mode** (`pnpm build` + `pnpm start`) = Full PWA with offline support
- ⚠️ **PWA install only works in production mode** - you must build first!

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
- **🔑 Key Wrapping Architecture (v2.0)**
  - Industry-standard encryption model (same as 1Password, Bitwarden)
  - **DEK (Data Encryption Key)**: Random 256-bit key generated once, encrypts all notes
  - **KEK (Key Encryption Key)**: Derived from your passphrase, encrypts the DEK
  - **Config is plaintext**: `.holocron/config.json` contains wrapped (encrypted) DEK + settings
  - **10-100x faster**: PBKDF2 runs once at unlock, not per-file
  - **Cross-device sync**: Same passphrase unwraps DEK on any device (Mac, Windows, Linux)
  - No passphrase recovery - if lost, your notes cannot be decrypted!

- **📁 Two-Layer Storage Architecture**
  - **Local storage**: Plaintext `.md` files (fast editing, zero encryption overhead)
  - **Git storage**: Encrypted `.md.enc` files (secure remote sync)
  - **Encryption boundary**: Files encrypted during `git commit`, decrypted during `git pull`
  - **AES-256-GCM encryption**: Authenticated encryption with AAD (file path binding)
  - **PBKDF2-SHA256**: 300,000 iterations for key derivation

- **🛡️ Local-First & Private**
  - All data stored on your machine
  - No external APIs or telemetry
  - No cloud dependency
  - Plaintext notes never leave your computer - only encrypted versions go to Git
  - Safe to commit config to Git (DEK is wrapped/encrypted, settings are not sensitive)

See **[docs/ENCRYPTION_ARCHITECTURE.md](./docs/ENCRYPTION_ARCHITECTURE.md)** for full technical details.

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

Perfect for local use and development with **Turbopack** (5-10x faster than webpack):

```bash
pnpm dev
```

Then open your browser to:
```
http://localhost:3000
```

**What happens in dev mode:**
- **Turbopack bundler** - Ultra-fast hot reloading
- PWA features disabled (for faster iteration)
- Full development tools available
- Service workers not active
- 5-10x faster Fast Refresh compared to webpack

### Production Mode

For the full experience with optimizations and PWA support:

```bash
# Build the application (creates optimized bundle + service worker)
pnpm build

# Start the production server
pnpm start
```

Then navigate to:
```
http://localhost:3000
```

**What happens in production:**
- Optimized bundle sizes with Turbopack
- **PWA features enabled** - Service worker active
- Aggressive caching for offline support
- App ready to be installed on any device
- Full encryption and security features active

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

### Prerequisites: Set Up Git Repository

**Before using Holocron**, you need to set up a Git repository for your notes:

```bash
# 1. Create or navigate to your notes folder
mkdir ~/my-holocron-notes
cd ~/my-holocron-notes

# 2. Initialize Git repository
git init

# 3. Configure Git user
git config user.name "Your Name"
git config user.email "your.email@example.com"

# 4. (Optional) Add remote repository for syncing across devices
git remote add origin git@github.com:username/my-notes.git

# 5. (Optional) Set up SSH keys for remote sync
# See GIT_SETUP.md for detailed Git configuration instructions
```

### Setup Wizard

When you first open Holocron, you'll be guided through the Setup Wizard:

#### Step 1: Select Repository Location

1. Click **"Select Folder"**
2. Navigate to your Git repository folder (created above)
3. Holocron will detect if it's a new or existing repository

#### Step 2: Create Passphrase (REQUIRED)

**Your passphrase is critical - there is NO recovery if lost!**

1. Enter a strong passphrase (minimum 8 characters recommended)
2. Confirm your passphrase
3. Click **"Create Repository"**

**How the passphrase works (Key Wrapping Architecture):**
- **At setup**: Generates a random 256-bit DEK (Data Encryption Key)
- **Wrapping**: Your passphrase derives a KEK (Key Encryption Key) that encrypts the DEK
- **Storage**: The wrapped DEK is stored in plaintext `config.json` (safe to commit!)
- **At unlock**: Your passphrase unwraps the DEK, which then encrypts/decrypts notes
- **Performance**: PBKDF2 runs once at unlock (not per-file) = 10-100x faster
- **Cross-device**: Same passphrase unwraps the same DEK on all your devices
- **No recovery**: Lost passphrase = lost DEK = cannot decrypt notes

**What gets encrypted:**
- ✅ **Notes in Git**: `.md.enc` files (encrypted with DEK before commit)
- ✅ **Kanban boards in Git**: `.json.enc` files (encrypted with DEK before commit)
- ✅ **DEK itself**: Wrapped/encrypted with KEK (derived from your passphrase)

**What stays plaintext:**
- ✅ **Local notes**: `.md` files on your disk (fast editing, no overhead)
- ✅ **Config metadata**: `config.json` settings and wrapped DEK (not sensitive)

**Unlocking Existing Repository:**

If you're opening an existing Holocron repository:
1. Select the folder
2. Enter your existing passphrase
3. Click **"Unlock"** (passphrase unwraps the DEK from config.json)

#### Step 3: Configure Git Sync (Optional)

After setup, you can configure Git synchronization:
1. Click the Git icon in the header
2. Commit, push, and pull from the UI
3. (Optional) Enable auto-sync in Settings

See **[GIT_SETUP.md](./GIT_SETUP.md)** for comprehensive Git configuration instructions including SSH keys, remotes, and troubleshooting.

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

## 📁 How File Storage Works

Understanding Holocron's two-layer architecture:

### On Your Local Filesystem

```
your-notes-folder/
├── .git/                          # Git repository (you create this)
├── .holocron/                     # Holocron metadata (auto-created)
│   └── config.json               # Plaintext config (v2.0 - NEW!)
│       ├─ encryption.salt        #   ├─ Random salt for PBKDF2
│       ├─ encryption.wrappedDEK  #   ├─ DEK encrypted with KEK
│       └─ settings               #   └─ UI preferences (plaintext)
├── notes/                         # PLAINTEXT notes for fast editing
│   └── YYYY/MM/DD/
│       └── note-title.md         # ← Plaintext .md, ONLY on your machine
├── kanban/
│   └── board-name.json           # ← Plaintext .json, ONLY on your machine
└── .gitignore                    # Optional (you create this)
```

**Key point**: Your notes are stored as regular plaintext `.md` files on your computer for fast, seamless editing with zero encryption overhead. The new `config.json` is also plaintext (v2.0) - it contains the wrapped DEK and settings, both safe to commit!

### In Your Git Repository

```
When you run 'git commit' and 'git push':

Git commits/remote contains:
├── .holocron/
│   └── config.json               # Safe to commit (plaintext metadata + wrapped DEK)
├── notes/
│   └── YYYY/MM/DD/
│       └── note-title.md.enc     # ← AES-256-GCM encrypted with DEK
├── kanban/
│   └── board-name.json.enc       # ← AES-256-GCM encrypted with DEK
```

**Key point**: When you commit, Holocron automatically encrypts your plaintext `.md` files into `.md.enc` files using the DEK before they go into Git. Your plaintext notes **never leave your computer**. The `config.json` is committed as plaintext, but the DEK inside it is encrypted (wrapped) with your passphrase.

### The Encryption Flow (v2.0 - Key Wrapping)

**At repository setup (one time):**
```
User Passphrase
   → PBKDF2 (300k iterations)
      → KEK (Key Encryption Key)
         → Wraps (encrypts) randomly-generated DEK
            → Wrapped DEK stored in config.json
```

**At unlock (once per session):**
```
User Passphrase
   → PBKDF2 (300k iterations)
      → KEK (Key Encryption Key)
         → Unwraps (decrypts) DEK from config.json
            → DEK stored in memory (SecureString)
```

**When you commit (Save to Git):**
```
Local: note.md (plaintext)
   → Encrypt with DEK (fast!)
      → Git: note.md.enc (encrypted)
```

**When you pull (Load from Git):**
```
Git: note.md.enc (encrypted)
   → Decrypt with DEK (fast!)
      → Local: note.md (plaintext)
```

**When you edit (Daily use):**
```
Local: note.md (plaintext)
   → No encryption, no overhead
      → Instant, seamless editing
```

### Why This Design?

✅ **Lightning fast** - 10-100x faster than v1.0 (PBKDF2 runs once, not per-file)
✅ **Industry standard** - Same security model as 1Password and Bitwarden
✅ **Fast editing** - Zero encryption overhead during daily use
✅ **Secure sync** - Notes encrypted with DEK when syncing to Git
✅ **Safe for public repos** - Even with public Git, notes cannot be decrypted without passphrase
✅ **Simple config** - Config is plaintext (easier to read, modify, commit)
✅ **Cross-device sync** - Same passphrase unwraps DEK on any machine
✅ **No prompts** - DEK stored in memory after unlock (no repeated passphrase entry)

### Important Security Notes

- **Your plaintext `.md` files only exist on your computer** - they never get committed to Git
- **Only encrypted `.md.enc` files go into Git** - safe to push to GitHub, Bitbucket, etc.
- **Without your passphrase**, even if someone clones your Git repository, they cannot:
  - Unwrap the DEK from `config.json`
  - Decrypt any `.md.enc` files
  - Access any of your notes
- **The `config.json` is plaintext but secure**:
  - Contains wrapped (encrypted) DEK - useless without passphrase
  - Contains settings - just UI preferences, not sensitive
  - Safe to commit to Git, even public repos
- **Cross-device sync works seamlessly**:
  - Pull on Mac, Windows, Linux - same passphrase unwraps the same DEK
  - Each device decrypts `.md.enc` files using the unwrapped DEK
  - Settings sync automatically (stored in plaintext config)

**Security model (v2.0):**
- 🔐 Passphrase never stored, never logged
- 🔑 DEK wrapped with KEK (derived from passphrase via PBKDF2)
- 📝 Notes encrypted with DEK using AES-256-GCM + AAD
- ⚙️ Config plaintext (wrapped DEK + settings)
- 🚀 10-100x faster than v1.0

See **[docs/ENCRYPTION_ARCHITECTURE.md](./docs/ENCRYPTION_ARCHITECTURE.md)** for complete technical details, security analysis, and threat model.

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
- **Bundler**: Turbopack (default, 5-10x faster than webpack)
- **Styling**: Tailwind CSS + shadcn/ui
- **Editor**: Tiptap (ProseMirror-based)
- **Git**: isomorphic-git
- **PWA**: @serwist/next (Workbox successor, Turbopack-compatible)
- **Service Worker**: Serwist 9.x

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
- **CRITICAL**: Run in production mode: `pnpm build && pnpm start`
- PWA is disabled in development mode (`pnpm dev`) by design
- Service worker only generated during `pnpm build`
- Use HTTPS or localhost (required for PWA)
- Try Chrome/Edge (best PWA support)
- Clear browser cache and rebuild: `rm -rf .next && pnpm build`

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
