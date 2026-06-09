# Bridge.defi

A production-ready, **non-custodial multi-chain crypto platform** built on
[MeneseSDK](https://caffeine.ai) on the Internet Computer.

Users authenticate with **Internet Identity** — no seed phrase. MeneseSDK
derives a wallet address on every supported chain from the user's identity, and
keys never leave the canister. Bridge.defi uses **Sign-and-Broadcast mode
only**: the canister signs transactions, and the browser broadcasts them
through configurable RPC endpoints. This is cheaper in cycles (no canister HTTP
outcalls) and faster than autonomous execution.

> Reference SDK examples this app is built on:
> [`sdk-setup.ts`](../frontend/sdk-setup.ts) and
> [`11-sign-and-broadcast.ts`](../frontend/11-sign-and-broadcast.ts).

## Stack

| Concern        | Choice                                            |
| -------------- | ------------------------------------------------- |
| Framework      | Next.js 15 (App Router, RSC)                      |
| Language       | TypeScript (strict, `noUncheckedIndexedAccess`)   |
| Styling        | TailwindCSS + shadcn/ui (new-york)                |
| Theming        | `next-themes` — dark mode default, light + system |
| Server state   | TanStack React Query                              |
| Client state   | Zustand (+ `persist`)                             |
| Chain access   | `@dfinity/agent` · `@dfinity/auth-client`         |
| QR codes       | `qrcode`                                          |
| Notifications  | `sonner`                                          |

## Features

1. **Receive** — pick any of the supported chains, view the derived address,
   copy it, scan a QR code. One EVM address covers Ethereum, Arbitrum, Base,
   Polygon, BNB Chain and Optimism.
2. **Send** — recipient + amount validation, a transaction preview, and full
   success/error handling. Signed on-canister, broadcast from the browser.
3. **Portfolio dashboard** — balances across all chains, total USD value, asset
   breakdown, and on-demand refresh.
4. **Transaction history** — every send is recorded locally (scoped per
   identity) with a live `pending → confirmed → failed` status.
5. **Settings** — per-chain RPC overrides, display preferences, canister health,
   and local-history management.

## Architecture

Feature-based folders. Cross-cutting concerns (`lib`, `store`, `components/ui`)
are shared; each feature owns its hooks + components.

```
src/
├── app/                      # Next.js routes
│   ├── dashboard/  receive/  send/  transactions/  settings/
│   ├── layout.tsx  providers.tsx  error.tsx  not-found.tsx
│   └── globals.css
├── components/
│   ├── ui/                   # shadcn primitives (button, card, dialog, …)
│   ├── layout/               # app-shell, sidebar, topbar, mobile-nav, theme-toggle
│   └── common/               # connect-button, chain-select, chain-icon,
│                             # copy-button, qr deps, error-boundary, require-auth
├── features/
│   ├── auth/                 # useAuth (Internet Identity)
│   ├── receive/              # useAddresses, ReceiveCard, QrCode
│   ├── send/                 # useSend, SendForm, TxPreview, SendResult
│   ├── portfolio/            # usePortfolio, usePrices, fetch-balances, summary, asset-list
│   ├── transactions/         # useTransactions, TxList, TxStats, StatusBadge
│   └── settings/             # RpcSettings, GeneralSettings, useCanisterHealth
├── lib/
│   ├── menese/               # MeneseSDK integration layer
│   │   ├── idl.ts            # Candid interface (addresses, balances, sign-only)
│   │   ├── actor.ts          # II auth + actor factory (cached)
│   │   ├── client.ts         # getAllAddresses / getAllBalances → domain types
│   │   ├── broadcast.ts      # Solana / EVM / XRP / SUI broadcasters
│   │   ├── types.ts          # strongly-typed service shapes
│   │   └── send/             # per-chain Sign-and-Broadcast strategies + dispatcher
│   ├── rpc/                  # configurable RPC service
│   │   ├── json-rpc.ts       # JSON-RPC client w/ timeout
│   │   ├── evm-rpc.ts        # balance / nonce / gas / broadcast (6 EVM chains)
│   │   └── chain-data.ts     # pre-sign data for Solana / XRP / SUI
│   ├── chains/registry.ts    # canonical chain metadata
│   ├── validation.ts  format.ts  prices.ts  utils.ts  query-keys.ts
├── store/                    # zustand: settings, transactions, auth
├── types/                    # ChainId, ChainMeta, TxRecord, ChainBalance
└── config/env.ts             # typed NEXT_PUBLIC_* config
```

### MeneseSDK integration layer

- `getAllAddresses()` → one round-trip for all chain addresses, mapped to
  `Record<ChainId, string>` (with the EVM address fanned out across all six EVM
  chains and the ICP principal slotted in).
- `getAllBalances()` → native balances for non-EVM chains. EVM balances are
  fetched per-chain through the RPC service, so a single dead RPC never blanks
  the whole portfolio.
- **Sign-and-Broadcast** strategies live in `lib/menese/send/`. Each one:
  1. reads fresh chain data via the app's own RPC,
  2. signs on the canister (`signSolTransferRelayer`,
     `buildAndSignEvmTxWithData`, `signXrpTransferRelayer`,
     `signSuiTransferRelayer`),
  3. broadcasts the signed transaction via the app's own RPC.

Adding a chain = write one strategy and register it in `send/index.ts`.

### RPC layer

`lib/rpc/evm-rpc.ts` is a configurable service covering **Ethereum, Arbitrum,
Base, Polygon, BSC, Optimism**. Endpoints resolve from the settings store
(user override → env default), so the same code path serves every chain — only
the URL and numeric chain id differ.

## Getting started

```bash
cd bridge-defi
npm install
cp .env.example .env.local   # adjust RPCs / canister as needed
npm run dev                  # http://localhost:3000
```

Then **Connect with Internet Identity** in the top-right.

### Scripts

| Script              | Purpose                       |
| ------------------- | ----------------------------- |
| `npm run dev`       | Start the dev server          |
| `npm run build`     | Production build              |
| `npm run start`     | Serve the production build    |
| `npm run lint`      | ESLint                        |
| `npm run typecheck` | `tsc --noEmit`                |

## Configuration

All config is `NEXT_PUBLIC_*` (the app is fully client-side). See
[`.env.example`](./.env.example). Key variables:

- `NEXT_PUBLIC_MENESE_CANISTER_ID` — defaults to the production mainnet canister
  `urs2a-ziaaa-aaaad-aembq-cai`.
- `NEXT_PUBLIC_RPC_*` — per-chain RPC endpoints. Public endpoints work for
  evaluation; use private providers (Alchemy / Infura / QuickNode / Helius) in
  production for reliable nonce/gas reads and broadcasts. These can also be
  overridden at runtime on the **Settings** page.

## Notes & scope

- **Sending** is wired for the EVM family, Solana, XRP and SUI (native assets).
  Every other MeneseSDK chain shows addresses and balances today; enabling a
  send is a matter of adding its strategy — the architecture is in place and
  `sendSupported` in the chain registry gates the Send selector accordingly.
- Native transfers reserve gas at sign time; the **Max** button fills the full
  balance, so reduce slightly on EVM/SOL to leave room for fees.
- Transaction records are stored in `localStorage`, scoped per Internet Identity
  principal. On-chain history is always authoritative — use the explorer links.

## Security model

- Private keys are derived and held **inside the MeneseSDK canister**; this app
  never sees them.
- The app only ever signs (on-canister) and broadcasts (from the browser). It
  performs no autonomous canister execution.
- Recipient addresses are format-validated per chain before signing; the
  canister/RPC is the final authority and will reject a malformed transaction.
