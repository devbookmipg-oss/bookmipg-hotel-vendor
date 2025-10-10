'use client';

import { useAuth } from '@/context';
import {
  DeleteData,
  GetDataList,
  CreateNewData,
  UpdateData,
} from '@/utils/ApiFunctions';
import { useState, useMemo } from 'react';

// mui
import {
  Box,
  Button,
  Breadcrumbs,
  Link,
  Typography,
  TextField,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControlLabel,
  Switch,
  Grid,
  styled,
} from '@mui/material';
import { AddCircle, Cancel } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { ErrorToast, SuccessToast, WarningToast } from '@/utils/GenerateToast';
import { Loader } from '@/component/common';
import Image from 'next/image';
import { UploadImage } from '@/utils/UploadImage';
import CreateIcon from '@mui/icons-material/Create';

const ImageContainer = styled(Box)`
  width: 200px;
  height: 200px;
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
`;

const EditIconWrapper = styled(Box)`
  border: 2px solid #fff;
  width: 30px;
  height: 30px;
  background: #29abe2;
  border-radius: 50%;
  position: absolute;
  bottom: 13px;
  right: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  & > label {
    cursor: pointer;
    & > svg {
      color: #fff;
      font-size: 19px;
    }
  }
`;

const Page = () => {
  const { auth } = useAuth();
  const data = GetDataList({
    auth,
    endPoint: 'room-categories',
  });

  const [search, setSearch] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // Create/Edit dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData());
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amenityInput, setAmenityInput] = useState('');

  function initialFormData() {
    return {
      name: '',
      description: '',
      bed_type: '',
      hsn: '',
      tariff: 0,
      gst: 0,
      total: 0,
      max_adults: 1,
      max_child: 0,
      amenities: [],
      hotel_id: auth?.user?.hotel_id || '',
    };
  }

  // filter data by name
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) =>
      item.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  //   handle image change
  const [upload, setUpload] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [profileImage, setProfileImage] = useState();

  const imageHandler = (e) => {
    const selected = e.target.files[0];
    const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
    const MAX_FILE_SIZE_MB = 2; // Maximum file size in MB
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    if (selected) {
      // Check for file type
      if (!ALLOWED_TYPES.includes(selected.type)) {
        console.log('not allowed');
        ErrorToast('Only PNG, JPEG, or JPG formats are allowed.');
        setUpload(false);
        return;
      }

      // Check for file size
      if (selected.size > MAX_FILE_SIZE_BYTES) {
        ErrorToast(`Image size should not exceed ${MAX_FILE_SIZE_MB} MB.`);
        setUpload(false);
        return;
      }

      // Create a preview of the selected image
      let reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setProfileImage(selected);
        setUpload(true);
      };
      reader.readAsDataURL(selected);
    } else {
      ErrorToast('No file selected.');
    }
  };

  // handle edit
  const handleEdit = (row) => {
    setEditing(true);
    setFormData(row);
    setPreviewImage(row?.room_image.url || null);
    setFormOpen(true);
  };

  // handle create
  const handleCreate = () => {
    setEditing(false);
    setFormData(initialFormData());
    setFormOpen(true);
  };

  // handle close
  const handleClose = () => {
    setFormOpen(false);
    setPreviewImage(null);
    setFormData(initialFormData());
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

  const handleSave = async () => {
    setLoading(true);
    try {
      const {
        id,
        documentId,
        publishedAt,
        updatedAt,
        createdAt,
        room_image,
        ...cleanFormData
      } = formData;

      let payload = { data: { ...cleanFormData } };
      const sanitizedAmenities = formData.amenities.map(({ title }) => ({
        title,
      }));
      payload.data.amenities = sanitizedAmenities;

      // Handle image upload (for both create & update)
      if (upload || !editing) {
        if (!profileImage && !editing) {
          WarningToast('Room Image is Required');
          return;
        }

        const uploadedImage = await UploadImage({
          image: profileImage,
          token: auth.token,
        });

        const { documentId: _docId, ...imageWithoutDocId } = uploadedImage;
        payload.data.room_image = imageWithoutDocId;
      }

      if (editing) {
        await UpdateData({
          auth,
          endPoint: 'room-categories',
          id: formData.documentId,
          payload,
        });
        SuccessToast('Category updated successfully');
      } else {
        await CreateNewData({
          auth,
          endPoint: 'room-categories',
          payload,
        });
        SuccessToast('Category created successfully');
      }

      setFormOpen(false);
    } catch (err) {
      console.error('Error updating category:', err);
      ErrorToast('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // handle delete
  const handleDeleteClick = (row) => {
    setSelectedRow(row);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    await DeleteData({
      auth,
      endPoint: 'room-categories',
      id: selectedRow.documentId,
    });
    SuccessToast('Category deleted successfully');
    setDeleteOpen(false);
    setSelectedRow(null);
  };

  const handleCancelDelete = () => {
    setDeleteOpen(false);
    setSelectedRow(null);
  };
  if (!data) {
    <Loader />;
  }
  return (
    <>
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link underline="hover" color="inherit" href="/">
            Dashboard
          </Link>
          <Typography color="text.primary">Room Categories</Typography>
        </Breadcrumbs>
      </Box>
      {!data ? (
        <Loader />
      ) : (
        <Box p={3}>
          {/* Header Section */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <TextField
              size="small"
              label="Search by Name"
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ borderRadius: 2, textTransform: 'none' }}
              onClick={handleCreate}
            >
              Create New Category
            </Button>
          </Box>

          {/* Data Table */}
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  {[
                    'Image',
                    'Name',
                    'Bead Type',
                    'HSN/SAC',
                    'Tariff',
                    'GST',
                    'Total',

                    'Actions',
                  ].map((item, index) => (
                    <TableCell key={index} sx={{ fontWeight: 'bold' }}>
                      {item}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData?.map((row) => (
                  <TableRow key={row.documentId}>
                    <TableCell>
                      <Image
                        src={row?.room_image?.url || '/demo-image.png'}
                        width={50}
                        height={50}
                        alt="Room Image"
                      />
                    </TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.bed_type}</TableCell>
                    <TableCell>{row.hsn}</TableCell>
                    <TableCell>{row.tariff}</TableCell>
                    <TableCell>{row.gst}</TableCell>
                    <TableCell>{row.total}</TableCell>

                    <TableCell sx={{ width: '100px' }}>
                      <Tooltip title="Edit">
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(row)}
                          size="small"
                        >
                          <EditIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(row)}
                          size="small"
                        >
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredData?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No categories found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteOpen}
            onClose={handleCancelDelete}
            aria-labelledby="delete-dialog-title"
          >
            <DialogTitle id="delete-dialog-title">Delete Category</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete
                <strong>{selectedRow?.name}</strong>? This action cannot be
                undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelDelete}>Cancel</Button>
              <Button
                onClick={handleConfirmDelete}
                color="error"
                variant="contained"
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          {/* Create/Edit Dialog */}
          <Dialog open={formOpen} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
              {editing ? 'Edit Category' : 'Create Category'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={12}>
                  <ImageContainer>
                    <ImageBorder>
                      <Image
                        src={previewImage || '/demo-image.png'}
                        height="200"
                        width="200"
                        alt="doctor image"
                      />
                    </ImageBorder>
                    <EditIconWrapper>
                      <label htmlFor="profile-pic">
                        <CreateIcon />
                      </label>
                      <input
                        id="profile-pic"
                        type="file"
                        hidden
                        onChange={imageHandler}
                      />
                    </EditIconWrapper>
                  </ImageContainer>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="dense"
                    label="Name"
                    fullWidth
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="dense"
                    label="Bed Type"
                    fullWidth
                    value={formData.bed_type}
                    onChange={(e) =>
                      setFormData({ ...formData, bed_type: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    margin="dense"
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="dense"
                    label="Max Adults"
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.max_adults}
                    onChange={(e) =>
                      setFormData({ ...formData, max_adults: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="dense"
                    label="Max Child"
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.max_child}
                    onChange={(e) =>
                      setFormData({ ...formData, max_child: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    margin="dense"
                    label="HSN/SAC"
                    fullWidth
                    value={formData.hsn}
                    onChange={(e) =>
                      setFormData({ ...formData, hsn: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    margin="dense"
                    label="Tariff"
                    type="number"
                    fullWidth
                    value={formData.tariff}
                    onChange={(e) => {
                      const tariff = parseFloat(e.target.value) || 0;
                      const gst = parseFloat(formData.gst) || 0;
                      setFormData({
                        ...formData,
                        tariff,
                        total: tariff + (tariff * gst) / 100,
                      });
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    margin="dense"
                    label="GST (%)"
                    type="number"
                    fullWidth
                    value={formData.gst}
                    onChange={(e) => {
                      const gst = parseFloat(e.target.value) || 0;
                      const tariff = parseFloat(formData.tariff) || 0;
                      setFormData({
                        ...formData,
                        gst,
                        total: tariff + (tariff * gst) / 100,
                      });
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    margin="dense"
                    label="Total"
                    type="number"
                    fullWidth
                    value={formData.total}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
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

                  <Box
                    sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}
                  >
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
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button
                onClick={handleSave}
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Saving...' : <>{editing ? 'Update' : 'Create'}</>}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </>
  );
};

export default Page;
