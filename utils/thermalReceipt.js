export function generateThermalReceipt(invoice, profile) {
  if (!invoice) return '';

  let receipt = '';

  if (profile?.res_logo?.url) {
    receipt += `[C]<img>${profile.res_logo.url}</img>\n`;
  }

  receipt += `[C]<b>${profile?.res_name || ''}</b>\n`;
  receipt += `[C]${profile?.res_address_line1 || ''}\n`;
  receipt += `[C]${profile?.res_district || ''}, ${profile?.res_state || ''}\n`;

  if (profile?.res_gst_no) {
    receipt += `[C]GST: ${profile.res_gst_no}\n`;
  }

  receipt += `--------------------------------\n`;

  receipt += formatLine('Invoice', invoice.invoice_no) + '\n';
  receipt += formatLine('Date', `${invoice.date} ${invoice.time}`) + '\n';

  if (invoice.customer_name) {
    receipt += formatLine('Customer', invoice.customer_name) + '\n';
  }

  receipt += `--------------------------------\n`;

  receipt += formatLine('Item', 'Amount') + '\n';
  receipt += `--------------------------------\n`;

  invoice.menu_items?.forEach((item) => {
    const amount = item.qty * item.rate;

    receipt += item.item + '\n';
    receipt += formatLine(`${item.qty} x ${item.rate}`, amount) + '\n';
  });

  receipt += `--------------------------------\n`;

  receipt += formatLine('Subtotal', `₹${invoice.total_amount}`) + '\n';
  receipt += formatLine('GST', `₹${invoice.tax}`) + '\n';

  receipt += `--------------------------------\n`;

  receipt += formatLine('TOTAL', `₹${invoice.payable_amount}`) + '\n';

  receipt += `--------------------------------\n`;

  receipt += `[C]Thank you! Visit again.\n`;

  return receipt;
}
