# Stack
- Node.js CommonJS app using Express 4 and body-parser; `server.js` serves `public/` and mounts API routers.
- Persistent application data is JSON in `data/db.json`, accessed by `lib/store.js`.

# Module map
- `routes/customers.js` — customer list and Khata settlement endpoints.
- `routes/orders.js` — order list/detail/create/cancel endpoints.
- `routes/products.js` — product catalog and active coupon endpoints.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and admin export endpoints.
- `lib/coupons.js` — normalize, look up, validate, calculate, and list coupons.
- `lib/dates.js` — today, date-key normalization, and fiscal-year helpers.
- `lib/inventory.js` — product lookup, sellable stock, stock checks/reservation/release, inventory summary.
- `lib/invoice.js` — calculate printable invoice figures and render invoice HTML.
- `lib/ledger.js` — customer lookup/listing, Khata charges/reversals, and settlements.
- `lib/orders.js` — add, get, cancel, and filter/list orders.
- `lib/pricing.js` — subtotal, coupon discount, and checkout totals with line GST.
- `lib/reports.js` — dashboard summary and invoice/order GST reconciliation.
- `lib/store.js` — read/write `data/db.json` and append audit entries.
- `lib/tax.js` — resolve GST rate and split tax into CGST/SGST.

# Commands
- Start the app: `node server.js` (`npm start` is also defined in `package.json`).
- Run tests with Node's test runner: `node --test`.
- `package.json` currently defines a placeholder `npm test` script that exits with “no test specified”.

# Rules
1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; they use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

# Current ticket
Invoice total and GST breakdown do not match what the customer was billed.
Allowed files: `lib/invoice.js` (`lib/tax.js` only if truly needed).
