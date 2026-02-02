'use client';

import React, { useRef, useState } from 'react';
import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import { FileText, Printer } from 'lucide-react';
import { GetCustomDate } from '@/utils/DateFetcher';
import { useReactToPrint } from 'react-to-print';
import { RoomInvoicePrint } from '../printables/RoomInvoicePrint';

const InvoiceListCard = ({ roomInvoices, booking, hotel }) => {
  const filteredInvoices = roomInvoices?.filter((inv) => {
    return inv?.room_booking?.documentId === booking?.documentId;
  });
  const [setectedInv, setSelectedInv] = useState(null);

  const componentRef = useRef(null);
  const handleReactToPrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'room-invoive',
  });

  const handlePrint = (row) => {
    setSelectedInv(row);
    // wait for re-render to complete
    setTimeout(() => handleReactToPrint(), 100);
  };

  const Section = ({ icon: Icon, title, children }) => (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <Box sx={{ color: '#c20f12' }}>
          <Icon size={20} />
        </Box>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: '#1a1a1a',
          }}
        >
          {title}
        </Typography>
      </Stack>
      <Box>{children}</Box>
    </Box>
  );

  return (
    <>
      <Paper
        elevation={1}
        sx={{
          borderRadius: 1.5,
          border: '1px solid #e0e0e0',
          overflow: 'hidden',
          mb: 3,
          backgroundColor: '#fafafa',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            backgroundColor: '#f5f5f5',
            borderBottom: '1px solid #e0e0e0',
            p: 2.5,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              fontSize: '0.938rem',
              color: '#1a1a1a',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Room Invoices
          </Typography>
        </Box>

        {/* Body */}
        <Box sx={{ p: 3 }}>
          <Section icon={FileText} title="Generated Invoices">
            {filteredInvoices && filteredInvoices.length > 0 ? (
              <Stack spacing={2}>
                {filteredInvoices.map((invoice, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      backgroundColor: '#f5f5f5',
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      p: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: '#fff',
                        borderColor: '#c20f12',
                      },
                    }}
                  >
                    <Box flex={1}>
                      <Stack spacing={1}>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <Box sx={{ color: '#c20f12' }}>
                            <FileText size={18} />
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: '#1a1a1a',
                              fontSize: '0.938rem',
                            }}
                          >
                            {invoice.invoice_no}
                          </Typography>
                        </Stack>

                        <Stack
                          direction="row"
                          spacing={3}
                          sx={{ px: 1, mt: 1 }}
                        >
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                color: '#666',
                                fontWeight: 600,
                                mb: 0.25,
                                fontSize: '0.75rem',
                              }}
                            >
                              Amount
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#1a1a1a',
                                fontWeight: 700,
                                fontSize: '0.813rem',
                              }}
                            >
                              ₹ {parseFloat(invoice?.payable_amount).toFixed(2)}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                color: '#666',
                                fontWeight: 600,
                                mb: 0.25,
                                fontSize: '0.75rem',
                              }}
                            >
                              Date
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#1a1a1a',
                                fontWeight: 600,
                                fontSize: '0.813rem',
                              }}
                            >
                              {GetCustomDate(invoice.date)}
                            </Typography>
                          </Box>
                        </Stack>
                      </Stack>
                    </Box>

                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: '#c20f12',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.813rem',
                        textTransform: 'none',
                        padding: '8px 12px',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        '&:hover': {
                          backgroundColor: '#a80d0e',
                        },
                      }}
                      size="small"
                      onClick={() => handlePrint(invoice)}
                    >
                      <Printer size={14} />
                      Print
                    </Button>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography
                variant="body2"
                sx={{
                  color: '#999',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  py: 2,
                }}
              >
                No invoices generated yet
              </Typography>
            )}
          </Section>
        </Box>
      </Paper>

      <div style={{ display: 'none' }}>
        <RoomInvoicePrint
          ref={componentRef}
          data={setectedInv}
          hotel={hotel}
          booking={booking}
        />
      </div>
    </>
  );
};

export default InvoiceListCard;
