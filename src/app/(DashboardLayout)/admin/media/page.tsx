'use client';
import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  IconButton,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import { IconUpload, IconTrash, IconCopy } from '@tabler/icons-react';
import { useDropzone } from 'react-dropzone';

export default function AdminMediaPage() {
  const [images, setImages] = useState<{ url: string; publicId: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    setError('');

    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          setImages((prev) => [data.data, ...prev]);
        } else {
          setError(data.error || 'Upload failed');
        }
      } catch (e: any) {
        setError(e.message || 'Upload failed');
      }
    }

    setUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] },
    maxSize: 5 * 1024 * 1024,
    multiple: true,
  });

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Media Library
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        {...getRootProps()}
        sx={{
          p: 6,
          mb: 4,
          borderRadius: 3,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          bgcolor: isDragActive ? 'primary.50' : 'background.paper',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s',
          '&:hover': { borderColor: 'primary.light', bgcolor: 'grey.50' },
        }}
      >
        <input {...getInputProps()} />
        <IconUpload size={48} style={{ color: '#9e9e9e', marginBottom: 16 }} />
        <Typography variant="h6" color="text.secondary">
          {isDragActive ? 'Drop files here...' : 'Drag & drop images or click to browse'}
        </Typography>
        <Typography variant="body2" color="text.disabled" mt={1}>
          JPEG, PNG, WebP • Max 5MB
        </Typography>
      </Paper>

      {uploading && (
        <Box textAlign="center" py={4}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" mt={1}>
            Uploading...
          </Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        {images.map((img: { url: string; publicId: string }, i: number) => (
          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={i}>
            <Paper
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                '&:hover .actions': { opacity: 1 },
              }}
            >
              <Box
                component="img"
                src={img.url}
                alt="Uploaded"
                sx={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
              />
              <Stack
                direction="row"
                className="actions"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  p: 1,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  opacity: 0,
                  transition: 'opacity 0.3s',
                  justifyContent: 'flex-end',
                }}
              >
                <IconButton size="small" sx={{ color: '#fff' }} onClick={() => copyToClipboard(img.url)}>
                  <IconCopy size={16} />
                </IconButton>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {images.length === 0 && !uploading && (
        <Box textAlign="center" py={8}>
          <Typography color="text.secondary">No images uploaded yet.</Typography>
        </Box>
      )}
    </Box>
  );
}
