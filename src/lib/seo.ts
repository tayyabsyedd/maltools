import type { Metadata } from 'next';

interface SEOParams {
  title: string;
  description: string;
  slug?: string;
  ogImage?: string | null;
  publishedAt?: Date;
  updatedAt?: Date;
  author?: string;
  noIndex?: boolean;
}

export function generateMetadata({
  title,
  description,
  slug = '',
  ogImage,
  publishedAt,
  updatedAt,
  author,
  noIndex,
}: SEOParams): Metadata {
  const siteName = process.env.NEXT_PUBLIC_APP_NAME || 'MATools';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const fullTitle = `${title} | ${siteName}`;
  const url = slug ? `${appUrl}/${slug}` : appUrl;

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName,
      type: 'article',
      ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630 }] }),
      ...(publishedAt && { publishedTime: publishedAt.toISOString() }),
      ...(updatedAt && { modifiedTime: updatedAt.toISOString() }),
      ...(author && { authors: [author] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
    ...(noIndex && { robots: { index: false, follow: false } }),
  };
}
