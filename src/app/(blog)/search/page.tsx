import { Container, Grid, Typography, Box, TextField, InputAdornment } from '@mui/material';
import prisma from '@/lib/db';
import { generateMetadata } from '@/lib/seo';
import PostCard from '@/app/components/blog/PostCard';
import type { Metadata } from 'next';

export const metadata: Metadata = generateMetadata({
  title: 'Search',
  description: 'Search our articles and tutorials.',
  slug: 'search',
  noIndex: true,
});

async function searchPosts(query: string) {
  if (!query.trim()) return [];

  return prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { excerpt: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: { views: 'desc' },
    take: 20,
    include: {
      author: { select: { name: true, avatar: true } },
      category: true,
    },
  });
}

function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark style="background-color: #fff3cd; padding: 0 2px; border-radius: 2px;">$1</mark>');
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';
  const posts = await searchPosts(query);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" fontWeight={700} mb={1}>
        Search
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Find articles and tutorials
      </Typography>

      <Box
        component="form"
        method="GET"
        action="/search"
        sx={{ mb: 4, maxWidth: 600 }}
      >
        <TextField
          fullWidth
          name="q"
          defaultValue={query}
          placeholder="Search articles..."
          variant="outlined"
          autoComplete="off"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Box component="span" sx={{ fontSize: 20 }}>🔍</Box>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {query && (
        <Typography variant="body2" color="text.secondary" mb={3}>
          {posts.length} result{posts.length !== 1 ? 's' : ''} for &quot;{query}&quot;
        </Typography>
      )}

      {posts.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" mb={1}>
            {query ? 'No results found.' : 'Enter a search term to find articles.'}
          </Typography>
          {query && (
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search terms or browse all articles.
            </Typography>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {posts.map((post: any) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post.id}>
              <PostCard post={post} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
