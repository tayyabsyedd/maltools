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
      include: { author: { select: { name: true } }, category: true, tags: true },
    });

    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
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

    const body = await req.json();
    const { title, content, excerpt, ogImage, metaTitle, metaDesc, categoryId, tags, status } = body;

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

    const updated = await prisma.post.update({
      where: { id },
      data: {
        ...(title !== undefined && { title, slug }),
        ...(content !== undefined && { content, readTime }),
        ...(excerpt !== undefined && { excerpt }),
        ...(ogImage !== undefined && { ogImage }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDesc !== undefined && { metaDesc }),
        ...(status !== undefined && { status }),
        ...(categoryId !== undefined && { categoryId }),
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
      include: { author: { select: { name: true } }, category: true, tags: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PUT /api/blog/[id] error:', error);
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
    await prisma.post.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { message: 'Post deleted successfully' } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete post' }, { status: 500 });
  }
}
