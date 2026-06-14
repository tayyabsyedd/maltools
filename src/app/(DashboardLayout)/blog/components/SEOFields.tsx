'use client';
/**
 * app/(DashboardLayout)/blog/components/SEOFields.tsx
 *
 * SEO Fields Component
 * These fields help Google understand and display your blog post correctly.
 *
 * - Meta Title   → shown as the blue clickable link in Google search results
 * - Meta Desc    → shown as the grey text under the title in Google
 * - Slug         → the URL of your post (auto-generated, can be edited)
 */

import {
  Box,
  Typography,
  Chip,
} from '@mui/material';
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';

interface SEOFieldsProps {
  slug: string;
  metaTitle: string;
  metaDesc: string;
  onChange: (field: string, value: string) => void;
}

export default function SEOFields({ slug, metaTitle, metaDesc, onChange }: SEOFieldsProps) {
  const metaTitleLen = metaTitle.length;
  const metaDescLen  = metaDesc.length;

  // Helper: color changes based on length (green = good, red = too long)
  const titleColor = metaTitleLen === 0 ? 'default' : metaTitleLen <= 60 ? 'success' : 'error';
  const descColor  = metaDescLen  === 0 ? 'default' : metaDescLen  <= 160 ? 'success' : 'error';

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} mb={2} color="text.primary">
        🔍 SEO Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        These fields control how your post appears in Google search results.
      </Typography>

      {/* URL Slug */}
      <Box mb={2}>
        <CustomFormLabel htmlFor="slug">
          URL Slug
        </CustomFormLabel>
        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
          Your post URL: <strong>maltools.com/blog/<span style={{ color: '#5D87FF' }}>{slug || 'your-post-slug'}</span></strong>
        </Typography>
        <CustomTextField
          id="slug"
          fullWidth
          value={slug}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('slug', e.target.value)}
          placeholder="how-to-convert-heic-to-jpg"
        />
      </Box>

      {/* Meta Title */}
      <Box mb={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <CustomFormLabel htmlFor="metaTitle">Meta Title (Google Title)</CustomFormLabel>
          <Chip
            label={`${metaTitleLen}/60`}
            size="small"
            color={titleColor as any}
            variant="outlined"
          />
        </Box>
        <CustomTextField
          id="metaTitle"
          fullWidth
          value={metaTitle}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('metaTitle', e.target.value)}
          placeholder="How to Convert HEIC to JPG Free Online — MATools"
        />
        <Typography variant="caption" color="text.secondary">
          Keep under 60 characters for best results in Google.
        </Typography>
      </Box>

      {/* Meta Description */}
      <Box mb={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <CustomFormLabel htmlFor="metaDesc">Meta Description (Google Snippet)</CustomFormLabel>
          <Chip
            label={`${metaDescLen}/160`}
            size="small"
            color={descColor as any}
            variant="outlined"
          />
        </Box>
        <CustomTextField
          id="metaDesc"
          fullWidth
          multiline
          rows={3}
          value={metaDesc}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('metaDesc', e.target.value)}
          placeholder="Learn how to convert HEIC photos from iPhone to JPG format for free. No software needed — works in your browser instantly."
        />
        <Typography variant="caption" color="text.secondary">
          Keep under 160 characters. Write it like an ad — make people want to click.
        </Typography>
      </Box>

      {/* Google Preview Box */}
      {(metaTitle || metaDesc) && (
        <Box
          sx={{
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'background.paper',
            mt: 2,
          }}
        >
          <Typography variant="caption" color="text.secondary" mb={1} display="block">
            📱 Google Preview:
          </Typography>
          <Typography
            sx={{ color: '#1a0dab', fontSize: '1.1rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          >
            {metaTitle || 'Your Post Title'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#006621' }}>
            maltools.com/blog/{slug || 'your-post-slug'}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {metaDesc || 'Your meta description will appear here...'}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
