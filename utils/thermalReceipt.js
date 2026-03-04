export function generateThermalReceipt(invoice, profile) {
  if (!invoice) return '';

  let receipt = `
[C]<b>${profile?.res_name || ''}</b>
[C]${profile?.res_address_line1 || ''} ${profile?.res_address_line2 || ''}
[C]${profile?.res_district || ''}, ${profile?.res_state || ''}
`;

  if (profile?.res_gst_no) {
    receipt += `[C]GST: ${profile.res_gst_no}\n`;
  }

  receipt += `
--------------------------------
[L]Invoice: ${invoice.invoice_no}
[L]Date: ${invoice.date} ${invoice.time}
`;

  if (invoice.customer_name) {
    receipt += `[L]Customer: ${invoice.customer_name}\n`;
  }

  if (invoice.customer_phone) {
    receipt += `[L]Phone: ${invoice.customer_phone}\n`;
  }

  receipt += `
--------------------------------
[L]Item
`;

  invoice.menu_items?.forEach((item) => {
    const amount = item.qty * item.rate;

    receipt += `[L]${item.item}
[L]${item.qty} x ${item.rate}[R]${amount}
`;
  });

  receipt += `
--------------------------------
[L]Subtotal[R]${invoice.total_amount}
[L]GST[R]${invoice.tax}
[L]<b>Total</b>[R]<b>${invoice.payable_amount}</b>
--------------------------------
[C]Thank you! Visit again.
`;

  return receipt;
}
