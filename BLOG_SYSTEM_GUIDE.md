# MATools Blog System — End User Guide

## Table of Contents

1. [Blog System Kya Hai?](#1-blog-system-kya-hai)
2. [Public Blog (Readers Ke Liye)](#2-public-blog-readers-ke-liye)
3. [Admin Dashboard (Content Managers Ke Liye)](#3-admin-dashboard-content-managers-ke-liye)
4. [Blog Post Create / Edit Kaise Karein](#4-blog-post-create--edit-kaise-karein)
5. [Categories aur Tags Kaise Manage Karein](#5-categories-aur-tags-kaise-manage-karein)
6. [Comments Management](#6-comments-management)
7. [SEO Settings](#7-seo-settings)
8. [User Roles aur Permissions](#8-user-roles-aur-permissions)
9. [Setup Guide (Developer Ke Liye)](#9-setup-guide-developer-ke-liye)

---

## 1. Blog System Kya Hai?

Yeh ek **full-featured blog system** hai jo **Next.js 16** mein bana hai. Is ke do hisay hain:

| Side | URL | Kiske Liye |
|------|-----|-----------|
| **Public Blog** | `/blog` | Readers / visitors — sab ke liye khula |
| **Admin Dashboard** | `/apps/blog/post` | Admin / Author — login zaroori |

---

## 2. Public Blog (Readers Ke Liye)

Public blog **bina login ke** accessible hai. Yeh server-side render hota hai, is liye SEO strong hai.

### 2.1 Blog Listing Page (`/blog`)

- **Post Cards** — har post ka title, excerpt, aur featured image dikhta hai.
- **Category Filter** — top par chips hain (All, Category 1, Category 2, etc.). Click karne par sirf us category ki posts filter ho jati hain.
- **Pagination** — 10 posts per page. "← Previous" aur "Next →" buttons se navigate karein.
- **URL update** — jab filter/pagination change hoti hai to URL update hota hai (e.g., `/blog?category=tech&page=2`).

### 2.2 Post Detail Page (`/blog/[slug]`)

Har post ki detail page par ye sab kuch hai:

| Feature | Description |
|---------|-------------|
| **Breadcrumbs** | Home > Blog > Post Title |
| **Author Info** | Avatar, name, publish date |
| **Views Counter** | Kitni baar post dekhi gayi |
| **Read Time** | Kitne minute mein parh sakte hain (words / 200) |
| **Featured Image** | OG image / cover photo |
| **Category Chip** | Post kis category mein hai |
| **Tags** | Post se associated tags |
| **Excerpt** | Italic summary (border-left style) |
| **Content** | Sanitized HTML (TipTap editor se aaya) |
| **Table of Contents** | H2/H3 headings se auto-generated. Sidebar mein sticky |
| **Related Posts** | Same category ki 3 popular posts (by views) |
| **JSON-LD Schema** | Google rich results ke liye Article schema |

### 2.3 Category Page (`/category/[slug]`)

Sirf ek specific category ki published posts dikhata hai.

### 2.4 Search Page (`/search?q=...`)

Title, content, aur excerpt mein full-text search karta hai (case-insensitive).

### 2.5 SEO Features

- **Dynamic Meta Tags** — har page ke liye unique title, description, OG tags, Twitter cards
- **Canonical URLs** — duplicate content se bachao
- **Sitemap** (`/sitemap.xml`) — automatically sab published posts aur categories include karta hai
- **robots.txt** — public pages ko allow, admin/api/auth ko disallow

---

## 3. Admin Dashboard (Content Managers Ke Liye)

Admin dashboard **login ke baad** accessible hai. Yahan se posts CRUD karein, categories manage karein, aur comments approve karein.

### 3.1 Login Kaise Karein

1. Jaain: `/auth/auth1/login`
2. Credentials enter karein (email + password)
3. Successful login ke baad dashboard par redirect ho jayenge

### 3.2 Blog Listing (`/apps/blog/post`)

- Client-side rendering with **SWR** for data fetching
- Posts ki list with pagination
- Sort by: newest, oldest, popular
- Featured posts highlight

### 3.3 Blog Edit / Create (`/apps/blog/edit`)

Full-featured editor with multiple sections:

#### General Detail
- **Title** — post ka heading
- **Slug** — URL-friendly name (auto-generated from title, manually bhi edit kar sakte hain)
- **Content** — **TipTap Rich Text Editor** se type karein
  - Toolbar: Bold, Italic, H1, H2, H3, Bullet List, Ordered List, Blockquote, Image
  - Images Cloudinary par upload hoti hain

#### Media
- **OG Image / Cover Image** — Cloudinary se upload karein
- Post ki representation image

#### Status
- **Draft** — save karein par publish nahi karna
- **Published** — public blog par dikhe ga
- **Archived** — public se hide karein

#### Category & Tags
- **Category** — select karein (dropdown)
- **Tags** — multiple tags select/add karein

#### Post Date
- Publish date set karein

### 3.4 SEO Fields

Har post ke liye separate SEO settings hain:

| Field | Description | Character Limit |
|-------|-------------|-----------------|
| **Meta Title** | Browser tab aur search result mein dikhe ga | 60 chars |
| **Meta Description** | Search result snippet | 160 chars |
| **Slug** | URL mein kya dikhe ga | Auto |
| **OG Image** | Social media par share karne par dikhe ga | Cloudinary |

Ek **Google Preview** simulation bhi hai — dikhata hai ke search result mein kaisa lage ga.

### 3.5 Manage Blog Table (`/apps/blog/manage-blog`)

Bulk operations ke liye table view:
- Search, sort, filter
- Quick status change
- Delete posts

### 3.6 Blog Detail View (`/apps/blog/detail/[slug]`)

Admin panel se post ka detail view (public detail page jaisa hi).

---

## 4. Blog Post Create / Edit Kaise Karein

### Step-by-Step Guide:

1. **Login karein** dashboard par
2. **Blog app** mein jaain: sidebar menu → Apps → Blog → Post
3. **"Add New Post"** button click karein
4. **General Detail** section:
   - Title likhein (slug auto-generate ho ga)
   - Content TipTap editor mein type/formate karein
5. **Media** — cover image upload karein
6. **Status** select karein (Draft / Published / Archived)
7. **Category** select karein
8. **Tags** select karein
9. **SEO Fields** bhar dein (recommended for better ranking)
10. **"Save Changes"** button click karein

Post save ho jaye gi. Agar status "Published" hai to turant public blog par nazar aa jaye gi.

---

## 5. Categories aur Tags Kaise Manage Karein

Categories aur tags **Prisma database** mein stored hain. Admin dashboard ke through manage kiye jate hain.

| Entity | Field | Unique |
|--------|-------|--------|
| Category | name, slug | slug unique |
| Tag | name, slug | slug unique |

> **Note:** Agar koi post bina category ke save hoti hai to automatically "Uncategorized" assign ho jata hai (code fallback).

---

## 6. Comments Management

Comments model mein `approved` field hai (default `false`):
- **Pending** — admin approval ka wait kar raha
- **Approved** — public blog par display ho ga

Comment ka relationship:
- **Post** se belongs to
- **Author (User)** se belongs to

---

## 7. SEO Settings

### Per-Post SEO

Har post par alag se:

- **Meta Title** — `<title>` tag aur Google search result mein dikhta hai. Recommended: 50-60 chars.
- **Meta Description** — Search snippet. Recommended: 150-160 chars.
- **Canonical URL** — Auto-generated from slug.
- **OG Image** — 1200x630px recommended. Facebook, Twitter, LinkedIn par share karne par dikhe ga.
- **JSON-LD Structured Data** — Google rich results ke liye Article schema auto-injected.

### Global SEO

- **Sitemap** — `https://yoursite.com/sitemap.xml` — Google Search Console mein submit karein
- **robots.txt** — `https://yoursite.com/robots.txt` — public pages crawl hain

---

## 8. User Roles aur Permissions

### Role Hierarchy (numbers on basis of authority)

| Role | Level | Permissions |
|------|-------|-------------|
| **SUPER_ADMIN** | 100 | Full access — users bhi manage kar sakta hai |
| **ADMIN** | 80 | All posts create/edit/delete (kisi ka bhi) |
| **EDITOR** | 60 | Edit permissions |
| **AUTHOR** | 40 | Create posts, edit/delete sirf apne posts |
| **VIEWER** | 20 | Sirf dekh sakta hai, likh nahi sakta |

### Route Protection (Middleware)

| Route | Required Role |
|-------|---------------|
| `/blog`, `/category`, `/search`, `/` | Public — no login |
| `/auth/*` | Only non-logged-in users |
| `/admin` (dashboard) | At least **AUTHOR** |
| `/admin/users`, `/api/users` | Only **SUPER_ADMIN** |
| `POST /api/posts` | At least **AUTHOR** |
| `PUT/DELETE /api/posts` | At least **ADMIN** |

### Default Admin Credentials

```
Email:    admin@maltools.com
Password: Admin@123456
```

> ⚠️ Production mein ye credentials change karna na bhoolein!

---

## 9. Setup Guide (Developer Ke Liye)

### Prerequisites

- **Node.js** 18+ (Recommended: 20 LTS)
- **PostgreSQL** database (ya Neon.tech account)
- **Cloudinary** account (images ke liye)

### Installation Steps

```bash
# 1. Clone the repository
git clone <repo-url>
cd maltools

# 2. Install dependencies
npm install

# 3. Environment variables set karein
# .env file mein ye sab dalna hoga:
DATABASE_URL=postgresql://...
AUTH_SECRET=your-random-secret-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_APP_NAME=MATools
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 4. Generate Prisma client
npx prisma generate

# 5. Database tables create karein
npx prisma db push

# 6. Seed database (default admin user)
npm run seed

# 7. Development server start karein
npm run dev
```

Browser mein kholen: `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run start
```

### Deployment

Project Netlify ke liye configured hai (`netlify.toml`).

---

## Quick Reference — URLs

| URL | Purpose |
|-----|---------|
| `/` | Home / Dashboard |
| `/blog` | Public blog listing |
| `/blog/[slug]` | Single post detail |
| `/category/[slug]` | Category-wise posts |
| `/search?q=keyword` | Search posts |
| `/sitemap.xml` | XML sitemap |
| `/robots.txt` | Robots config |
| `/auth/auth1/login` | Login page |
| `/apps/blog/post` | Admin blog listing |
| `/apps/blog/edit` | Create/edit post |
| `/apps/blog/detail/[slug]` | Admin post detail |
| `/apps/blog/manage-blog` | Manage blog table |
| `/admin` | Admin dashboard |
| `/admin/users` | User management (SUPER_ADMIN only) |
| `/api/posts` | Blog API (REST) |

---

*Documentation generated for **MATools** Blog System v10.0.0*
