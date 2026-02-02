import { GetCustomDate } from '@/utils/DateFetcher';
import {
  Box,
  styled,
  Typography,
  Table,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
  Grid,
} from '@mui/material';
import React from 'react';
import { ToWords } from 'to-words';

// Modern color scheme
const BRAND_RED = '#c20f12';
const LIGHT_BG = '#fafafa';
const BORDER_COLOR = '#e0e0e0';
const TEXT_PRIMARY = '#1a1a1a';
const TEXT_SECONDARY = '#666';
const TABLE_HEADER_BG = '#f5f5f5';

const toInt = (n) => Math.round(Number(n) || 0);

// Styled Components
const Section = styled(Box)({
  marginBottom: '24px',
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
});

const RoomInvoicePrint = React.forwardRef((props, ref) => {
  const toWords = new ToWords();
  const { data, hotel, booking } = props;
  const roomTokens = [];
  const serviceTokens = [];
  const foodTokens = [];

  data?.service_tokens?.forEach((service) => {
    service.items?.forEach((it) => {
      const gstAmount = it.amount - toInt(it.rate);
      const sgst = gstAmount / 2;
      const cgst = gstAmount / 2;
      serviceTokens.push({
        item: it.item,
        hsn: it.hsn || '-',
        rate: toInt(it.rate),
        gst: toInt(gstAmount),
        sgst: toInt(sgst),
        cgst,
        room: service.room_no,
        amount: toInt(it.amount),
      });
    });
  });

  data?.room_tokens?.forEach((room) => {
    const finalRate = toInt(room?.rate) * toInt(room.days);
    const gstAmount = (finalRate * room.gst) / 100;
    const sgst = gstAmount / 2;
    const cgst = gstAmount / 2;
    roomTokens.push({
      item: room.item,
      room: room.room,
      hsn: room.hsn,
      rate: toInt(room.rate * room.days),
      gst: toInt(gstAmount),
      sgst: toInt(sgst),
      cgst: toInt(cgst),
      amount: room.amount,
    });
  });

  data?.food_tokens?.forEach((food) => {
    const gst = toInt(food.total_gst);
    const payable = toInt(food.total_amount);
    const sgst = gst / 2;
    const cgst = gst / 2;
    foodTokens.push({
      item: 'Food Charges',
      room: food.room_no,
      hsn: '996331',
      rate: toInt(payable - gst),
      gst: toInt(gst),
      sgst: toInt(sgst),
      cgst: toInt(cgst),
      amount: payable,
    });
  });

  const allTokens = [...roomTokens, ...serviceTokens, ...foodTokens];

  const totalRate = allTokens.reduce(
    (acc, token) => acc + (token?.rate || 0),
    0,
  );
  const totalCGST = allTokens.reduce(
    (acc, token) => acc + (token?.cgst || 0),
    0,
  );
  const totalSGST = allTokens.reduce(
    (acc, token) => acc + (toInt(token?.sgst) || 0),
    0,
  );
  const totalGST = totalCGST + totalSGST;
  const totalAmount = totalRate + totalGST;

  let totalInWords = toWords?.convert(totalAmount || 0);

  return (
    <Box
      ref={ref}
      sx={{
        backgroundColor: '#fff',
        maxWidth: '1000px',
        margin: '0 auto',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        color: TEXT_PRIMARY,
        fontSize: '0.875rem',
        padding: '30px 20px',
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
            width: '90px',
            height: '90px',
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
            Phone: {hotel?.hotel_mobile}{' '}
            {hotel?.hotel_alt_mobile && `, ${hotel?.hotel_alt_mobile}`}
          </Typography>
          <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>
            Email: {hotel?.hotel_email || 'N/A'} | GSTIN:{' '}
            {hotel?.hotel_gst_no || 'N/A'}
          </Typography>
        </Box>

        {/* Invoice Info Card */}
        <Box
          sx={{
            backgroundColor: LIGHT_BG,
            border: `2px solid ${BRAND_RED}`,
            borderRadius: '4px',
            padding: '16px',
            textAlign: 'center',
            minWidth: '150px',
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: TEXT_SECONDARY, display: 'block' }}
          >
            TAX INVOICE
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', color: BRAND_RED, my: 1 }}
          >
            {data?.invoice_no}
          </Typography>
          <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>
            {GetCustomDate(booking?.checkout_date)}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: TEXT_SECONDARY, display: 'block', mt: 1 }}
          >
            Booking ID: {booking?.booking_id}
          </Typography>
        </Box>
      </Box>

      {/* Guest & Booking Info Grid */}
      <Grid container spacing={2} sx={{ marginBottom: '30px' }}>
        <Grid size={6}>
          <Section>
            <SectionHeader>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 'bold', color: TEXT_PRIMARY }}
              >
                Bill To
              </Typography>
            </SectionHeader>
            <SummaryBox>
              <InfoRow>
                <Typography sx={{ fontWeight: 600 }}>Guest Name:</Typography>
                <Typography>{booking?.customer?.name || 'N/A'}</Typography>
              </InfoRow>
              <InfoRow>
                <Typography sx={{ fontWeight: 600 }}>Phone:</Typography>
                <Typography>{booking?.customer?.mobile || 'N/A'}</Typography>
              </InfoRow>
              <InfoRow>
                <Typography sx={{ fontWeight: 600 }}>Company:</Typography>
                <Typography>
                  {booking?.customer?.company_name || 'N/A'}
                </Typography>
              </InfoRow>
              <InfoRow>
                <Typography sx={{ fontWeight: 600 }}>Address:</Typography>
                <Typography>{booking?.customer?.address || 'N/A'}</Typography>
              </InfoRow>
              <InfoRow>
                <Typography sx={{ fontWeight: 600 }}>GSTIN:</Typography>
                <Typography>{booking?.customer?.gst_no || 'N/A'}</Typography>
              </InfoRow>
            </SummaryBox>
          </Section>
        </Grid>

        <Grid size={6}>
          <Section>
            <SectionHeader>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 'bold', color: TEXT_PRIMARY }}
              >
                Booking Information
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
                <Typography sx={{ fontWeight: 600 }}>Room Numbers:</Typography>
                <Typography>
                  {booking?.rooms?.map((item, index) => (
                    <span key={index}>
                      {item?.room_no}
                      {index < booking?.rooms.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </Typography>
              </InfoRow>
            </SummaryBox>
          </Section>
        </Grid>
      </Grid>

      {/* Items Table */}
      <Section>
        <SectionHeader>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 'bold', color: TEXT_PRIMARY }}
          >
            Invoice Details
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
                    padding: '8px',
                  }}
                >
                  Description
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    borderBottom: `2px solid ${BRAND_RED}`,
                    padding: '8px',
                  }}
                  align="center"
                >
                  HSN/SAC
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    borderBottom: `2px solid ${BRAND_RED}`,
                    padding: '8px',
                  }}
                  align="right"
                >
                  Rate
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    borderBottom: `2px solid ${BRAND_RED}`,
                    padding: '8px',
                  }}
                  align="right"
                >
                  SGST
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    borderBottom: `2px solid ${BRAND_RED}`,
                    padding: '8px',
                  }}
                  align="right"
                >
                  CGST
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    borderBottom: `2px solid ${BRAND_RED}`,
                    padding: '8px',
                  }}
                  align="right"
                >
                  Total GST
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    borderBottom: `2px solid ${BRAND_RED}`,
                    padding: '8px',
                  }}
                  align="right"
                >
                  Total
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allTokens?.map((token, index) => (
                <TableRow
                  key={index}
                  sx={{
                    backgroundColor: index % 2 === 0 ? LIGHT_BG : '#fff',
                  }}
                >
                  <TableCell sx={{ padding: '8px', color: TEXT_PRIMARY }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {token?.item}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: TEXT_SECONDARY }}
                    >
                      Room: {token.room}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{ padding: '8px', color: TEXT_PRIMARY }}
                    align="center"
                  >
                    {token?.hsn}
                  </TableCell>
                  <TableCell
                    sx={{ padding: '8px', color: TEXT_PRIMARY }}
                    align="right"
                  >
                    ₹{toInt(token?.rate)}
                  </TableCell>
                  <TableCell
                    sx={{ padding: '8px', color: TEXT_PRIMARY }}
                    align="right"
                  >
                    ₹{toInt(token?.sgst)}
                  </TableCell>
                  <TableCell
                    sx={{ padding: '8px', color: TEXT_PRIMARY }}
                    align="right"
                  >
                    ₹{toInt(token?.cgst)}
                  </TableCell>
                  <TableCell
                    sx={{ padding: '8px', color: TEXT_PRIMARY }}
                    align="right"
                  >
                    ₹{toInt(token?.gst)}
                  </TableCell>
                  <TableCell
                    sx={{
                      padding: '8px',
                      color: BRAND_RED,
                      fontWeight: 'bold',
                    }}
                    align="right"
                  >
                    ₹{toInt(token?.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableBody>
              <TableRow
                sx={{ backgroundColor: TABLE_HEADER_BG, fontWeight: 'bold' }}
              >
                <TableCell
                  sx={{
                    borderTop: `2px solid ${BRAND_RED}`,
                    borderBottom: `2px solid ${BRAND_RED}`,
                    padding: '10px',
                    fontWeight: 'bold',
                  }}
                  colSpan={2}
                >
                  Grand Total
                </TableCell>
                <TableCell
                  sx={{
                    borderTop: `2px solid ${BRAND_RED}`,
                    borderBottom: `2px solid ${BRAND_RED}`,
                    padding: '10px',
                    fontWeight: 'bold',
                  }}
                  align="right"
                >
                  ₹{toInt(totalRate)}
                </TableCell>
                <TableCell
                  sx={{
                    borderTop: `2px solid ${BRAND_RED}`,
                    borderBottom: `2px solid ${BRAND_RED}`,
                    padding: '10px',
                    fontWeight: 'bold',
                  }}
                  align="right"
                >
                  ₹{toInt(totalSGST)}
                </TableCell>
                <TableCell
                  sx={{
                    borderTop: `2px solid ${BRAND_RED}`,
                    borderBottom: `2px solid ${BRAND_RED}`,
                    padding: '10px',
                    fontWeight: 'bold',
                  }}
                  align="right"
                >
                  ₹{toInt(totalCGST)}
                </TableCell>
                <TableCell
                  sx={{
                    borderTop: `2px solid ${BRAND_RED}`,
                    borderBottom: `2px solid ${BRAND_RED}`,
                    padding: '10px',
                    fontWeight: 'bold',
                  }}
                  align="right"
                >
                  ₹{toInt(totalGST)}
                </TableCell>
                <TableCell
                  sx={{
                    borderTop: `2px solid ${BRAND_RED}`,
                    borderBottom: `2px solid ${BRAND_RED}`,
                    padding: '10px',
                    fontWeight: 'bold',
                    color: BRAND_RED,
                  }}
                  align="right"
                >
                  ₹{toInt(totalAmount)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </Section>

      {/* Amount in Words */}
      <Section>
        <SummaryBox
          sx={{
            backgroundColor: '#f0f7ff',
            borderLeft: `4px solid ${BRAND_RED}`,
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: TEXT_PRIMARY }}
          >
            Amount Chargeable (in words):
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: BRAND_RED, fontWeight: 'bold', mt: 1 }}
          >
            {totalInWords} Rupees
          </Typography>
        </SummaryBox>
      </Section>

      {/* Disclaimer & Signature */}
      <Grid container spacing={2} sx={{ marginTop: '30px' }}>
        <Grid size={6}>
          <Section>
            <Typography
              variant="body2"
              sx={{ color: TEXT_SECONDARY, mb: 3, fontWeight: 600 }}
            >
              Guest Signatory
            </Typography>
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
          </Section>
        </Grid>

        <Grid size={6}>
          <Section>
            <Typography
              variant="body2"
              sx={{ color: TEXT_SECONDARY, mb: 3, fontWeight: 600 }}
            >
              Authorised Signatory
            </Typography>
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
          </Section>
        </Grid>
      </Grid>

      {/* Footer */}
      <Box
        sx={{
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: `1px solid ${BORDER_COLOR}`,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            textAlign: 'center',
            color: TEXT_SECONDARY,
            fontStyle: 'italic',
            mb: 2,
          }}
        >
          We are Happy to Serve You. Visit us again...
        </Typography>
        <Typography
          align="center"
          variant="caption"
          sx={{ color: TEXT_SECONDARY, display: 'block' }}
        >
          {hotel?.hotel_footer}
        </Typography>
      </Box>
    </Box>
  );
});

RoomInvoicePrint.displayName = 'RoomInvoicePrint';

export { RoomInvoicePrint };
