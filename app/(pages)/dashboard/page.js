'use client';
import { Box, Breadcrumbs, Typography, Card, CardContent } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export default function Home() {
  return (
    <>
      {/* Breadcrumb Header */}
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Typography color="text.primary">Dashboard</Typography>
        </Breadcrumbs>
      </Box>

      {/* Welcome Card */}
      <Box sx={{ px: 3, py: 3 }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
            color: '#fff',
          }}
        >
          <CardContent>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Welcome to Bookmipg Vendor Dashboard 👋
            </Typography>

            <Typography variant="body1" sx={{ opacity: 0.95 }}>
              Manage your hotel listings, room availability, bookings, pricing,
              and performance — all from one place.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
