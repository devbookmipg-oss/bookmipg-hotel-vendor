'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  styled,
  Paper,
  Container,
  Divider,
} from '@mui/material';
import { useAuth } from '@/context';
import { GetDataList, GetSingleData } from '@/utils/ApiFunctions';
import { GetTodaysDate } from '@/utils/DateFetcher';
import { Loader } from '@/component/common';
import {
  Users,
  Calendar,
  Home,
  TrendingUp,
  Clock,
  UtensilsCrossed,
} from 'lucide-react';

// Color constants
const BRAND_RED = '#c20f12';

// Styled Components
const GreetingCard = styled(Paper)({
  background: `linear-gradient(135deg, ${BRAND_RED} 0%, #a60a0a 100%)`,
  color: '#fff',
  padding: '40px',
  borderRadius: '8px',
  marginBottom: '30px',
  boxShadow: '0 4px 20px rgba(194, 15, 18, 0.15)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const ClockBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
});

const LiveClock = styled(Typography)({
  fontSize: '2.5rem',
  fontWeight: 'bold',
  fontFamily: '"Courier New", monospace',
  letterSpacing: '2px',
});

const Page = () => {
  const { auth } = useAuth();
  const [currentTime, setCurrentTime] = useState('');
  const todaysDate = GetTodaysDate().dateString;
  const today = new Date(todaysDate);
  const [selectedDate] = useState(today);

  // Live clock effect
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }),
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch all bookings
  const bookings = GetDataList({
    auth,
    endPoint: 'room-bookings',
  });

  const rooms = GetDataList({
    auth,
    endPoint: 'rooms',
  });

  // Get greeting message based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (!bookings || !rooms) {
    return <Loader />;
  }

  return (
    <Container maxWidth="xl">
      {/* Greeting Section with Clock */}
      <GreetingCard elevation={0} sx={{ mt: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            {getGreeting()}, {auth?.user?.name || 'Welcome'}! 👋
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.95 }}>
            {auth?.user?.hotel?.hotel_name}
          </Typography>
          <Typography
            variant="caption"
            sx={{ opacity: 0.85, display: 'block', mt: 1 }}
          >
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
        </Box>

        {/* Live Clock */}
        <ClockBox>
          <Clock size={32} />
          <LiveClock>{currentTime}</LiveClock>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            Current Time
          </Typography>
        </ClockBox>
      </GreetingCard>
    </Container>
  );
};

export default Page;
