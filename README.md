# Fathom — Simple Net Worth

A lightweight React + Vite net-worth tracker. It intentionally avoids the original project's TanStack Start, middleware, authentication framework, database migrations, and server build pipeline so it is easier to deploy on Vercel.

## Features
- Add and delete asset or liability accounts
- Edit balances directly
- Net worth, total assets, and total liabilities update automatically
- Simple asset/liability breakdown
- Saves data in this browser using localStorage
- Export and import a JSON backup
- Load demo data or clear the ledger
- Responsive layout for phone and desktop

## Run locally
Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

## Deploy on Vercel
1. Put the contents of this folder in the root of a GitHub repository.
2. Import that repository into Vercel.
3. Framework preset: Vite (or let Vercel detect it).
4. Build command: `npm run build`
5. Output directory: `dist`
6. Install command: `npm install`

No environment variables or database are needed for this starter.

## Important data note
This version stores data only in the current browser/device. It has no account login and does not sync data between devices. Use Export backup regularly. If you need secure login and shared cross-device data, connect a hosted database such as Supabase in a separate step; do not put database secrets in frontend code.
