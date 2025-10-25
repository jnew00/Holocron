# Git Integration Setup Guide

LocalNote now includes full Git integration using your system Git CLI with SSH authentication. This guide will help you set up Git sync for your encrypted notes.

## Prerequisites

1. **Git installed** on your system
2. **SSH keys configured** for your remote repository (GitHub, Bitbucket, GitLab, etc.)
3. A **Git repository** initialized in your notes folder

## Initial Setup

### 1. Initialize Git Repository

If you haven't already initialized a Git repository in your notes folder:

```bash
cd /path/to/your/notes/folder
git init
```

### 2. Configure Git User

Set your Git author information:

```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 3. Add Remote Repository

Add your remote repository (use SSH URL):

```bash
# For GitHub
git remote add origin git@github.com:username/repo.git

# For Bitbucket
git remote add origin git@bitbucket.org:username/repo.git

# For GitLab
git remote add origin git@gitlab.com:username/repo.git
```

### 4. Configure SSH Keys

Ensure your SSH keys are set up and added to your SSH agent:

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your.email@example.com"

# Add SSH key to ssh-agent
ssh-add ~/.ssh/id_ed25519

# Copy public key to clipboard (macOS)
pbcopy < ~/.ssh/id_ed25519.pub
```

Then add the public key to your Git hosting service:
- **GitHub**: Settings → SSH and GPG keys → New SSH key
- **Bitbucket**: Personal settings → SSH keys → Add key
- **GitLab**: Preferences → SSH Keys → Add key

### 5. Test SSH Connection

Verify your SSH connection:

```bash
# GitHub
ssh -T git@github.com

# Bitbucket
ssh -T git@bitbucket.org

# GitLab
ssh -T git@gitlab.com
```

You should see a success message confirming authentication.

## Using Git Sync in LocalNote

Once your repository is set up, LocalNote provides a full Git interface:

### Accessing Git Sync

Click the **Git branch icon** in the top-right header to open the Git Sync dialog.

### Features

#### Status Display
- Current branch name
- Number of modified, added, deleted, and untracked files
- Commits ahead/behind remote

#### Sync Tab

**Commit Changes**:
1. Enter your author name and email (or use defaults)
2. Write a commit message
3. Click "Commit All Changes" to stage and commit all changes

**Push to Remote**:
- Enter remote name (default: `origin`)
- Click "Push" to push your commits to the remote repository

**Pull from Remote**:
- Enter remote name (default: `origin`)
- Click "Pull" to fetch and merge remote changes
- If conflicts occur, you'll see a list of conflicted files

#### Branches Tab

**Create New Branch**:
1. Enter branch name (e.g., `feature/new-feature`)
2. Click "Create" to create and switch to the new branch

**Switch Branch**:
- Click "Switch" next to any branch to change branches

**Delete Branch**:
- Click the trash icon to delete a branch (cannot delete current branch)

## How It Works

### Architecture

LocalNote's Git integration uses:
- **Next.js API Routes** (`/api/git/*`) - Server-side Git operations
- **System Git CLI** - Executes via Node.js `child_process`
- **Your SSH credentials** - No authentication stored in the app
- **FileSystemDirectoryHandle** - Browser API for file access

### API Routes

The following API routes handle Git operations:

- `POST /api/git/status` - Get repository status
- `POST /api/git/commit` - Stage and commit all changes
- `POST /api/git/push` - Push to remote
- `POST /api/git/pull` - Pull from remote
- `GET /api/git/branches` - List all branches
- `POST /api/git/branches` - Create, switch, or delete branches

### Security

- All Git operations use your **system Git configuration**
- SSH credentials are managed by your system's SSH agent
- No credentials or tokens are stored in LocalNote
- All notes remain encrypted (`.md.enc` files)

## Workflow Best Practices

### Daily Usage

1. **Pull first** - Always pull before starting work to get latest changes
2. **Commit frequently** - Commit after significant changes or at end of day
3. **Push regularly** - Push commits to remote for backup
4. **Use branches** - Create feature branches for major changes

### Recommended Workflow

```bash
# Morning: Pull latest changes
Click Git icon → Pull

# During day: Make and save notes
# LocalNote auto-saves every 2 seconds

# End of day or after significant changes: Commit and push
Click Git icon → Enter commit message → Commit All Changes → Push
```

### Handling Merge Conflicts

If you get merge conflicts:

1. LocalNote will show conflicted files in the error message
2. Exit LocalNote and resolve conflicts manually:
   ```bash
   cd /path/to/your/notes/folder
   git status
   # Edit conflicted files
   git add .
   git commit
   ```
3. Reopen LocalNote and continue working

## Troubleshooting

### "Unable to detect Git repository"

**Solution**: Initialize Git in your notes folder:
```bash
cd /path/to/your/notes/folder
git init
```

### "No upstream branch configured"

**Solution**: Set upstream branch:
```bash
git push --set-upstream origin main
```

### "Push rejected. Remote has changes."

**Solution**: Pull first, then push:
```bash
# In LocalNote: Click Pull, then Push
```

### "Authentication failed"

**Solution**: Check SSH key setup:
```bash
ssh -T git@github.com  # or your Git host
```

### Permission denied (publickey)

**Solution**: Add SSH key to ssh-agent:
```bash
ssh-add ~/.ssh/id_ed25519
```

## Advanced Configuration

### Multiple Remotes

You can configure multiple remotes:

```bash
git remote add backup git@gitlab.com:username/backup-repo.git
```

Then in LocalNote, enter "backup" as the remote name when pushing/pulling.

### Git Hooks

LocalNote respects your Git hooks. You can add pre-commit hooks:

```bash
# Create .git/hooks/pre-commit
#!/bin/bash
# Your pre-commit checks here
```

### .gitignore

Create a `.gitignore` in your notes folder:

```gitignore
# Example .gitignore for LocalNote
.DS_Store
*.tmp
node_modules/
```

## File Structure

LocalNote stores files in this structure:

```
your-notes-folder/
├── .git/                          # Git repository
├── notes/                         # Encrypted notes
│   └── YYYY/MM/DD/
│       └── note-title.md.enc
├── kanban/
│   └── board.json.enc            # Encrypted Kanban board
├── config/
│   └── config.json.enc           # Encrypted config
└── .gitignore                    # Optional
```

All `.enc` files are encrypted with AES-256-GCM and are safe to commit to any repository.

## Summary

LocalNote's Git integration provides:

✅ Full Git workflow (commit, push, pull, branches)
✅ Uses your existing SSH credentials
✅ No authentication stored in the app
✅ Merge conflict detection
✅ Branch management
✅ Real-time status display

All while keeping your notes encrypted and secure.
