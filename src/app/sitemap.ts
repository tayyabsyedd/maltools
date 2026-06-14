import prisma from '@/lib/db';

export default async function sitemap() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const staticPages = [
    { url: appUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${appUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${appUrl}/search`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.3 },
  ];

  try {
    const [posts, categories] = await Promise.all([
      prisma.post.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true },
      }),
      prisma.category.findMany({
        select: { slug: true },
      }),
    ]);

    const postPages = posts.map((post: { slug: string; updatedAt: Date }) => ({
      url: `${appUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const categoryPages = categories.map((cat: { slug: string }) => ({
      url: `${appUrl}/category/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...staticPages, ...postPages, ...categoryPages];
  } catch {
    return staticPages;
  }
}
