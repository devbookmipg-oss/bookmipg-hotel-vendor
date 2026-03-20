'use client';
import {
  Box,
  Button,
  Card,
  TextField,
  Typography,
  Link,
  Divider,
  FormControl,
  InputAdornment,
  IconButton,
  OutlinedInput,
  CircularProgress,
  Paper,
  Fade,
  Zoom,
} from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// mui icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LoginIcon from '@mui/icons-material/Login';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

import { ErrorToast, WarningToast } from '@/utils/GenerateToast';
import styled from '@emotion/styled';
import { useAuth } from '@/context';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { setCookie } from 'nookies';
import axios from 'axios';

import { BASEURL } from '@/config/MainApi';

const StyledCard = styled(Card)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease-in-out;
  &:hover {
    transform: translateY(-5px);
  }
`;

const GradientButton = styled(Button)`
  background: linear-gradient(45deg, #eb282c 30%, #ff6b6b 90%);
  border-radius: 12px;
  border: 0;
  color: white;
  height: 48px;
  padding: 0 30px;
  box-shadow: 0 4px 15px rgba(235, 40, 44, 0.3);
  transition: all 0.3s ease-in-out;
  &:hover {
    background: linear-gradient(45deg, #d41e22 30%, #ff5252 90%);
    box-shadow: 0 6px 20px rgba(235, 40, 44, 0.4);
    transform: scale(1.02);
  }
`;

const AnimatedTextField = styled(TextField)`
  & .MuiOutlinedInput-root {
    border-radius: 12px;
    transition: all 0.3s ease-in-out;
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    &.Mui-focused {
      box-shadow: 0 4px 12px rgba(235, 40, 44, 0.2);
    }
  }
`;

const AnimatedOutlinedInput = styled(OutlinedInput)`
  border-radius: 12px;
  transition: all 0.3s ease-in-out;
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  &.Mui-focused {
    box-shadow: 0 4px 12px rgba(235, 40, 44, 0.2);
  }
`;

const CustomLabel = styled(Box)`
  display: flex;
  align-items: center;
  font-size: 15px;
  margin-bottom: 6px;
  color: #4a4a4a;
  font-weight: 500;
  & > svg {
    font-size: 18px;
    margin-right: 6px;
    color: #eb282c;
  }
`;

const BackgroundGradient = styled(Box)`
  background: linear-gradient(135deg, #eb282c 0%, #ff8c8c 50%, #ffd700 100%);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

export default function FacebookLogin() {
  const router = useRouter();
  const { dispatchAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // fet the populated user
  const getPopulatedUser = async (token, id) => {
    try {
      const res = await axios.get(`${BASEURL}/users/${id}?populate=*`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = res.data;
      return result;
    } catch (err) {
      console.log(err);
    }
  };

  const getUser = async (token, id) => {
    try {
      const res = await axios.get(`${BASEURL}/hotels/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = res.data.data;
      return result;
    } catch (err) {
      console.log(err);
    }
  };

  // authenticating user account
  const authenticateUser = async (data, event) => {
    event.preventDefault();
    if (!data.userName || !data.password) {
      WarningToast('Please Enter Email and Password');
      return;
    }
    dispatchAuth({ type: 'AUTH_LOADING' });
    setLoading(true);
    try {
      const payload = {
        identifier: data.userName,
        password: data.password,
      };
      const res = await axios.post(`${BASEURL}/auth/local`, payload);

      if (res.data.jwt && res.data.user) {
        const populatedUser = await getPopulatedUser(
          res.data.jwt,
          res.data.user.id,
        );
        const hotel = await getUser(res.data.jwt, populatedUser.hotel_id);

        // set the jwt in the cookies
        setCookie(null, 'token', res.data.jwt, {
          maxAge: 30 * 24 * 60 * 60,
          path: '/',
        });
        // set the user in the cookies
        setCookie(null, 'user', JSON.stringify(populatedUser), {
          maxAge: 30 * 24 * 60 * 60,
          path: '/',
        });
        setCookie(null, 'hotel', JSON.stringify(hotel), {
          maxAge: 30 * 24 * 60 * 60,
          path: '/',
        });
        dispatchAuth({
          type: 'LOGIN_SUCCESS',
          payload: { token: res.data.jwt, user: populatedUser },
        });

        router.push(`/dashboard`);
        return;
      }
    } catch (error) {
      setLoading(false);
      ErrorToast('Email or Password does not exist.');
      console.log(`Error while login: ${error}`);
      dispatchAuth({
        type: 'LOGIN_FAILED',
        payload: error.message
          ? error.message
          : 'Something went wrong, try again',
      });
    }
  };

  return (
    <BackgroundGradient
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          animation: 'pulse 4s ease-in-out infinite',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          animation: 'pulse 6s ease-in-out infinite',
        }}
      />

      <Fade in={true} timeout={1000}>
        <Box
          sx={{
            maxWidth: '1200px',
            width: '100%',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            gap: 6,
            px: 3,
            zIndex: 1,
          }}
        >
          {/* Left Side - Brand Section */}
          <Zoom in={true} style={{ transitionDelay: '200ms' }}>
            <Box
              sx={{
                flex: 1,
                color: 'white',
                textAlign: { xs: 'center', md: 'left' },
              }}
            >
              <Box
                sx={{
                  mb: 4,
                  animation: 'float 3s ease-in-out infinite',
                  '@keyframes float': {
                    '0%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                    '100%': { transform: 'translateY(0px)' },
                  },
                }}
              >
                <Image
                  src="/logo-white.png"
                  height={150}
                  width={300}
                  alt="logo"
                  style={{
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))',
                  }}
                />
              </Box>

              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                  fontSize: { xs: '2rem', md: '2.5rem' },
                }}
              >
                Welcome Back!
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  opacity: 0.9,
                  mb: 4,
                  maxWidth: '400px',
                  mx: { xs: 'auto', md: 0 },
                  fontWeight: 400,
                }}
              >
                Access your dashboard and manage your content with ease
              </Typography>

              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  gap: 2,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}
              >
                <AdminPanelSettingsIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Secure admin access • Real-time updates • Full control
                </Typography>
              </Box>
            </Box>
          </Zoom>

          {/* Right Side - Login Card */}
          <Zoom in={true} style={{ transitionDelay: '400ms' }}>
            <StyledCard
              sx={{
                flex: 1,
                p: { xs: 3, sm: 5 },
                maxWidth: '440px',
                width: '100%',
              }}
            >
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: '#1a1a1a',
                    mb: 1,
                  }}
                >
                  Sign In
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please enter your credentials to continue
                </Typography>
              </Box>

              <form onSubmit={handleSubmit(authenticateUser)}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <FormControl fullWidth>
                    <CustomLabel>
                      <AccountCircleOutlinedIcon />
                      Username or Email
                    </CustomLabel>
                    <AnimatedTextField
                      id="username"
                      placeholder="Enter your username or email"
                      variant="outlined"
                      size="medium"
                      {...register('userName')}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlinedIcon sx={{ color: '#eb282c' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </FormControl>

                  <FormControl variant="outlined" fullWidth>
                    <CustomLabel>
                      <LockOutlinedIcon />
                      Password
                    </CustomLabel>
                    <AnimatedOutlinedInput
                      {...register('password')}
                      size="medium"
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      startAdornment={
                        <InputAdornment position="start">
                          <LockOutlinedIcon sx={{ color: '#eb282c' }} />
                        </InputAdornment>
                      }
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  </FormControl>

                  <GradientButton
                    variant="contained"
                    fullWidth
                    type="submit"
                    disabled={loading}
                    startIcon={!loading && <LoginIcon />}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: 'white' }} />
                    ) : (
                      'Sign In'
                    )}
                  </GradientButton>

                  <Divider sx={{ my: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      secure login
                    </Typography>
                  </Divider>
                </Box>
              </form>
            </StyledCard>
          </Zoom>
        </Box>
      </Fade>

      {/* Footer */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          textAlign: 'center',
          width: '100%',
          color: 'white',
          opacity: 0.7,
          fontSize: '14px',
        }}
      >
        © {new Date().getFullYear()} Your Company. All rights reserved.
      </Box>
    </BackgroundGradient>
  );
}
