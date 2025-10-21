import { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Paper,
  Chip,
  IconButton,
  MenuItem,
} from '@mui/material';
import { motion } from 'framer-motion';
import { AddCircle, Cancel } from '@mui/icons-material';
import { indianStatesAndUTs, stateDistricts } from '@/data/StatesDistricts';
import { ErrorToast, SuccessToast } from '@/utils/GenerateToast';
import { UpdateData } from '@/utils/ApiFunctions';

const UpdateHotelProfileForm = ({ data, auth }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hotel_name: data.hotel_name || '',
    hotel_mobile: data.hotel_mobile || '',
    hotel_email: data.hotel_email || '',
    hotel_alt_mobile: data.hotel_alt_mobile || '',
    hotel_gst_no: data.hotel_gst_no || '',
    hotel_website: data.hotel_website || '',
    hotel_address_line1: data.hotel_address_line1 || '',

    hotel_district: data.hotel_district || '',
    hotel_state: data.hotel_state || 'West Bengal',
    hotel_pincode: data.hotel_pincode || '',
    hotel_checkin: data.hotel_checkin || '',
    hotel_checkout: data.hotel_checkout || '',
    hotel_latitude: data.hotel_latitude || '',
    hotel_longitude: data.hotel_longitude || '',
    amenities: data.amenities || [],
    base_price: data.base_price,
    discounted_base_price: data.discounted_base_price,
    about: data.about || '',
    google_map_link: data.google_map_link || '',
  });

  const [amenityInput, setAmenityInput] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add amenity
  const handleAddAmenity = () => {
    const trimmed = amenityInput.trim();
    if (trimmed && !formData.amenities.some((a) => a.attribute === trimmed)) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, { id: Date.now(), title: trimmed }],
      });
      setAmenityInput('');
    }
  };

  // Remove amenity
  const handleRemoveAmenity = (id) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((a) => a.id !== id),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Remove IDs before sending
      const sanitizedAmenities = formData.amenities.map(({ title }) => ({
        title,
      }));

      const payload = {
        data: {
          ...formData,
          amenities: sanitizedAmenities,
        },
      };

      await UpdateData({
        auth,
        endPoint: 'hotels',
        id: auth?.user?.hotel_id,
        payload,
      });

      SuccessToast('Data Updated Successfully.');
      setLoading(false);
    } catch (err) {
      console.log('Error Updating Profile:', err);
      ErrorToast('Something went wrong.');
      setLoading(false);
    }
  };

  const getHotelDistrictOptions = () =>
    formData.hotel_state ? stateDistricts[formData.hotel_state] || [] : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ width: '100%' }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 4,
          width: '100%',
          bgcolor: 'white',
        }}
      >
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Hotel Name"
                name="hotel_name"
                value={formData.hotel_name}
                onChange={handleChange}
                required
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Mobile No"
                name="hotel_mobile"
                value={formData.hotel_mobile}
                onChange={handleChange}
                required
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Email"
                name="hotel_email"
                value={formData.hotel_email}
                onChange={handleChange}
                required
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Alt Mobile"
                name="hotel_alt_mobile"
                value={formData.hotel_alt_mobile}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="GST No"
                name="hotel_gst_no"
                value={formData.hotel_gst_no}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Website"
                name="hotel_website"
                value={formData.hotel_website}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Latitude"
                name="hotel_latitude"
                value={formData.hotel_latitude}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Longitude"
                name="hotel_longitude"
                value={formData.hotel_longitude}
                onChange={handleChange}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Street Address"
                name="hotel_address_line1"
                value={formData.hotel_address_line1}
                onChange={handleChange}
                size="small"
                required
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="City/District"
                name="hotel_district"
                value={formData.hotel_district}
                onChange={handleChange}
                size="small"
                required
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                fullWidth
                label="State"
                name="hotel_state"
                value={formData.hotel_state}
                onChange={handleChange}
                size="small"
                required
              >
                {indianStatesAndUTs.map((state) => (
                  <MenuItem key={state} value={state}>
                    {state}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Pin Code"
                name="hotel_pincode"
                value={formData.hotel_pincode}
                onChange={handleChange}
                size="small"
                required
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Check-in Time"
                name="hotel_checkin"
                type="time"
                value={formData.hotel_checkin}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Check-out Time"
                name="hotel_checkout"
                type="time"
                value={formData.hotel_checkout}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Base price"
                name="base_price"
                type="number"
                value={formData.base_price}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Discounted Price"
                name="discounted_base_price"
                type="number"
                value={formData.discounted_base_price}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Google Map Link"
                name="google_map_link"
                value={formData.google_map_link}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="About"
                name="about"
                value={formData.about}
                onChange={handleChange}
                multiline
                rows={5}
              />
            </Grid>

            {/* Amenities Section */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Amenities
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <TextField
                  label="Add Amenity"
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAmenity();
                    }
                  }}
                  size="small"
                />
                <IconButton
                  color="primary"
                  onClick={handleAddAmenity}
                  sx={{ mt: '2px' }}
                >
                  <AddCircle />
                </IconButton>
              </Box>

              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.amenities.map((amenity) => (
                  <Chip
                    key={amenity.id}
                    label={amenity.title}
                    onDelete={() => handleRemoveAmenity(amenity.id)}
                    deleteIcon={<Cancel />}
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{ borderRadius: 3, px: 5 }}
                disabled={loading}
              >
                {!loading ? 'Save Changes' : 'Saving...'}
              </Button>
            </motion.div>
          </Box>
        </form>
      </Paper>
    </motion.div>
  );
};

export default UpdateHotelProfileForm;
