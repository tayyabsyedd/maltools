/**
 * src/db/schema.ts
 *
 * Drizzle ORM Database Schema
 * Defines all your database tables and columns.
 * Much simpler than Prisma — pure TypeScript, no binary downloads!
 */

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ─── USERS TABLE ──────────────────────────────────────────────────────────────
export const users = sqliteTable('users', {
  id:        text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email:     text('email').notNull().unique(),
  password:  text('password').notNull(),   // bcrypt hashed
  name:      text('name').notNull(),
  role:      text('role').notNull().default('admin'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// ─── BLOG POSTS TABLE ─────────────────────────────────────────────────────────
export const blogPosts = sqliteTable('blog_posts', {
  id:          text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title:       text('title').notNull(),
  slug:        text('slug').notNull().unique(),        // URL-friendly title
  content:     text('content').notNull().default(''),  // HTML from TipTap editor
  excerpt:     text('excerpt').notNull().default(''),  // Short summary
  coverImage:  text('cover_image').notNull().default(''),
  
  // SEO fields
  metaTitle:   text('meta_title').notNull().default(''),
  metaDesc:    text('meta_desc').notNull().default(''),
  
  // Status
  published:   integer('published', { mode: 'boolean' }).notNull().default(false),
  publishedAt: text('published_at'),
  
  // Categorization
  category:    text('category').notNull().default('general'),
  tags:        text('tags').notNull().default(''),     // comma-separated

  // Author
  authorId:    text('author_id').notNull().references(() => users.id),
  
  // Timestamps
  createdAt:   text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt:   text('updated_at').notNull().default(sql`(datetime('now'))`),
});

// TypeScript types (auto-generated from schema)
export type User     = typeof users.$inferSelect;
export type NewUser  = typeof users.$inferInsert;
export type BlogPost    = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
