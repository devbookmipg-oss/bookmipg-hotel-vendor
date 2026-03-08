// =============================
// 58mm Thermal Printer Config
// =============================

const PRINTER_WIDTH = 32;
const LINE = '-'.repeat(PRINTER_WIDTH);

// =============================
// Helper: Trim Text to Width
// =============================

function fitText(text = '', width) {
  text = String(text);
  if (text.length > width) {
    return text.substring(0, width);
  }
  return text;
}

// =============================
// Center Align Text
// =============================

function centerText(text = '') {
  text = fitText(text, PRINTER_WIDTH);

  const space = Math.floor((PRINTER_WIDTH - text.length) / 2);
  return ' '.repeat(space) + text;
}

// =============================
// Left - Right Text
// Example:
// Invoice            1021
// =============================

function formatRight(label = '', value = '') {
  label = String(label);
  value = String(value);

  const maxValueWidth = PRINTER_WIDTH - label.length - 1;
  value = fitText(value, maxValueWidth);

  const spaces = PRINTER_WIDTH - label.length - value.length;

  return label + ' '.repeat(spaces) + value;
}

// =============================
// Word Wrap Function
// Prevents breaking words
// =============================

function wrapWords(text, maxWidth) {
  const words = String(text).split(' ');
  const lines = [];

  let currentLine = '';

  words.forEach((word) => {
    if ((currentLine + word).length <= maxWidth) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) lines.push(currentLine);

  return lines;
}

// =============================
// Invoice Columns
// Item(16) QtyRate(8) Amount(8)
// Total = 32
// =============================

function formatColumns(item, qtyRate, amount) {
  const itemWidth = 16;
  const qtyWidth = 8;
  const amtWidth = 8;

  const lines = wrapWords(item, itemWidth);

  let result = '';

  lines.forEach((line, index) => {
    if (index === 0) {
      const itemCol = fitText(line, itemWidth).padEnd(itemWidth);
      const qtyCol = fitText(qtyRate, qtyWidth).padStart(qtyWidth);
      const amtCol = fitText(amount, amtWidth).padStart(amtWidth);

      result += itemCol + qtyCol + amtCol + '\n';
    } else {
      result += fitText(line, itemWidth).padEnd(itemWidth) + '\n';
    }
  });

  return result.trimEnd();
}

// =============================
// KOT Columns
// Item(24) Qty(8)
// Total = 32
// =============================

function formatKOTColumns(item, qty) {
  const itemWidth = 24;
  const qtyWidth = 8;

  const lines = wrapWords(item, itemWidth);

  let result = '';

  lines.forEach((line, index) => {
    if (index === 0) {
      const itemCol = fitText(line, itemWidth).padEnd(itemWidth);
      const qtyCol = fitText(qty, qtyWidth).padStart(qtyWidth);

      result += itemCol + qtyCol + '\n';
    } else {
      result += fitText(line, itemWidth).padEnd(itemWidth) + '\n';
    }
  });

  return result.trimEnd();
}

// =====================================================
// Invoice Receipt (Customer Bill)
// =====================================================

export function resInvoiceThermalReceipt(invoice, profile) {
  if (!invoice) return '';

  let receipt = '';

  // Restaurant Header

  receipt += centerText(profile?.res_name || '') + '\n';

  if (profile?.res_address_line1)
    receipt += centerText(profile.res_address_line1) + '\n';

  if (profile?.res_address_line2)
    receipt += centerText(profile.res_address_line2) + '\n';

  receipt +=
    centerText(`${profile?.res_district || ''}, ${profile?.res_state || ''}`) +
    '\n';

  if (profile?.res_gst_no)
    receipt += centerText(`GSTIN: ${profile.res_gst_no}`) + '\n';

  receipt += LINE + '\n';

  // Invoice Info

  receipt += formatRight('Invoice', invoice.invoice_no) + '\n';

  receipt += formatRight('Date', `${invoice.date} ${invoice.time}`) + '\n';

  if (invoice.customer_name)
    receipt += formatRight('Customer', invoice.customer_name) + '\n';

  if (invoice.customer_phone)
    receipt += formatRight('Phone', invoice.customer_phone) + '\n';

  if (invoice.customer_gst)
    receipt += formatRight('GSTIN', invoice.customer_gst) + '\n';

  receipt += LINE + '\n';

  // Table Header

  receipt += formatColumns('Item', 'QtyRate', 'Amount') + '\n';

  receipt += LINE + '\n';

  // Items

  invoice.menu_items?.forEach((item) => {
    const amount = item.qty * item.rate;
    const qtyRate = `${item.qty}x${item.rate}`;

    receipt += formatColumns(item.item, qtyRate, amount) + '\n';
  });

  receipt += LINE + '\n';

  // Totals

  receipt += formatRight('Subtotal', `Rs.${invoice.total_amount}`) + '\n';

  receipt += formatRight('GST', `Rs.${invoice.tax}`) + '\n';

  receipt += LINE + '\n';

  receipt += formatRight('TOTAL', `Rs.${invoice.payable_amount}`) + '\n';

  receipt += LINE + '\n';

  // Footer

  receipt += centerText('Thank you. Visit again.') + '\n\n\n';

  return receipt;
}

// =====================================================
// Kitchen Order Ticket (KOT)
// =====================================================

export function kotThermalReceipt(order) {
  if (!order) return '';

  let receipt = '';

  receipt += formatRight('KOT', order.order_id) + '\n';

  receipt += formatRight('Table No', order.table?.table_no) + '\n';

  receipt += formatRight('Date', `${order.date} ${order.time}`) + '\n';

  receipt += LINE + '\n';

  receipt += formatKOTColumns('Item', 'Qty') + '\n';

  receipt += LINE + '\n';

  order.food_items?.forEach((item) => {
    receipt += formatKOTColumns(item.item, item.qty) + '\n';
  });

  receipt += LINE + '\n';

  if (order?.notes) receipt += centerText(order.notes) + '\n';

  receipt += '\n\n\n';

  return receipt;
}
