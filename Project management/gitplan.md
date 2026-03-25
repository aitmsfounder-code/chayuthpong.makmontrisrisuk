# Git & GitHub Deployment Plan
## AI Squad — Pixel Art Resume Project

> **วันที่**: 2026-03-25
> **ผู้จัดทำ**: Project Manager Agent + Orchestrator
> **สถานะ**: พร้อม implement

---

## 1. ภาพรวม (Overview)

```
Developer (Claude Code)
    │
    ├── git add / commit
    │
    ▼
GitHub Repository (private)
    │
    ├── push to main
    │
    ▼
GitHub Actions (CI/CD)
    │
    ├── npm ci → tsc → vite build
    │
    ▼
GitHub Pages (Production)
    │
    └── https://<username>.github.io/chayuthpong.makmontrisrisuk/
```

**Tech Stack ที่เกี่ยวข้อง:**
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions
- **Hosting**: GitHub Pages (static site)
- **Dev Tool**: Claude Code (CLI)
- **Build**: Vite + TypeScript
- **Backup Hosting**: IIS Server (web.config มีอยู่แล้ว)

---

## 2. Git Initialization

### 2.1 สร้าง .gitignore

สร้างไฟล์ `.gitignore` ที่ root ของโปรเจค (`chayuthpong.makmontrisrisuk/.gitignore`):

```gitignore
# Dependencies
node_modules/

# Build output
dist/

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Claude Code local state
.claude/

# Large binary / archive files
*.zip

# Environment variables
.env
.env.local
.env.*.local
```

**หมายเหตุ:**
- `CV/` → **track** (เป็น content source)
- `agents/`, `orchestrator/`, `shared/` → **track** (เป็นส่วนหนึ่งของ project)
- `portfolio/20260319_WEB_RESUME.zip` (47MB) → **ignore** ผ่าน `*.zip`
- `.claude/` → **ignore** (local state ของ Claude Code แต่ละเครื่อง)

### 2.2 Initial Commit

```bash
cd /Users/chayuthpongmakmontrisrisuk/Desktop/CHAYUTHPONG.MAKMONTRISRISUK/chayuthpong.makmontrisrisuk

# Initialize git
git init

# สร้าง .gitignore ก่อน (ป้องกัน commit ไฟล์ที่ไม่ต้องการ)
# ... สร้างไฟล์ .gitignore ตาม section 2.1 ...

# Stage เป็น folder เฉพาะ (ไม่ใช้ git add . หรือ git add -A)
git add .gitignore
git add README.md CLAUDE.md
git add agents/
git add orchestrator/
git add shared/
git add CV/
git add "Project management/"
git add portfolio/20260319_WEB_RESUME/

# ตรวจสอบก่อน commit
git status

# Initial commit
git commit -m "Initial commit: AI Squad pixel art resume project"
```

> **สำคัญ**: ใช้ `git add` แยกทีละ folder เพื่อป้องกัน commit ไฟล์ขนาดใหญ่หรือ sensitive files โดยไม่ตั้งใจ

---

## 3. GitHub Repository

### 3.1 สร้าง Repository

```bash
# สร้าง private repo บน GitHub แล้ว push code ขึ้นไป
gh repo create chayuthpong.makmontrisrisuk --private --source=. --remote=origin --push
```

**ทำไมใช้ private:**
- Resume มีข้อมูลส่วนตัว (เบอร์โทร, อีเมล, ที่อยู่)
- เปลี่ยนเป็น public ทีหลังได้ถ้าต้องการ
- GitHub Pages ทำงานกับ private repo ได้ (ต้องใช้ GitHub Pro หรือ GitHub Free ก็ได้สำหรับ public repo)

> **หมายเหตุ**: GitHub Pages สำหรับ **private repo** ต้องใช้ **GitHub Pro/Team/Enterprise** ถ้าใช้ **GitHub Free** ต้องเป็น **public repo** เท่านั้น ถ้าไม่มี Pro ให้เปลี่ยนเป็น:
> ```bash
> gh repo create chayuthpong.makmontrisrisuk --public --source=. --remote=origin --push
> ```

### 3.2 Branch Strategy

| Branch | Purpose | Auto-deploy? |
|--------|---------|:---:|
| `main` | Production-ready code | ✅ Deploy to GitHub Pages |

**ทำไมใช้ branch เดียว:**
- Solo developer (ใช้ Claude Code)
- ไม่ต้องการ PR review process
- ลด friction ในการ deploy
- ถ้าต้องการเพิ่ม `dev` branch ทีหลังก็ทำได้ง่าย

---

## 4. Vite Config — รองรับ GitHub Pages

### 4.1 ปัญหา

GitHub Pages serve เว็บที่ `https://<username>.github.io/<repo-name>/`
ตอนนี้ `vite.config.ts` ตั้ง `base: './'` ซึ่งใช้ได้กับ IIS แต่ GitHub Pages ต้องการ `base: '/<repo-name>/'`

### 4.2 วิธีแก้ — ใช้ Environment Variable

แก้ไฟล์ `portfolio/20260319_WEB_RESUME/vite.config.ts`:

```typescript
export default defineConfig({
  base: process.env.VITE_BASE_URL || './',
  // ... ค่าอื่นๆ เหมือนเดิม
});
```

**ผลลัพธ์:**
- **Local dev / IIS**: `base: './'` (default, ไม่ต้องตั้ง env var)
- **GitHub Pages**: `VITE_BASE_URL=/chayuthpong.makmontrisrisuk/` (ตั้งใน GitHub Actions workflow)
- **Custom domain**: `VITE_BASE_URL=/` (ถ้าใช้ custom domain ทีหลัง)

---

## 5. GitHub Actions — CI/CD Workflow

### 5.1 สร้าง Workflow File

สร้างไฟล์ `.github/workflows/deploy.yml` ที่ root ของ repo:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:  # ให้กด deploy manual ได้

# ตั้ง permissions สำหรับ GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# ป้องกัน deploy ซ้อนกัน
concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: portfolio/20260319_WEB_RESUME/package-lock.json

      - name: Install dependencies
        working-directory: portfolio/20260319_WEB_RESUME
        run: npm ci

      - name: Build
        working-directory: portfolio/20260319_WEB_RESUME
        run: npm run build
        env:
          VITE_BASE_URL: /${{ github.event.repository.name }}/

      - name: Copy 404.html for SPA routing
        run: cp portfolio/20260319_WEB_RESUME/dist/index.html portfolio/20260319_WEB_RESUME/dist/404.html

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: portfolio/20260319_WEB_RESUME/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 5.2 อธิบาย Workflow

| Step | ทำอะไร |
|------|--------|
| **Checkout** | Clone repo |
| **Setup Node.js** | ติดตั้ง Node 20 + cache npm |
| **Install** | `npm ci` ใน subfolder (ใช้ package-lock.json) |
| **Build** | `tsc && vite build` พร้อมตั้ง `VITE_BASE_URL` |
| **Copy 404** | Copy `index.html` → `404.html` เพื่อ SPA routing |
| **Upload** | ส่ง `dist/` ไป GitHub Pages artifact |
| **Deploy** | Publish ไปที่ GitHub Pages |

### 5.3 Trigger

- **อัตโนมัติ**: ทุกครั้งที่ push ไป `main`
- **Manual**: กดปุ่ม "Run workflow" ใน GitHub Actions tab
- **ไม่ trigger**: push ไป branch อื่น (ถ้ามี)

---

## 6. GitHub Pages Setup

### 6.1 เปิดใช้งาน GitHub Pages

1. ไปที่ repo บน GitHub: `Settings` > `Pages`
2. **Source**: เลือก **"GitHub Actions"** (ไม่ใช่ "Deploy from a branch")
3. Save

> GitHub Actions workflow ที่สร้างไว้จะจัดการ deploy ให้อัตโนมัติ

### 6.2 SPA Routing

GitHub Pages ไม่มี server-side rewrite เหมือน IIS `web.config`
**วิธีแก้**: Copy `index.html` → `404.html` (ทำใน workflow แล้ว)
- เมื่อ user เข้า URL ที่ไม่ตรงกับ file จริง → GitHub Pages จะ serve `404.html`
- `404.html` = `index.html` → React/Phaser จัดการ routing เอง

### 6.3 Custom Domain (Optional — ทำทีหลังได้)

ถ้าต้องการใช้ custom domain:

1. สร้างไฟล์ `portfolio/20260319_WEB_RESUME/public/CNAME` เนื้อหาเป็น domain:
   ```
   resume.example.com
   ```

2. ตั้ง DNS record:
   ```
   CNAME  resume.example.com  →  <username>.github.io
   ```

3. แก้ `VITE_BASE_URL` ใน workflow เป็น `/`:
   ```yaml
   env:
     VITE_BASE_URL: /
   ```

4. เปิด HTTPS ใน GitHub Pages settings

---

## 7. Development Workflow กับ Claude Code

### 7.1 Flow ประจำวัน

```
┌─────────────────────────────────────────────┐
│  1. เปิด Claude Code ใน chayuthpong.makmontrisrisuk/          │
│  2. สั่งงาน: "แก้ bug X" / "เพิ่มฟีเจอร์ Y" │
│  3. Claude Code แก้ไขโค้ด                   │
│  4. ทดสอบ local: npm run dev                │
│  5. พอใจ → สั่ง Claude Code: "commit แล้ว push"│
│  6. GitHub Actions auto-build + deploy      │
│  7. ตรวจ live: github.io/chayuthpong.makmontrisrisuk/          │
└─────────────────────────────────────────────┘
```

### 7.2 คำสั่งที่ใช้บ่อย

```bash
# ดูสถานะ
git status

# Commit และ push
git add portfolio/20260319_WEB_RESUME/src/
git commit -m "fix: แก้ตัวละครไม่ยืนบนพื้น"
git push origin main

# ดูสถานะ deploy
gh run list --limit 5

# ดู deploy ล่าสุด
gh run view --web

# ดู live site
open https://<username>.github.io/chayuthpong.makmontrisrisuk/
```

### 7.3 Commit Message Convention

```
<type>: <description>

Types:
  feat:     ฟีเจอร์ใหม่
  fix:      แก้ bug
  style:    แก้ CSS/UI ไม่กระทบ logic
  refactor: refactor code
  docs:     documentation
  chore:    งาน maintenance (dependencies, config)
  art:      pixel art / sprites / assets
  sound:    เสียง / music
```

ตัวอย่าง:
```
feat: เพิ่มระบบเปลี่ยนชุดตัวละครตาม zone
fix: แก้เสียง theme ดังเกินไป
art: ปรับ sprite หันซ้ายหันขวาทั้งตัว
sound: เพิ่มเสียง warp pipe
```

---

## 8. Step-by-Step Implementation

ทำตามลำดับนี้:

| Step | Action | Command / File |
|:---:|--------|---------------|
| 1 | สร้าง `.gitignore` | `chayuthpong.makmontrisrisuk/.gitignore` |
| 2 | แก้ `vite.config.ts` รองรับ env var | เพิ่ม `process.env.VITE_BASE_URL \|\| './'` |
| 3 | สร้าง GitHub Actions workflow | `.github/workflows/deploy.yml` |
| 4 | `git init` | `git init` ที่ root |
| 5 | Stage files (ทีละ folder) | `git add .gitignore README.md ...` |
| 6 | Initial commit | `git commit -m "Initial commit: ..."` |
| 7 | สร้าง GitHub repo | `gh repo create chayuthpong.makmontrisrisuk --private --source=. --remote=origin --push` |
| 8 | เปิด GitHub Pages | Settings > Pages > Source: GitHub Actions |
| 9 | รอ Actions build เสร็จ | `gh run list` หรือดูใน GitHub |
| 10 | ตรวจ live site | `https://<username>.github.io/chayuthpong.makmontrisrisuk/` |

---

## 9. Potential Issues & Solutions

| ปัญหา | วิธีแก้ |
|-------|---------|
| **zip 47MB ถูก commit** | `.gitignore` ครอบคลุม `*.zip` แล้ว ตรวจ `git status` ก่อน commit เสมอ |
| **node_modules ถูก commit** | `.gitignore` ครอบคลุมแล้ว ถ้า commit ไปแล้ว: `git rm -r --cached portfolio/20260319_WEB_RESUME/node_modules` |
| **Build fail ใน CI** | ตรวจ `typescript` อยู่ใน dependencies (ไม่ใช่ devDependencies) |
| **หน้าเว็บ blank บน Pages** | ตรวจ `VITE_BASE_URL` ตรงกับ repo name หรือไม่ |
| **Assets ไม่โหลด** | ตรวจว่า asset paths ใช้ relative path ไม่ใช่ absolute |
| **SPA route ไม่ทำงาน** | ตรวจว่า `404.html` ถูก copy ใน workflow |
| **Private repo ใช้ Pages ไม่ได้** | ต้อง GitHub Pro หรือเปลี่ยน repo เป็น public |
| **Bundle ใหญ่เกิน (Phaser 2MB+)** | ไม่กระทบ GitHub Pages (100GB bandwidth/month) |
| **Repo name เปลี่ยน** | Workflow ใช้ `${{ github.event.repository.name }}` อัตโนมัติ |

---

## 10. โครงสร้างไฟล์หลัง Setup

```
chayuthpong.makmontrisrisuk/
├── .git/                          ← Git repository
├── .gitignore                     ← Ignore rules
├── .github/
│   └── workflows/
│       └── deploy.yml             ← CI/CD workflow
├── CLAUDE.md
├── README.md
├── CV/
├── Project management/
│   └── gitplan.md                 ← เอกสารนี้
├── agents/
├── orchestrator/
├── shared/
└── portfolio/
    └── 20260319_WEB_RESUME/
        ├── src/                   ← Source code (tracked)
        ├── dist/                  ← Build output (ignored)
        ├── node_modules/          ← Dependencies (ignored)
        ├── package.json
        ├── vite.config.ts         ← แก้ base path
        ├── tsconfig.json
        ├── web.config             ← IIS config (kept for backup deploy)
        └── index.html
```

---

## 11. IIS vs GitHub Pages (Dual Deployment)

โปรเจคนี้รองรับ deploy ทั้ง 2 ที่:

| | IIS Server | GitHub Pages |
|---|---|---|
| **URL** | Internal / custom | `<user>.github.io/chayuthpong.makmontrisrisuk/` |
| **Deploy** | Manual copy `dist/` | Auto via GitHub Actions |
| **Config** | `web.config` | `deploy.yml` |
| **Base Path** | `./` (relative) | `/<repo-name>/` (env var) |
| **SPA Routing** | URL Rewrite rule | `404.html` fallback |

**Deploy ไป IIS (manual):**
```bash
cd portfolio/20260319_WEB_RESUME
npm run build
# Copy dist/ ไปที่ IIS wwwroot (web.config จะถูก copy ไปด้วย)
```

**Deploy ไป GitHub Pages (auto):**
```bash
git push origin main
# GitHub Actions จะ build และ deploy ให้อัตโนมัติ
```
