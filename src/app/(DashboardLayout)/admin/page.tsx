'use client';
import { Box, Grid, Typography, Paper } from '@mui/material';
import { IconArticle, IconUsers, IconEye, IconMessage } from '@tabler/icons-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: `${color}15`,
          color: color,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h4" fontWeight={700}>
          {value.toLocaleString()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Box>
    </Paper>
  );
}

export default function AdminDashboard() {
  const { data: postsData } = useSWR('/api/posts?limit=1', fetcher);
  const totalPosts = postsData?.data?.total || 0;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={4}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Posts" value={totalPosts} icon={<IconArticle size={28} />} color="#5D87FF" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Views" value={0} icon={<IconEye size={28} />} color="#49BEFF" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Users" value={0} icon={<IconUsers size={28} />} color="#FFAE1F" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Comments" value={0} icon={<IconMessage size={28} />} color="#FA896B" />
        </Grid>
      </Grid>
    </Box>
  );
}
