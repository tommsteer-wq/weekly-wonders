# How to Deploy to Vercel

Vercel works by connecting to GitHub. So the process is: put your files on GitHub first, then Vercel picks them up automatically. Both steps are done entirely in your browser — no terminal needed.

---

## Step 1 — Create a GitHub Repository

1. Go to **github.com** and log in (your GitHub account is `tommsteer-wq`)
2. Click the **+** button in the top-right corner → **"New repository"**
3. Give it a name, e.g. `weekly-wonders`
4. Set it to **Public**
5. Click **"Create repository"**

---

## Step 2 — Upload Your Files to GitHub

1. On your new (empty) repository page, click **"uploading an existing file"** (it's a link in the middle of the page)
2. **Drag and drop** these files from your dashboard folder onto the upload area:
   - `index.html`
   - `vercel.json`
   - `bottom.jpg` (if you have it)
3. Scroll down, click **"Commit changes"**

Your files are now on GitHub.

---

## Step 3 — Deploy on Vercel

1. Go to **vercel.com/new** (you're already logged in)
2. Under **"Import Git Repository"** you'll see your GitHub repos listed — find `weekly-wonders` and click **"Import"**
3. Leave all settings as default and click **"Deploy"**

Vercel will build and give you a live URL like `https://weekly-wonders.vercel.app` in about 30 seconds. 🎉

---

## Updating the Dashboard in Future

Whenever you change `index.html`, just go back to your GitHub repository and re-upload the file (same drag-and-drop process). Vercel detects the change and **redeploys automatically** — you don't need to touch Vercel at all.

1. Go to your GitHub repo → click `index.html` → click the **pencil/edit icon** → or just drag the new file in
2. Click **"Commit changes"**
3. Wait ~30 seconds → your live site is updated

---

## Your Files (keep these together before uploading)

```
Weekly Wonders - Fantasy Football Dashboard/
├── index.html      ← the dashboard
├── vercel.json     ← Vercel config
└── bottom.jpg      ← the Bottom image (rename your photo to this)
```
