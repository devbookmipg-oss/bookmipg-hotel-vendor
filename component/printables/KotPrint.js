'use client';
import { GetCustomDate } from '@/utils/DateFetcher';
import React from 'react';

// forwardRef is required for react-to-print
const KotPrint = React.forwardRef((props, ref) => {
  const { order, profile, size } = props;
  console.log('KOT PRINT ORDER:', order);
  return (
    <div
      ref={ref}
      style={{
        width: size, // "58mm" or "80mm"
        fontFamily: 'monospace',
        fontSize: '12px',
        padding: '5px',
      }}
    >
      <p>
        <strong>Table No:</strong> {order?.table?.table_no}
      </p>
      <p>
        <strong>Date:</strong> {GetCustomDate(order?.date)} |{' '}
        <strong>Time:</strong> {order?.time}
      </p>
      <p>
        <strong>Order ID:</strong> {order?.order_id}
      </p>
      <p style={{ margin: '1px 0' }}>------------------------------</p>

      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <th align="left">Item</th>
            <th align="right">Qty</th>
          </tr>
        </thead>
        <tbody>
          {order?.food_items?.map((item, index) => (
            <tr key={index}>
              <td>{item.item}</td>
              <td align="right">
                <strong>{item.qty}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ margin: '1px 0' }}>------------------------------</p>
      {order?.notes && (
        <>
          <p style={{ fontSize: '10px' }}>Notes:</p>
          <p style={{ fontSize: '10px' }}>{order?.notes || '-'}</p>
        </>
      )}
    </div>
  );
});

KotPrint.displayName = 'KotPrint'; // 👈 required

export { KotPrint };
