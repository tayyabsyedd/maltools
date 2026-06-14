'use client';
import { useState, useEffect, use } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  MenuItem,
  Stack,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import PostEditor from '@/app/(DashboardLayout)/blog/components/PostEditor';
import SEOFields from '@/app/(DashboardLayout)/blog/components/SEOFields';
import slugify from 'slugify';

export default function PostEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<any[]>([]);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    metaTitle: '',
    metaDesc: '',
    ogImage: '',
    status: 'DRAFT',
    categoryId: '',
    tags: '',
  });

  useEffect(() => {
    fetch('/api/posts?limit=100')
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.posts) {
          const cats = d.data.posts
            .map((p: any) => p.category)
            .filter(Boolean)
            .filter((c: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.id === c.id) === i);
          setCategories(cats);
        }
      })
      .catch(() => {});

    if (!isNew) {
      fetch(`/api/posts/${id}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.data) {
            const post = d.data;
            setForm({
              title: post.title || '',
              slug: post.slug || '',
              content: post.content || '',
              excerpt: post.excerpt || '',
              metaTitle: post.metaTitle || '',
              metaDesc: post.metaDesc || '',
              ogImage: post.ogImage || '',
              status: post.status || 'DRAFT',
              categoryId: post.categoryId || '',
              tags: post.tags?.map((t: any) => t.name).join(', ') || '',
            });
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isNew, id]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'title' && (isNew || prev.slug === slugify(prev.title, { lower: true, strict: true }))) {
        updated.slug = slugify(value, { lower: true, strict: true });
      }
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const tags = form.tags
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean);

      const body = {
        ...form,
        tags,
        ...(isNew ? {} : { slug: form.slug }),
      };

      const res = await fetch(isNew ? '/api/posts' : `/api/posts/${id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to save post');
      } else {
        router.push('/admin/posts');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setForm((prev) => ({ ...prev, status: 'PUBLISHED' }));
    setSaving(true);
    setError('');

    try {
      const tags = form.tags
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean);

      const body = {
        ...form,
        status: 'PUBLISHED',
        tags,
        ...(isNew ? {} : { slug: form.slug }),
      };

      const res = await fetch(isNew ? '/api/posts' : `/api/posts/${id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to publish post');
      } else {
        router.push('/admin/posts');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to publish post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          {isNew ? 'Create Post' : 'Edit Post'}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Save Draft'}
          </Button>
          <Button variant="contained" onClick={handlePublish} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Publish'}
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Content
            </Typography>
            <TextField
              fullWidth
              label="Title"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Excerpt"
              multiline
              rows={2}
              value={form.excerpt}
              onChange={(e) => handleChange('excerpt', e.target.value)}
              sx={{ mb: 2 }}
              placeholder="Brief description shown in post cards"
            />
            <PostEditor content={form.content} onChange={(html) => handleChange('content', html)} />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Settings
            </Typography>
            <TextField
              select
              fullWidth
              label="Status"
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
              sx={{ mb: 2 }}
            >
              <MenuItem value="DRAFT">Draft</MenuItem>
              <MenuItem value="PUBLISHED">Published</MenuItem>
              <MenuItem value="ARCHIVED">Archived</MenuItem>
            </TextField>
            <TextField
              select
              fullWidth
              label="Category"
              value={form.categoryId}
              onChange={(e) => handleChange('categoryId', e.target.value)}
              sx={{ mb: 2 }}
            >
              {categories.map((cat: any) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Tags (comma separated)"
              value={form.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              sx={{ mb: 2 }}
              placeholder="tag1, tag2, tag3"
            />
            <TextField
              fullWidth
              label="OG Image URL"
              value={form.ogImage}
              onChange={(e) => handleChange('ogImage', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <SEOFields
              slug={form.slug}
              metaTitle={form.metaTitle}
              metaDesc={form.metaDesc}
              onChange={handleChange}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
