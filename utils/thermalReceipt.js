function centerText(text, width = 32) {
  const space = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(space) + text;
}

function formatColumns(item, qtyRate, amount) {
  const itemCol = item.substring(0, 16).padEnd(16);
  const qtyCol = qtyRate.substring(0, 8).padStart(8);
  const amtCol = String(amount).substring(0, 8).padStart(8);

  return itemCol + qtyCol + amtCol;
}

function formatRight(label, value, width = 32) {
  const left = label;
  const right = value;

  const spaces = width - left.length - right.length;
  return left + ' '.repeat(spaces > 0 ? spaces : 1) + right;
}

export function resInvoiceThermalReceipt(invoice, profile) {
  if (!invoice) return '';

  let receipt = '';

  // HEADER
  receipt += centerText(profile?.res_name || '') + '\n';
  receipt += centerText(profile?.res_address_line1 || '') + '\n';
  receipt +=
    centerText(`${profile?.res_district || ''}, ${profile?.res_state || ''}`) +
    '\n';

  if (profile?.res_gst_no) {
    receipt += centerText(`GST: ${profile.res_gst_no}`) + '\n';
  }

  receipt += '--------------------------------\n';

  receipt += formatRight('Invoice', invoice.invoice_no) + '\n';
  receipt += formatRight('Date', `${invoice.date} ${invoice.time}`) + '\n';

  if (invoice.customer_name) {
    receipt += formatRight('Customer', invoice.customer_name) + '\n';
  }
  if (invoice.customer_phone) {
    receipt += formatRight('Customer', invoice.customer_phone) + '\n';
  }
  if (invoice.customer_gst) {
    receipt += formatRight('Customer', invoice.customer_gst) + '\n';
  }

  receipt += '--------------------------------\n';

  receipt += formatColumns('Item', 'QtyRate', 'Amount') + '\n';

  receipt += '--------------------------------\n';

  invoice.menu_items?.forEach((item) => {
    const amount = item.qty * item.rate;
    const qtyRate = `${item.qty}x${item.rate}`;

    receipt += formatColumns(item.item, qtyRate, amount) + '\n';
  });

  receipt += '--------------------------------\n';

  receipt += formatRight('Subtotal', `Rs.${invoice.total_amount}`) + '\n';
  receipt += formatRight('GST', `Rs.${invoice.tax}`) + '\n';

  receipt += '--------------------------------\n';

  receipt += formatRight('TOTAL', `Rs.${invoice.payable_amount}`) + '\n';

  receipt += '--------------------------------\n';

  receipt += centerText('Thank you. Visit again.') + '\n\n\n';

  return receipt;
}

function formatKOTColumns(item, qty) {
  const itemCol = item.substring(0, 16).padEnd(25);
  const qtyCol = qty;

  return itemCol + qtyCol;
}

export function kotThermalReceipt(order) {
  if (!order) return '';

  let receipt = '';
  receipt += formatRight('KOT', `${order.order_id}`) + '\n';
  receipt += formatRight('Table No', order.table?.table_no) + '\n';
  receipt += formatRight('Date', `${order.date} ${order.time}`) + '\n';

  receipt += '--------------------------------\n';

  receipt += formatKOTColumns('Item', 'Qty') + '\n';

  receipt += '--------------------------------\n';

  order.food_items?.forEach((item) => {
    receipt += formatKOTColumns(item.item, item.qty) + '\n';
  });

  receipt += '--------------------------------\n';

  receipt += centerText(order?.notes || '') + '\n\n';

  return receipt;
}
