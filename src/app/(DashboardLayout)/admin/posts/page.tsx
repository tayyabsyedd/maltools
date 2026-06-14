'use client';
import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Stack,
  Menu,
  MenuItem,
  TablePagination,
} from '@mui/material';
import Link from 'next/link';
import { IconPlus, IconDotsVertical, IconEdit, IconTrash, IconEye } from '@tabler/icons-react';
import { format } from 'date-fns';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const statusColors: Record<string, 'success' | 'warning' | 'default'> = {
  PUBLISHED: 'success',
  DRAFT: 'warning',
  ARCHIVED: 'default',
};

export default function AdminPostsPage() {
  const [page, setPage] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);

  const { data, mutate } = useSWR(`/api/posts?page=${page + 1}&limit=10`, fetcher);
  const posts = data?.data?.posts || [];
  const total = data?.data?.total || 0;

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      mutate();
    } catch (e) {
      console.error('Delete failed', e);
    }
    setAnchorEl(null);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Posts
        </Typography>
        <Button
          component={Link}
          href="/admin/posts/new"
          variant="contained"
          startIcon={<IconPlus size={18} />}
        >
          New Post
        </Button>
      </Stack>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Views</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {posts.map((post: any) => (
              <TableRow key={post.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {post.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={post.status} size="small" color={statusColors[post.status] || 'default'} />
                </TableCell>
                <TableCell>{post.category?.name}</TableCell>
                <TableCell>{post.author?.name}</TableCell>
                <TableCell>{post.views}</TableCell>
                <TableCell>
                  {format(new Date(post.createdAt), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={(e) => {
                      setAnchorEl(e.currentTarget);
                      setSelectedPost(post.id);
                    }}
                  >
                    <IconDotsVertical size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={10}
          rowsPerPageOptions={[10]}
        />
      </TableContainer>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem
          component={Link}
          href={`/admin/posts/${selectedPost}`}
        >
          <IconEdit size={16} style={{ marginRight: 8 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedPost!)} sx={{ color: 'error.main' }}>
          <IconTrash size={16} style={{ marginRight: 8 }} /> Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}
