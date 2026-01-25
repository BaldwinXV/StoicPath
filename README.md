# Self Improvement OS

A personal self-improvement dashboard that runs entirely in your browser. It combines daily execution, XP leveling, streaks, charts, projects, and reflection in one place.

## Highlights

- Daily execution system: habits, MIT, focus lane, and a daily scorecard
- XP leveling system with clear progress bars and XP breakdowns
- Trend overview + finance chart + correlation insights
- Local community leaderboard (you + friends) using XP
- Projects with milestones and a completed-milestone showcase
- Reflection and recovery tools: temptations log, slip log, and root-cause notes
- Voltaris AI assistant to design habits, score them, and queue them safely
- Start-date aware habits so new tasks don’t punish past days

## XP & Leveling System

XP is earned from the actions that matter most:

- Completion %
- Score quality %
- Deep work ratio %
- Focus minutes
- Study hours
- Anti-habits clean %
- Sleep score %
- Notes & reflection
- Reach-outs
- Social challenge completion
- End-day review bonus
- Perfect day bonus

The Summary tab shows:

- Your current level
- Total XP
- XP earned in the active range (week/month/year)
- XP sources ranked by contribution

## Voltaris AI Assistant

Voltaris is a built-in habit architect:

- It runs a guided flow (name -> category -> frequency -> difficulty -> duration -> time block)
- It assigns points automatically based on difficulty and duration
- It queues habits first so you can review them before adding

Use it in **Manage -> Voltaris AI**.

## Start Dates (No Retroactive Penalties)

New habits now start on the currently selected date. This prevents new habits from lowering past completion %, XP, and streak stats.

You can edit a habit’s start date in **Manage -> Task Manager**.

## Run Locally

Open the site directly:

- `index.html`

Or run a small local server (recommended):

```bash
cd /home/tiger/Documents/SelfImprovement
python3 -m http.server 8080
```

Then open:

- `http://localhost:8080`

## Data & Backups

- All data is stored locally via `localStorage`
- Use the built-in JSON export regularly for backups
- CSV export is available for your day history

## Optional Sync (Phone + Laptop)

This app is local-first. If you want multi-device sync, use the built-in Firebase sync:

1. Create a Firebase project
2. Enable Firestore
3. Enable Anonymous Auth
4. Paste your Firebase config JSON into the Sync section
5. Use the same Sync key on each device

## Publish to GitHub + GitHub Pages

Repo:

- `https://github.com/Tyler-Durden1999/StoicPath`

Run these commands inside `/home/tiger/Documents/SelfImprovement`:

```bash
git add .
git commit -m "feat: add Voltaris AI assistant and start-date-safe habits"
git remote add origin https://github.com/Tyler-Durden1999/StoicPath.git
git push -u origin main
```

### 3) Turn on GitHub Pages

On GitHub:

1. Go to Settings -> Pages
2. Source: Deploy from a branch
3. Branch: `main` and folder `/ (root)`
4. Click Save

Your site will be live at:

- `https://tyler-durden1999.github.io/StoicPath/`

## Important Note About "Community"

Right now the community leaderboard is local-only and manual (you enter friends and their XP). That’s perfect for personal use and early demos.

If you want real global rankings, accounts, and shared projects, the next step is adding a backend (Supabase or Firebase Auth + Firestore).

## Gym Tracker

The main app links to a separate gym-focused site:

- `../GymTracker/index.html`
