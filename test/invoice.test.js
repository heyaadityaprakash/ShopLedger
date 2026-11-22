'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

function order(id, items, coupon) {
  return { id, items, coupon };
}

// These fixtures are in-memory snapshots modeled on db.json order IDs.
// gstRate is omitted because stored order lines have price/qty/hsn and invoice.js falls back to config.tax.defaultRate.
const cases = [
  {
    name: 'CURRENT BEHAVIOUR: #1001 uses HSN GST slabs with no coupon',
    order: order(1001, [
      { id: 8, name: 'Assam CTC Masala Chai 250g', sku: 'BEV-001', hsn: '0902', price: 140, qty: 2 },
      { id: 2, name: 'Unpolished Toor Dal 1kg', sku: 'GRN-002', hsn: '0713', price: 165, qty: 2 }
    ], ''),
    expected: { subtotal: 610, discount: 0, tax: 66.9, cgst: 33.45, sgst: 33.45, total: 676.9, gst: [18, 5] }
  },
  {
    name: 'CURRENT BEHAVIOUR: #1002 SAVE10 uses subtotal discount before GST',
    order: order(1002, [
      { id: 1, name: 'Indrayani Basmati Rice 5kg', sku: 'GRN-001', hsn: '1006', price: 640, qty: 1 },
      { id: 4, name: 'Cold-Pressed Sunflower Oil 1L', sku: 'OIL-001', hsn: '1512', price: 190, qty: 2 }
    ], 'SAVE10'),
    expected: { subtotal: 1020, discount: 102, tax: 45.9, cgst: 22.95, sgst: 22.95, total: 963.9, gst: [5, 5] }
  },
  {
    name: 'CURRENT BEHAVIOUR: #1004 SAVE10 applies checkout discount cap',
    order: order(1004, [
      { id: 5, name: 'Cold-Pressed Groundnut Oil 5L', sku: 'OIL-002', hsn: '1508', price: 1120, qty: 2 }
    ], 'SAVE10'),
    expected: { subtotal: 2240, discount: 150, tax: 104.5, cgst: 52.25, sgst: 52.25, total: 2194.5, gst: [5] }
  },
  {
    name: 'CURRENT BEHAVIOUR: #1008 all 18% lines and no coupon',
    order: order(1008, [
      { id: 8, name: 'Assam CTC Masala Chai 250g', sku: 'BEV-001', hsn: '0902', price: 140, qty: 1 },
      { id: 12, name: 'Kokum Sherbet Concentrate 750ml', sku: 'BEV-003', hsn: '2106', price: 180, qty: 2 }
    ], ''),
    expected: { subtotal: 500, discount: 0, tax: 90, cgst: 45, sgst: 45, total: 590, gst: [18, 18] }
  }
];

for (const fixture of cases) {
  test(fixture.name, () => {
    const invoiceFigures = invoice.computeInvoiceFigures(fixture.order);
    const checkoutFigures = pricing.computeTotals(fixture.order.items, fixture.order.coupon);

    assert.deepEqual({
      subtotal: invoiceFigures.subtotal,
      discount: invoiceFigures.discount,
      tax: invoiceFigures.tax,
      cgst: invoiceFigures.cgst,
      sgst: invoiceFigures.sgst,
      total: invoiceFigures.total,
      gst: invoiceFigures.rows.map(row => row.gstPercent)
    }, fixture.expected);

    // Keep checkout calculation observable alongside the invoice snapshot.
    assert.equal(typeof checkoutFigures.total, 'number');
  });
}


