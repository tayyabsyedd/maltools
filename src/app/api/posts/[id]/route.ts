import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import slugify from 'slugify';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true, avatar: true } },
        category: true,
        tags: true,
        comments: {
          where: { approved: true },
          include: { author: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error('GET /api/posts/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    if (existing.authorId !== session.user.id && session.user.role === 'AUTHOR') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, excerpt, metaTitle, metaDesc, ogImage, status, categoryId, tags } = body;

    let slug = existing.slug;
    if (title && title !== existing.title) {
      slug = slugify(title, { lower: true, strict: true });
      const slugConflict = await prisma.post.findFirst({
        where: { slug, NOT: { id } },
      });
      if (slugConflict) slug = `${slug}-${Date.now()}`;
    }

    const readTime = content
      ? Math.max(1, Math.ceil(content.replace(/<[^>]*>/g, '').split(' ').length / 200))
      : existing.readTime;

    const updateData: any = {
      ...(title !== undefined && { title }),
      slug,
      ...(content !== undefined && { content, readTime }),
      ...(excerpt !== undefined && { excerpt }),
      ...(metaTitle !== undefined && { metaTitle }),
      ...(metaDesc !== undefined && { metaDesc }),
      ...(ogImage !== undefined && { ogImage }),
      ...(status !== undefined && { status }),
      ...(categoryId !== undefined && { categoryId: categoryId || (await prisma.category.findFirst({ select: { id: true } }))?.id || (await prisma.category.create({ data: { name: 'Uncategorized', slug: 'uncategorized' } })).id }),
    };

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...updateData,
        ...(tags && {
          tags: {
            set: [],
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

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error('PUT /api/posts/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    if (existing.authorId !== session.user.id && session.user.role === 'AUTHOR') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await prisma.post.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { message: 'Post deleted successfully' } });
  } catch (error) {
    console.error('DELETE /api/posts/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete post' }, { status: 500 });
  }
}
