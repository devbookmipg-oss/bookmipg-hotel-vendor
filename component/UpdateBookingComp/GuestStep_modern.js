'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context';
import { GetDataList, CreateNewData } from '@/utils/ApiFunctions';
import { SuccessToast } from '@/utils/GenerateToast';
import {
  Box,
  Button,
  Typography,
  TextField,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  InputAdornment,
} from '@mui/material';
import { Check, Phone, Mail, Building2 } from 'lucide-react';
import { PersonAdd } from '@mui/icons-material';

export default function GuestStep({ selectedGuest, setSelectedGuest }) {
  const { auth } = useAuth();
  const data = GetDataList({ auth, endPoint: 'customers' });

  const [search, setSearch] = useState(
    selectedGuest ? selectedGuest?.mobile : '',
  );
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm());
  const [errors, setErrors] = useState({});

  function initialForm() {
    return {
      name: '',
      mobile: '',
      email: '',
      address: '',
      dob: null,
      doa: null,
      company_name: '',
      gst_no: '',
      id_type: '',
      id_number: '',
      passport_issue_date: null,
      passport_exp_date: null,
      visa_number: '',
      visa_issue_date: null,
      visa_exp_date: null,
      hotel_id: auth?.user?.hotel_id || '',
    };
  }

  const filteredData = useMemo(() => {
    if (!search) return data || [];
    if (!data) return [];

    const lowerSearch = search.toLowerCase();
    let list = data.filter(
      (item) =>
        item.mobile?.toLowerCase().includes(lowerSearch) ||
        item.name?.toLowerCase().includes(lowerSearch),
    );

    if (
      selectedGuest &&
      !list.find((g) => g.documentId === selectedGuest.documentId)
    ) {
      list = [selectedGuest, ...list];
    }

    return list;
  }, [data, search, selectedGuest]);

  const validate = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.mobile) newErrors.mobile = 'Mobile is required';
    else if (!/^[0-9]{10}$/.test(formData.mobile))
      newErrors.mobile = 'Enter valid 10-digit number';

    if (formData.id_type === 'Passport') {
      if (!formData.passport_issue_date)
        newErrors.passport_issue_date = 'Passport Issue Date is required';
      if (!formData.passport_exp_date)
        newErrors.passport_exp_date = 'Passport Expiry Date is required';
      if (!formData.visa_number)
        newErrors.visa_number = 'Visa Number is required';
      if (!formData.visa_issue_date)
        newErrors.visa_issue_date = 'Visa Issue Date is required';
      if (!formData.visa_exp_date)
        newErrors.visa_exp_date = 'Visa Expiry Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const res = await CreateNewData({
      auth,
      endPoint: 'customers',
      payload: { data: formData },
    });

    SuccessToast('Guest created successfully');
    setSelectedGuest(res?.data?.data || res?.data);
    setFormOpen(false);
    setFormData(initialForm());
    setSearch(res?.data?.data?.mobile || res?.data?.mobile || '');
  };

  return (
    <Box>
      {/* Search & Create Section */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          gap: 2,
          alignItems: 'flex-end',
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 250 }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontWeight: 700,
              mb: 1,
              color: '#666',
              textTransform: 'uppercase',
            }}
          >
            Search Existing Guest
          </Typography>
          <TextField
            fullWidth
            placeholder="Mobile or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone size={18} color="#999" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                bgcolor: '#f5f5f5',
                '&:focus-within': {
                  bgcolor: '#fff',
                },
              },
            }}
          />
        </Box>
        <Button
          variant="outlined"
          startIcon={<PersonAdd size={18} />}
          onClick={() => setFormOpen(true)}
          sx={{
            borderRadius: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            borderColor: '#c20f12',
            color: '#c20f12',
            '&:hover': {
              bgcolor: '#fce4ec',
              borderColor: '#c20f12',
            },
          }}
        >
          Create New
        </Button>
      </Box>

      {/* Guest Cards Grid */}
      <Box sx={{ mt: 3 }}>
        {!data ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </Box>
        ) : filteredData.length > 0 ? (
          <Grid container spacing={2}>
            {filteredData.map((guest) => {
              const isSelected = selectedGuest?.documentId === guest.documentId;
              return (
                <Grid size={{ xs: 12, sm: 6 }} key={guest.documentId}>
                  <Card
                    onClick={() => setSelectedGuest(guest)}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 2,
                      border: isSelected
                        ? '2px solid #c20f12'
                        : '1px solid #e0e0e0',
                      background: isSelected
                        ? 'linear-gradient(135deg, #fff5f5, #ffe8e8)'
                        : '#fff',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      '&:hover': {
                        boxShadow: '0 8px 24px rgba(194, 15, 18, 0.15)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <CardContent>
                      {/* Guest Name & Selection Indicator */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          mb: 2,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 700, color: '#1a1a1a', flex: 1 }}
                        >
                          {guest.name}
                        </Typography>
                        {isSelected && (
                          <Check
                            size={20}
                            color="#c20f12"
                            style={{ flexShrink: 0, marginLeft: 8 }}
                          />
                        )}
                      </Box>

                      {/* Contact Info */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Phone size={16} color="#999" />
                        <Typography variant="body2" color="textSecondary">
                          {guest.mobile || '-'}
                        </Typography>
                      </Box>

                      {guest.email && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <Mail size={16} color="#999" />
                          <Typography variant="body2" color="textSecondary">
                            {guest.email}
                          </Typography>
                        </Box>
                      )}

                      {guest.company_name && (
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Building2 size={16} color="#999" />
                          <Typography variant="body2" color="textSecondary">
                            {guest.company_name}
                          </Typography>
                        </Box>
                      )}

                      {/* Additional Details */}
                      {(guest.dob || guest.doa || guest.gst_no) && (
                        <>
                          <Divider sx={{ my: 1.5 }} />
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: 1,
                            }}
                          >
                            {guest.dob && (
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                <strong>DOB:</strong> {guest.dob}
                              </Typography>
                            )}
                            {guest.doa && (
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                <strong>DOA:</strong> {guest.doa}
                              </Typography>
                            )}
                            {guest.gst_no && (
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                <strong>GST:</strong> {guest.gst_no}
                              </Typography>
                            )}
                          </Box>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="textSecondary" sx={{ mb: 2 }}>
              No guests found
            </Typography>
            <Button
              variant="contained"
              startIcon={<PersonAdd size={18} />}
              onClick={() => setFormOpen(true)}
              sx={{
                borderRadius: 1.5,
                bgcolor: '#c20f12',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Create New Guest
            </Button>
          </Box>
        )}
      </Box>

      {/* Create Guest Dialog */}
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ fontWeight: 700, color: '#c20f12', fontSize: '1.25rem' }}
        >
          Add New Guest
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: '#666',
                  textTransform: 'uppercase',
                  display: 'block',
                  mb: 1,
                }}
              >
                Basic Information
              </Typography>
              <TextField
                fullWidth
                label="Full Name"
                size="small"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Mobile Number"
                size="small"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
                error={!!errors.mobile}
                helperText={errors.mobile}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                size="small"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Address"
                size="small"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </Grid>

            <Grid size={12}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: '#666',
                  textTransform: 'uppercase',
                  display: 'block',
                  mb: 1,
                }}
              >
                Important Dates
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                size="small"
                value={formData.dob || ''}
                onChange={(e) =>
                  setFormData({ ...formData, dob: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Anniversary Date"
                type="date"
                size="small"
                value={formData.doa || ''}
                onChange={(e) =>
                  setFormData({ ...formData, doa: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={12}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: '#666',
                  textTransform: 'uppercase',
                  display: 'block',
                  mb: 1,
                }}
              >
                Business Details
              </Typography>
              <TextField
                fullWidth
                label="Company Name"
                size="small"
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="GST Number"
                size="small"
                value={formData.gst_no}
                onChange={(e) =>
                  setFormData({ ...formData, gst_no: e.target.value })
                }
              />
            </Grid>

            <Grid size={12}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: '#666',
                  textTransform: 'uppercase',
                  display: 'block',
                  mb: 1,
                }}
              >
                Identification
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="ID Type"
                size="small"
                value={formData.id_type}
                onChange={(e) =>
                  setFormData({ ...formData, id_type: e.target.value })
                }
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="Aadhaar">Aadhaar</MenuItem>
                <MenuItem value="PAN">PAN</MenuItem>
                <MenuItem value="Passport">Passport</MenuItem>
                <MenuItem value="Driving License">Driving License</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="ID Number"
                size="small"
                value={formData.id_number}
                onChange={(e) =>
                  setFormData({ ...formData, id_number: e.target.value })
                }
              />
            </Grid>

            {formData.id_type === 'Passport' && (
              <>
                <Grid size={12}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: '#666',
                      textTransform: 'uppercase',
                      display: 'block',
                      mb: 1,
                    }}
                  >
                    Passport Details
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Passport Issue Date"
                    type="date"
                    size="small"
                    value={formData.passport_issue_date || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passport_issue_date: e.target.value,
                      })
                    }
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.passport_issue_date}
                    helperText={errors.passport_issue_date}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Passport Expiry Date"
                    type="date"
                    size="small"
                    value={formData.passport_exp_date || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passport_exp_date: e.target.value,
                      })
                    }
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.passport_exp_date}
                    helperText={errors.passport_exp_date}
                  />
                </Grid>

                <Grid size={12}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: '#666',
                      textTransform: 'uppercase',
                      display: 'block',
                      mb: 1,
                    }}
                  >
                    Visa Details
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Visa Number"
                    size="small"
                    value={formData.visa_number}
                    onChange={(e) =>
                      setFormData({ ...formData, visa_number: e.target.value })
                    }
                    error={!!errors.visa_number}
                    helperText={errors.visa_number}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Visa Issue Date"
                    type="date"
                    size="small"
                    value={formData.visa_issue_date || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        visa_issue_date: e.target.value,
                      })
                    }
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.visa_issue_date}
                    helperText={errors.visa_issue_date}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Visa Expiry Date"
                    type="date"
                    size="small"
                    value={formData.visa_exp_date || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        visa_exp_date: e.target.value,
                      })
                    }
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.visa_exp_date}
                    helperText={errors.visa_exp_date}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setFormOpen(false)}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 1.5,
              bgcolor: '#c20f12',
              '&:hover': { bgcolor: '#a00d0f' },
            }}
          >
            Save Guest
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
