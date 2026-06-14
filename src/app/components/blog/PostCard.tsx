import Link from 'next/link';
import { Box, Typography, Stack, Chip, Avatar } from '@mui/material';
import { format } from 'date-fns';
import { IconEye, IconClock } from '@tabler/icons-react';

interface PostCardProps {
  post: {
    title: string;
    slug: string;
    excerpt: string | null;
    ogImage: string | null;
    readTime: number;
    views: number;
    createdAt: Date;
    author: { name: string; avatar: string | null };
    category: { name: string; slug: string };
  };
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Box
      component={Link}
      href={`/blog/${post.slug}`}
      sx={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'box-shadow 0.3s, transform 0.3s',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box
        component="img"
        src={post.ogImage || '/images/blog/blog-img1.jpg'}
        alt={post.title}
        sx={{
          width: '100%',
          height: 220,
          objectFit: 'cover',
        }}
      />
      <Box sx={{ p: 2.5 }}>
        <Chip
          label={post.category.name}
          size="small"
          component={Link}
          href={`/category/${post.category.slug}`}
          clickable
          sx={{ mb: 1.5, fontWeight: 500 }}
        />
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {post.title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {post.excerpt}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar
            src={post.author.avatar || ''}
            sx={{ width: 28, height: 28, fontSize: 14 }}
          >
            {post.author.name.charAt(0)}
          </Avatar>
          <Typography variant="caption" color="text.secondary">
            {post.author.name}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconEye size={14} />
            <Typography variant="caption" color="text.secondary">
              {post.views}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconClock size={14} />
            <Typography variant="caption" color="text.secondary">
              {post.readTime} min
            </Typography>
          </Stack>
        </Stack>
        <Typography variant="caption" color="text.disabled" mt={1} display="block">
          {format(new Date(post.createdAt), 'MMM dd, yyyy')}
        </Typography>
      </Box>
    </Box>
  );
}
