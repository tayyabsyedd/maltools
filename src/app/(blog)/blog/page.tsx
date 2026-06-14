import { Container, Grid, Typography, Box, Chip, Stack } from '@mui/material';
import Link from 'next/link';
import prisma from '@/lib/db';
import { generateMetadata } from '@/lib/seo';
import PostCard from '@/app/components/blog/PostCard';
import type { Metadata } from 'next';

export const metadata: Metadata = generateMetadata({
  title: 'All Blog Posts',
  description: 'Browse all our articles, tutorials and guides.',
  slug: 'blog',
});

const POSTS_PER_PAGE = 10;

async function getPosts(page: number, categorySlug?: string) {
  const where = {
    status: 'PUBLISHED' as const,
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * POSTS_PER_PAGE,
      take: POSTS_PER_PAGE,
      include: {
        author: { select: { name: true, avatar: true } },
        category: true,
      },
    }),
    prisma.post.count({ where }),
  ]);

  return { posts, totalPages: Math.ceil(total / POSTS_PER_PAGE), currentPage: page };
}

async function getCategories() {
  return prisma.category.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: 'asc' },
  });
}

export default async function BlogListingPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const categorySlug = params.category;

  const [{ posts, totalPages, currentPage }, categories] = await Promise.all([
    getPosts(page, categorySlug),
    getCategories(),
  ]);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" fontWeight={700} mb={1}>
        Blog
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Discover insights, tutorials, and updates
      </Typography>

      <Stack direction="row" spacing={1} mb={4} flexWrap="wrap" useFlexGap>
        <Chip
          label="All"
          component={Link}
          href="/blog"
          clickable
          variant={categorySlug ? 'outlined' : 'filled'}
          color={categorySlug ? 'default' : 'primary'}
        />
        {categories.map((cat: any) => (
          <Chip
            key={cat.id}
            label={`${cat.name} (${cat._count.posts})`}
            component={Link}
            href={`/blog?category=${cat.slug}`}
            clickable
            variant={categorySlug === cat.slug ? 'filled' : 'outlined'}
            color={categorySlug === cat.slug ? 'primary' : 'default'}
          />
        ))}
      </Stack>

      {posts.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            No posts found.
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {posts.map((post: any) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post.id}>
                <PostCard post={post} />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" gap={1} mt={6}>
                {currentPage > 1 && (
                  <Chip
                    label="← Previous"
                    component={Link}
                    href={`/blog?page=${currentPage - 1}${categorySlug ? `&category=${categorySlug}` : ''}`}
                    clickable
                    variant="outlined"
                  />
                )}
                <Chip
                  label={`Page ${currentPage} of ${totalPages}`}
                  variant="filled"
                  color="primary"
                />
                {currentPage < totalPages && (
                  <Chip
                    label="Next →"
                    component={Link}
                    href={`/blog?page=${currentPage + 1}${categorySlug ? `&category=${categorySlug}` : ''}`}
                    clickable
                    variant="outlined"
                  />
                )}
              </Box>
          )}
        </>
      )}
    </Container>
  );
}
