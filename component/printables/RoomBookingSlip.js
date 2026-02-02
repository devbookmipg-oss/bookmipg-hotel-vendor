'use client';
import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Grid,
} from '@mui/material';
import { styled } from '@mui/system';
import { GetCustomDate } from '@/utils/DateFetcher';
import { CalculateDays } from '@/utils/CalculateDays';
import { amountToWords } from '@/utils/AmountToWords';

// Modern color scheme
const BRAND_RED = '#c20f12';
const LIGHT_BG = '#fafafa';
const BORDER_COLOR = '#e0e0e0';
const TEXT_PRIMARY = '#1a1a1a';
const TEXT_SECONDARY = '#666';
const TABLE_HEADER_BG = '#f5f5f5';

// Styled Components
const Section = styled(Box)({
  marginBottom: '20px',
});

const SectionHeader = styled(Box)({
  borderBottom: `3px solid ${BRAND_RED}`,
  paddingBottom: '8px',
  marginBottom: '12px',
});

const InfoRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  padding: '6px 0',
  borderBottom: `1px solid ${BORDER_COLOR}`,
  fontSize: '0.875rem',
  color: TEXT_PRIMARY,
  '&:last-child': {
    borderBottom: 'none',
  },
});

const SummaryBox = styled(Box)({
  backgroundColor: LIGHT_BG,
  border: `1px solid ${BORDER_COLOR}`,
  borderRadius: '4px',
  padding: '12px',
  marginBottom: '12px',
});

const BookingSlip = React.forwardRef((props, ref) => {
  const { booking, hotel } = props;

  const roomTokens = booking?.room_tokens || [];
  const totalRoomAmount = roomTokens?.reduce(
    (sum, r) => sum + (r.amount || 0),
    0,
  );

  const totalDays = CalculateDays({
    checkin: booking?.checkin_date,
    checkout: booking?.checkout_date,
  });

  return (
    <Box
      ref={ref}
      sx={{
        backgroundColor: '#fff',
        maxWidth: '900px',
        margin: '0 auto',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        color: TEXT_PRIMARY,
        fontSize: '0.875rem',
        padding: '20px',
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '20px',
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: `3px solid ${BRAND_RED}`,
        }}
      >
        {/* Logo */}
        {/* <Box
          sx={{
            width: '100px',
            height: '100px',
            borderRadius: '4px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: `2px solid ${BRAND_RED}`,
            backgroundColor: '#f5f5f5',
          }}
        >
          <img
            src={
              hotel?.hotel_logo?.url ||
              'https://res.cloudinary.com/deyxdpnom/image/upload/v1760012402/demo_hpzblb.png'
            }
            alt="Hotel Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Box> */}

        {/* Hotel Info */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 'bold', color: TEXT_PRIMARY }}
          >
            {hotel?.hotel_name}
          </Typography>
          <Typography variant="body2" sx={{ color: TEXT_SECONDARY, mt: 0.5 }}>
            {hotel?.hotel_address_line1}, {hotel?.hotel_address_line2}
          </Typography>
          <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>
            {hotel?.hotel_state}, PIN-{hotel?.hotel_pincode}
          </Typography>
          <Typography variant="body2" sx={{ color: TEXT_SECONDARY, mt: 1 }}>
            Email: {hotel?.hotel_email || 'N/A'}
          </Typography>
          <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>
            Phone: +91-{hotel?.hotel_mobile || 'N/A'}
          </Typography>
          <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>
            GSTIN: {hotel?.hotel_gst_no || 'N/A'}
          </Typography>
        </Box>

        {/* Booking ID Card */}
        <Box
          sx={{
            backgroundColor: LIGHT_BG,
            border: `2px solid ${BRAND_RED}`,
            borderRadius: '4px',
            padding: '16px',
            textAlign: 'center',
            minWidth: '180px',
          }}
        >
          <Typography variant="body2" sx={{ color: TEXT_SECONDARY, mb: 1 }}>
            Booking ID
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', color: BRAND_RED }}
          >
            {booking.booking_id}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: TEXT_SECONDARY, display: 'block', mt: 1 }}
          >
            {GetCustomDate(booking.createdAt)}
          </Typography>
        </Box>
      </Box>

      {/* Guest & Booking Info Grid */}
      <Grid container spacing={2} sx={{ marginBottom: '30px' }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Section>
            <SectionHeader>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 'bold', color: TEXT_PRIMARY }}
              >
                Guest Information
              </Typography>
            </SectionHeader>
            <SummaryBox>
              <InfoRow>
                <Typography sx={{ fontWeight: 600 }}>Name:</Typography>
                <Typography>{booking?.customer?.name || 'N/A'}</Typography>
              </InfoRow>
              <InfoRow>
                <Typography sx={{ fontWeight: 600 }}>Company:</Typography>
                <Typography>
                  {booking?.customer?.company_name || 'N/A'}
                </Typography>
              </InfoRow>
              <InfoRow>
                <Typography sx={{ fontWeight: 600 }}>GSTIN:</Typography>
                <Typography>{booking?.customer?.gst_no || 'N/A'}</Typography>
              </InfoRow>
              <InfoRow>
                <Typography sx={{ fontWeight: 600 }}>Address:</Typography>
                <Typography>{booking?.customer?.address || 'N/A'}</Typography>
              </InfoRow>
              <InfoRow>
                <Typography sx={{ fontWeight: 600 }}>Phone:</Typography>
                <Typography>{booking?.customer?.mobile || 'N/A'}</Typography>
              </InfoRow>
            </SummaryBox>
          </Section>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Section>
            <SectionHeader>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 'bold', color: TEXT_PRIMARY }}
              >
                Booking Details
              </Typography>
            </SectionHeader>
            <SummaryBox>
              <InfoRow>
                <Typography sx={{ fontWeight: 600 }}>Check-In:</Typography>
                <Typography>{GetCustomDate(booking?.checkin_date)}</Typography>
              </InfoRow>
              <InfoRow>
                <Typography sx={{ fontWeight: 600 }}>Check-Out:</Typography>
                <Typography>{GetCustomDate(booking?.checkout_date)}</Typography>
              </InfoRow>
              <InfoRow>
                <Typography sx={{ fontWeight: 600 }}>No. of Nights:</Typography>
                <Typography>{totalDays}</Typography>
              </InfoRow>
              <InfoRow>
                <Typography sx={{ fontWeight: 600 }}>No. of Guests:</Typography>
                <Typography>
                  {booking?.adult || '0'} Adults, {booking?.child || '0'}{' '}
                  Children
                </Typography>
              </InfoRow>
              <InfoRow>
                <Typography sx={{ fontWeight: 600 }}>Meal Plan:</Typography>
                <Typography>{booking?.meal_plan || '-'}</Typography>
              </InfoRow>
            </SummaryBox>
          </Section>
        </Grid>
      </Grid>

      {/* Payment Summary */}
      <Section>
        <SectionHeader>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 'bold', color: TEXT_PRIMARY }}
          >
            Payment Summary
          </Typography>
        </SectionHeader>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SummaryBox>
              <InfoRow>
                <Typography sx={{ fontWeight: 600 }}>Total Amount:</Typography>
                <Typography sx={{ color: BRAND_RED, fontWeight: 'bold' }}>
                  ₹{totalRoomAmount}/-
                </Typography>
              </InfoRow>
              <Typography
                variant="caption"
                sx={{ color: TEXT_SECONDARY, display: 'block', mt: 1 }}
              >
                ({amountToWords(totalRoomAmount)})
              </Typography>
            </SummaryBox>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SummaryBox>
              <InfoRow>
                <Typography sx={{ fontWeight: 600 }}>Advance Paid:</Typography>
                <Typography sx={{ color: BRAND_RED, fontWeight: 'bold' }}>
                  ₹{booking.advance_payment?.amount || 0}/-
                </Typography>
              </InfoRow>
              <Typography
                variant="caption"
                sx={{ color: TEXT_SECONDARY, display: 'block', mt: 1 }}
              >
                ({amountToWords(booking.advance_payment?.amount || 0)})
              </Typography>
            </SummaryBox>
          </Grid>
        </Grid>
      </Section>

      {/* Room Charges Table */}
      <Section>
        <SectionHeader>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 'bold', color: TEXT_PRIMARY }}
          >
            Room Charges Breakdown
          </Typography>
        </SectionHeader>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ width: '100%' }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: TABLE_HEADER_BG }}>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    borderBottom: `2px solid ${BRAND_RED}`,
                  }}
                >
                  Details
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    borderBottom: `2px solid ${BRAND_RED}`,
                  }}
                >
                  Days
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    borderBottom: `2px solid ${BRAND_RED}`,
                  }}
                >
                  Tariff
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    borderBottom: `2px solid ${BRAND_RED}`,
                  }}
                >
                  GST
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    borderBottom: `2px solid ${BRAND_RED}`,
                    textAlign: 'right',
                  }}
                >
                  Amount
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roomTokens?.map((room, idx) => (
                <TableRow
                  key={idx}
                  sx={{
                    backgroundColor: idx % 2 === 0 ? LIGHT_BG : '#fff',
                    '&:last-child td': {
                      borderBottom: `2px solid ${BRAND_RED}`,
                    },
                  }}
                >
                  <TableCell sx={{ padding: '8px', color: TEXT_PRIMARY }}>
                    {room?.item}
                  </TableCell>
                  <TableCell sx={{ padding: '8px', color: TEXT_PRIMARY }}>
                    {totalDays}
                  </TableCell>
                  <TableCell sx={{ padding: '8px', color: TEXT_PRIMARY }}>
                    ₹{room?.rate}
                  </TableCell>
                  <TableCell sx={{ padding: '8px', color: TEXT_PRIMARY }}>
                    {room?.gst}%
                  </TableCell>
                  <TableCell
                    sx={{
                      padding: '8px',
                      color: BRAND_RED,
                      fontWeight: 'bold',
                      textAlign: 'right',
                    }}
                  >
                    ₹{room?.amount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Section>

      {/* Special Requests */}
      {booking.remarks && (
        <Section>
          <SectionHeader>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 'bold', color: TEXT_PRIMARY }}
            >
              Special Requests / Notes
            </Typography>
          </SectionHeader>
          <SummaryBox>
            <Typography
              sx={{
                whiteSpace: 'pre-line',
                color: TEXT_PRIMARY,
                fontSize: '0.875rem',
              }}
            >
              {booking.remarks}
            </Typography>
          </SummaryBox>
        </Section>
      )}

      {/* Signature Section */}
      <Box
        sx={{
          marginTop: '40px',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '20px',
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              height: '60px',
              border: `1px solid ${BORDER_COLOR}`,
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingBottom: '4px',
            }}
          >
            <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>
              Signature
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: TEXT_SECONDARY,
              display: 'block',
              textAlign: 'center',
              mt: 1,
            }}
          >
            Guest
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              height: '60px',
              border: `1px solid ${BORDER_COLOR}`,
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingBottom: '4px',
            }}
          >
            <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>
              Signature
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: TEXT_SECONDARY,
              display: 'block',
              textAlign: 'center',
              mt: 1,
            }}
          >
            Cashier / Front Office
          </Typography>
        </Box>
      </Box>

      {/* Terms & Conditions */}
      <Box
        sx={{
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: `1px solid ${BORDER_COLOR}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: TEXT_SECONDARY, fontStyle: 'italic', display: 'block' }}
        >
          <b>Terms & Conditions:</b> {hotel?.hotel_terms || 'N/A'}
        </Typography>
      </Box>
    </Box>
  );
});

BookingSlip.displayName = 'BookingSlip';

export { BookingSlip };
