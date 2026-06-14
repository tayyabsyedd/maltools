'use client';
/**
 * authForms/AuthLogin.tsx
 *
 * Login Form — Connected to NextAuth
 *
 * This is the actual form users fill in.
 * When they click "Sign In", it calls NextAuth's signIn() function
 * which checks their email+password against the database.
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { loginType } from '@/app/(DashboardLayout)/types/auth/auth';
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';

const AuthLogin = ({ title, subtitle, subtext }: loginType) => {
  const router = useRouter();

  // Form state
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      // Call NextAuth signIn — this checks your database
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false, // Don't auto-redirect, we'll handle it below
      });

      if (result?.error) {
        // Wrong email or password
        setError('Invalid email or password. Please try again.');
      } else {
        // ✅ Login successful — go to dashboard
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Title */}
      {title && (
        <Typography fontWeight="700" variant="h3" mb={1}>
          {title}
        </Typography>
      )}

      {subtext}

      {/* Error message (shown if login fails) */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          {/* Email Field */}
          <Box>
            <CustomFormLabel htmlFor="email">Email Address</CustomFormLabel>
            <CustomTextField
              id="email"
              type="email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              placeholder="admin@maltools.com"
              autoComplete="email"
            />
          </Box>

          {/* Password Field */}
          <Box>
            <CustomFormLabel htmlFor="password">Password</CustomFormLabel>
            <CustomTextField
              id="password"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </Box>

          {/* Sign In Button */}
          <Box mt={1}>
            <Button
              color="primary"
              variant="contained"
              size="large"
              fullWidth
              type="submit"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>
        </Stack>
      </form>

      {subtitle}
    </>
  );
};

export default AuthLogin;
