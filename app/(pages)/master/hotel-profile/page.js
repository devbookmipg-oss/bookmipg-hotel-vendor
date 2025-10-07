'use client';
import {
  Typography,
  Container,
  Box,
  Breadcrumbs,
  Link,
  Grid,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
  UpdateHotelBanner,
  UpdateHotelImages,
  UpdateHotelProfileForm,
} from '@/component/updateForms';
import { GetSingleData } from '@/utils/ApiFunctions';
import { useAuth } from '@/context';
import { Loader } from '@/component/common';

export default function HotelRestaurantForm() {
  const { auth } = useAuth();

  const data = GetSingleData({
    endPoint: 'hotels',
    auth: auth,
    id: auth?.user?.hotel_id,
  });

  return (
    <>
      <Box sx={{ px: 3, py: 2, backgroundColor: '#f4f6f8' }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <Link underline="hover" color="inherit" href="/">
            Dashboard
          </Link>
          <Typography color="text.primary">Hotel Profile</Typography>
        </Breadcrumbs>
      </Box>
      {!data ? (
        <Loader />
      ) : (
        <Grid container spacing={2} p={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <UpdateHotelProfileForm data={data} auth={auth} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <UpdateHotelBanner data={data} auth={auth} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            {' '}
            <UpdateHotelImages data={data} auth={auth} />
          </Grid>
        </Grid>
      )}
    </>
  );
}
