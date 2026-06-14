import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import slugify from 'slugify';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const categorySlug = searchParams.get('category');
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const authorId = searchParams.get('authorId');

    const where: any = {};
    if (status) where.status = status;
    if (categorySlug) where.category = { slug: categorySlug };
    if (authorId) where.authorId = authorId;
    if (!status && !authorId) where.status = 'PUBLISHED';

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: { select: { id: true, name: true, email: true, avatar: true } },
          category: true,
          tags: true,
          _count: { select: { comments: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: { posts, total, page, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('GET /api/posts error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, excerpt, metaTitle, metaDesc, ogImage, status, categoryId, tags } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }

    let slug = slugify(title, { lower: true, strict: true });
    const existingPost = await prisma.post.findUnique({ where: { slug } });
    if (existingPost) slug = `${slug}-${Date.now()}`;

    const readTime = content ? Math.max(1, Math.ceil(content.replace(/<[^>]*>/g, '').split(' ').length / 200)) : 0;

    let resolvedCategoryId = categoryId;
    if (!resolvedCategoryId) {
      const defaultCat = await prisma.category.findFirst({ select: { id: true } });
      if (defaultCat) {
        resolvedCategoryId = defaultCat.id;
      } else {
        const newCat = await prisma.category.create({ data: { name: 'Uncategorized', slug: 'uncategorized' } });
        resolvedCategoryId = newCat.id;
      }
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content: content || '',
        excerpt: excerpt || null,
        metaTitle: metaTitle || null,
        metaDesc: metaDesc || null,
        ogImage: ogImage || null,
        status: status || 'DRAFT',
        readTime,
        authorId: session.user.id,
        categoryId: resolvedCategoryId,
        ...(tags && {
          tags: {
            connectOrCreate: tags.map((tag: string) => {
              const tagSlug = slugify(tag, { lower: true, strict: true });
              return {
                where: { slug: tagSlug },
                create: { name: tag, slug: tagSlug },
              };
            }),
          },
        }),
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: true,
        tags: true,
      },
    });

    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error) {
    console.error('POST /api/posts error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create post' }, { status: 500 });
  }
}
