import { Box, Button, Paper, Typography, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { UploadImage } from '@/utils/UploadImage';
import CreateIcon from '@mui/icons-material/Create';
import { useState } from 'react';
import styled from '@emotion/styled';
import { UpdateData } from '@/utils/ApiFunctions';
import { ErrorToast, SuccessToast } from '@/utils/GenerateToast';

const ImageContainer = styled(Box)`
  width: 260px;
  height: 180px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ImageBorder = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
`;

const EditIconWrapper = styled(Box)`
  border: 2px solid #fff;
  width: 40px;
  height: 40px;
  background: #29abe2;
  border-radius: 50%;
  position: absolute;
  bottom: 0px;
  right: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  & > label {
    cursor: pointer;
    & > svg {
      color: #fff;
      font-size: 21px;
    }
  }
`;

const UpdateHotelImages = ({ data, auth }) => {
  const [loading, setLoading] = useState(false);

  const imageKeys = [
    'hotel_image1',
    'hotel_image2',
    'hotel_image3',
    'hotel_image4',
    'hotel_image5',
  ];

  // Initial previews from existing data
  const initialPreviews = {};
  imageKeys.forEach((key) => {
    initialPreviews[key] = data?.[key]?.url || null;
  });

  const [previewImages, setPreviewImages] = useState(initialPreviews);
  const [selectedFiles, setSelectedFiles] = useState({});

  const imageHandler = (e, key) => {
    const selected = e.target.files[0];
    const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
    const MAX_FILE_SIZE_MB = 2;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    if (!selected) return ErrorToast('No file selected.');

    if (!ALLOWED_TYPES.includes(selected.type)) {
      return ErrorToast('Only PNG, JPEG, or JPG formats are allowed.');
    }

    if (selected.size > MAX_FILE_SIZE_BYTES) {
      return ErrorToast(`Image size should not exceed ${MAX_FILE_SIZE_MB} MB.`);
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImages((prev) => ({ ...prev, [key]: reader.result }));
      setSelectedFiles((prev) => ({ ...prev, [key]: selected }));
    };
    reader.readAsDataURL(selected);
  };

  const handleSaveAll = async () => {
    try {
      if (Object.keys(selectedFiles).length === 0) {
        return ErrorToast('Please select at least one image to update.');
      }

      setLoading(true);
      const uploadedImages = {};

      // Upload all selected images in parallel
      await Promise.all(
        Object.entries(selectedFiles).map(async ([key, file]) => {
          const uploadedImage = await UploadImage({
            image: file,
            token: auth.token,
          });
          const { documentId: _docId, ...imageWithoutDocId } = uploadedImage;
          uploadedImages[key] = imageWithoutDocId;
        })
      );

      await UpdateData({
        auth,
        endPoint: 'hotels',
        id: auth?.user?.hotel_id,
        payload: {
          data: uploadedImages,
        },
      });

      SuccessToast('All selected images updated successfully.');
      setLoading(false);
    } catch (err) {
      console.error('Error updating images:', err);
      setLoading(false);
      ErrorToast('Something went wrong.');
    }
  };

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
          p: 3,
          borderRadius: 4,
          width: '100%',
          bgcolor: 'white',
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
          Update Hotel Images
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          {imageKeys.map((key) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 4 }}
              key={key}
              sx={{ display: 'flex', justifyContent: 'center' }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 1, textTransform: 'capitalize' }}
                >
                  {key.replace('_', ' ')}
                </Typography>
                <ImageContainer>
                  <ImageBorder>
                    <Image
                      src={previewImages[key] || '/demo-image.png'}
                      height="180"
                      width="260"
                      alt={key}
                      style={{ objectFit: 'cover' }}
                    />
                  </ImageBorder>
                  <EditIconWrapper>
                    <label htmlFor={`file-${key}`}>
                      <CreateIcon />
                    </label>
                    <input
                      id={`file-${key}`}
                      type="file"
                      hidden
                      onChange={(e) => imageHandler(e, key)}
                    />
                  </EditIconWrapper>
                </ImageContainer>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            sx={{ borderRadius: 3, px: 5 }}
            onClick={handleSaveAll}
            disabled={loading || Object.keys(selectedFiles).length === 0}
          >
            {loading ? 'Updating...' : 'Save Changes'}
          </Button>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default UpdateHotelImages;
