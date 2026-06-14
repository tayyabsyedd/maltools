import { Container, Grid, Typography, Box } from '@mui/material';
import prisma from '@/lib/db';
import { generateMetadata as seoMetadata } from '@/lib/seo';
import PostCard from '@/app/components/blog/PostCard';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      _count: { select: { posts: true } },
      posts: {
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { name: true, avatar: true } },
          category: true,
        },
      },
    },
  });
}

export async function generateStaticParams() {
  try {
    const categories = await prisma.category.findMany({
      select: { slug: true },
    });
    return categories.map((cat: { slug: string }) => ({ slug: cat.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: 'Category Not Found' };

  return seoMetadata({
    title: `${category.name} Articles`,
    description: `Browse all articles in the ${category.name} category.`,
    slug: `category/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4">Category not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box mb={4}>
        <Typography variant="h3" fontWeight={700}>
          {category.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" mt={1}>
          {category._count.posts} {category._count.posts === 1 ? 'article' : 'articles'}
        </Typography>
      </Box>

      {category.posts.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            No posts in this category yet.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {category.posts.map((post: any) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post.id}>
              <PostCard post={post} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
