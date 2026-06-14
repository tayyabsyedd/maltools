import { Container, Typography, Box, Chip, Stack, Avatar, Grid, Divider } from '@mui/material';
import Link from 'next/link';
import { format } from 'date-fns';
import { IconEye, IconClock } from '@tabler/icons-react';
import prisma from '@/lib/db';
import PostCard from '@/app/components/blog/PostCard';
import type { Metadata } from 'next';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    include: {
      author: { select: { name: true, avatar: true } },
      category: true,
      tags: true,
    },
  });
}

async function getRelatedPosts(categoryId: string, excludeId: string) {
  return prisma.post.findMany({
    where: { categoryId, id: { not: excludeId }, status: 'PUBLISHED' },
    take: 3,
    orderBy: { views: 'desc' },
    include: {
      author: { select: { name: true, avatar: true } },
      category: true,
    },
  });
}

function extractHeadings(html: string): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = [];
  const regex = /<h([23])\s+id="([^"]*)"[^>]*>(.*?)<\/h[23]>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const id = match[2];
    const text = match[3].replace(/<[^>]*>/g, '');
    headings.push({ id, text, level });
  }
  if (headings.length === 0) {
    const fallbackRegex = /<h([23])[^>]*>(.*?)<\/h[23]>/gi;
    let fallbackMatch;
    while ((fallbackMatch = fallbackRegex.exec(html)) !== null) {
      const level = parseInt(fallbackMatch[1]);
      const text = fallbackMatch[2].replace(/<[^>]*>/g, '');
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      headings.push({ id, text, level });
    }
  }
  return headings;
}

export async function generateStaticParams() {
  try {
    const posts = await prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true },
    });
    return posts.map((post: { slug: string }) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Post Not Found' };

  const siteName = process.env.NEXT_PUBLIC_APP_NAME || 'MATools';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    title: `${post.metaTitle || post.title} | ${siteName}`,
    description: post.metaDesc || post.excerpt || '',
    alternates: { canonical: `${appUrl}/blog/${post.slug}` },
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDesc || post.excerpt || '',
      url: `${appUrl}/blog/${post.slug}`,
      siteName,
      type: 'article',
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name],
      ...(post.ogImage && { images: [{ url: post.ogImage, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle || post.title,
      description: post.metaDesc || post.excerpt || '',
      ...(post.ogImage && { images: [post.ogImage] }),
    },
  };
}

export default async function PostDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4">Post not found</Typography>
        <Typography variant="body1" color="text.secondary" mt={1}>
          The post you are looking for does not exist or has been removed.
        </Typography>
      </Container>
    );
  }

  const relatedPosts = await getRelatedPosts(post.categoryId, post.id);

  const window = new JSDOM('').window;
  const sanitized = DOMPurify(window as any).sanitize(post.content);

  const headings = extractHeadings(post.content);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDesc || post.excerpt,
    author: { '@type': 'Person', name: post.author.name },
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    image: post.ogImage,
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Stack direction="row" spacing={0.5} mb={2} alignItems="center" fontSize="0.875rem" color="text.secondary">
        <Link href="/" passHref legacyBehavior>
          <Typography component="a" variant="body2" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
            Home
          </Typography>
        </Link>
        <span>/</span>
        <Link href="/blog" passHref legacyBehavior>
          <Typography component="a" variant="body2" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
            Blog
          </Typography>
        </Link>
        <span>/</span>
        <Typography variant="body2" color="text.primary">
          {post.title}
        </Typography>
      </Stack>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Typography variant="h3" fontWeight={800} mb={2}>
            {post.title}
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center" mb={3}>
            <Avatar src={post.author.avatar || ''} sx={{ width: 40, height: 40 }}>
              {post.author.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {post.author.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {format(new Date(post.createdAt), 'MMMM dd, yyyy')}
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Stack direction="row" spacing={0.5} alignItems="center">
                <IconEye size={18} />
                <Typography variant="body2">{post.views}</Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <IconClock size={18} />
                <Typography variant="body2">{post.readTime} min read</Typography>
              </Stack>
            </Stack>
          </Stack>

          {post.ogImage && (
            <Box
              component="img"
              src={post.ogImage}
              alt={post.title}
              sx={{
                width: '100%',
                height: { xs: 250, md: 400 },
                objectFit: 'cover',
                borderRadius: 3,
                mb: 4,
              }}
            />
          )}

          <Chip label={post.category.name} size="small" sx={{ mb: 2 }} />

          {post.tags.length > 0 && (
            <Stack direction="row" spacing={0.5} mb={2}>
              {post.tags.map((tag: { id: string; name: string }) => (
                <Chip key={tag.id} label={tag.name} size="small" variant="outlined" />
              ))}
            </Stack>
          )}

          {post.excerpt && (
            <Typography
              variant="body1"
              color="text.secondary"
              fontStyle="italic"
              mb={3}
              sx={{ borderLeft: 3, borderColor: 'primary.main', pl: 2 }}
            >
              {post.excerpt}
            </Typography>
          )}

          <Divider sx={{ mb: 3 }} />

          <Box
            className="blog-content"
            sx={{
              '& h2': { fontSize: '1.5rem', fontWeight: 700, mt: 4, mb: 2 },
              '& h3': { fontSize: '1.25rem', fontWeight: 600, mt: 3, mb: 1.5 },
              '& p': { mb: 2, lineHeight: 1.8 },
              '& ul, & ol': { pl: 3, mb: 2 },
              '& li': { mb: 0.5 },
              '& blockquote': {
                borderLeft: 4,
                borderColor: 'primary.main',
                pl: 2,
                py: 1,
                my: 2,
                fontStyle: 'italic',
                color: 'text.secondary',
                bgcolor: 'grey.50',
                borderRadius: 1,
              },
              '& img': { maxWidth: '100%', height: 'auto', borderRadius: 2, my: 2 },
              '& a': { color: 'primary.main' },
              '& pre': {
                bgcolor: 'grey.900',
                color: 'grey.100',
                p: 2,
                borderRadius: 2,
                overflow: 'auto',
                my: 2,
              },
              '& code': {
                bgcolor: 'grey.100',
                px: 0.5,
                borderRadius: 0.5,
                fontSize: '0.875rem',
              },
            }}
            dangerouslySetInnerHTML={{ __html: sanitized }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ position: 'sticky', top: 100 }}>
            {headings.length > 0 && (
              <Box
                sx={{
                  p: 3,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  mb: 4,
                }}
              >
                <Typography variant="h6" fontWeight={700} mb={2}>
                  Table of Contents
                </Typography>
                <Box
                  component="ul"
                  sx={{
                    listStyle: 'none',
                    p: 0,
                    m: 0,
                    '& li': { mb: 1 },
                    '& a': {
                      textDecoration: 'none',
                      color: 'text.secondary',
                      fontSize: '0.875rem',
                      display: 'block',
                      '&:hover': { color: 'primary.main' },
                    },
                  }}
                >
                  {headings.map((h: { id: string; text: string; level: number }) => (
                    <Box
                      component="li"
                      key={h.id}
                      sx={{ pl: h.level === 3 ? 2 : 0 }}
                    >
                      <a href={`#${h.id}`}>{h.text}</a>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {relatedPosts.length > 0 && (
              <Box>
                <Typography variant="h6" fontWeight={700} mb={2}>
                  Related Posts
                </Typography>
                <Stack spacing={2}>
                  {relatedPosts.map((rp: any) => (
                    <PostCard key={rp.id} post={rp} />
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
