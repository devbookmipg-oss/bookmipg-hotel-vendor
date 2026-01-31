import { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Paper,
  Divider,
  MenuItem,
} from '@mui/material';
import { motion } from 'framer-motion';
import { indianStatesAndUTs, stateDistricts } from '@/data/StatesDistricts';
import { ErrorToast, SuccessToast } from '@/utils/GenerateToast';
import { UpdateData } from '@/utils/ApiFunctions';

const UpdateRestaurantProfileForm = ({ data, auth }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Restaurant defaults
    res_name: data.res_name || '',
    res_mobile: data.res_mobile || '',
    res_email: data.res_email || '',
    res_alt_mobile: data.res_alt_mobile || '',
    res_gst_no: data.res_gst_no || '',
    res_website: data.res_website || '',
    res_address_line1: data.res_address_line1 || '',
    res_address_line2: data.res_address_line2 || '',
    res_district: data.res_district || '',
    res_state: data.res_state || 'West Bengal',
    res_pincode: data.res_pincode || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        data: formData,
      };
      await UpdateData({
        auth,
        endPoint: 'hotels',
        id: auth?.user?.hotel_id,
        payload,
      });
      SuccessToast('Data Updated Successfully.');
      setLoading(false);
      return;
    } catch (err) {
      console.log('Error Updating Profile:', err);
      ErrorToast('Something went wrong.');
      setLoading(false);
      return;
    }
  };

  const getHotelDistrictOptions = () => {
    return formData.hotel_state
      ? stateDistricts[formData.hotel_state] || []
      : [];
  };
  const getResDistrictOptions = () => {
    return formData.res_state ? stateDistricts[formData.res_state] || [] : [];
  };
  return (
    <>
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
            <Grid container spacing={4}>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Name"
                  name="res_name"
                  value={formData.res_name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Mobile No"
                  name="res_mobile"
                  value={formData.res_mobile}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  name="res_email"
                  value={formData.res_email}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Alt Mobile"
                  name="res_alt_mobile"
                  value={formData.res_alt_mobile}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="GST No"
                  name="res_gst_no"
                  value={formData.res_gst_no}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Website"
                  name="res_website"
                  value={formData.res_website}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Address Line 1"
                  name="res_address_line1"
                  value={formData.res_address_line1}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Address Line 2"
                  name="res_address_line2"
                  value={formData.res_address_line2}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="District"
                  name="res_district"
                  value={formData.res_district}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="">Select District</MenuItem>
                  {getResDistrictOptions().map((district) => (
                    <MenuItem key={district} value={district}>
                      {district}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="State"
                  name="res_state"
                  value={formData.res_state}
                  onChange={handleChange}
                  required
                >
                  {indianStatesAndUTs.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Pin Code"
                  name="res_pincode"
                  value={formData.res_pincode}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
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
    </>
  );
};

export default UpdateRestaurantProfileForm;
