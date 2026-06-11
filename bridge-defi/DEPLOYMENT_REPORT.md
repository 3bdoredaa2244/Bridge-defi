# Bridge.defi — ICP Deployment Report

## ==================================
## DEPLOYMENT REPORT
## ==================================

| Field                | Value                                                          |
| -------------------- | -------------------------------------------------------------- |
| Developer Principal  | `jfw4c-bygbv-tuhu7-mil7q-kxptr-kew2z-hkeq4-doghm-rnkwz-mlujo-fqe` |
| Frontend Canister ID | `uxrrr-q7777-77774-qaaaq-cai`                                  |
| Frontend URL         | `http://uxrrr-q7777-77774-qaaaq-cai.localhost:4943/`           |
| Legacy URL           | `http://127.0.0.1:4943/?canisterId=uxrrr-q7777-77774-qaaaq-cai` |
| DFX Identity         | `default`                                                      |
| Network              | `local` (dfx 0.29.1 replica, in WSL Ubuntu 24.04)              |
| Local wallet canister| `uqqxf-5h777-77774-qaaaa-cai`                                  |
| Deployment Status    | **SUCCESS**                                                    |

Verification: `GET /` → `200`, `<title>Bridge.defi — Multi-chain wallet</title>`,
`GET /dashboard/` → `200`, canister `Status: Running`, memory ≈ 5.43 MB.

---

## What was changed to make this deployable

1. **`next.config.mjs`** — added `output: "export"`, `images.unoptimized: true`,
   `trailingSlash: true` so Next emits a fully static `out/` with clean
   `route/index.html` URLs the asset canister can serve directly.
2. **`src/app/page.tsx`** — replaced the server-side `redirect()` (illegal under
   static export) with a client-side `router.replace("/dashboard")`.
3. **`dfx.json`** — declared an `assets`-type canister `bridge_defi_frontend`
   with `source: ["out"]`, plus `local` and `ic` network definitions.
4. **`public/.ic-assets.json5`** — caching + security headers (copied into
   `out/` on build).
5. **`scripts/deploy.sh`** + npm scripts (`dfx:start`, `dfx:deploy:local`,
   `dfx:deploy:ic`).

## Reproduce

```bash
# from Windows, dfx runs in WSL:
wsl bash -lc "cd /mnt/e/work/menese/bridge-defi && dfx start --clean --background"
npm run build                       # Windows — produces out/
wsl bash -lc "cd /mnt/e/work/menese/bridge-defi && dfx deploy bridge_defi_frontend --network local"
```

## Mainnet (production) deployment

The local canister ID above is a real, working asset canister but lives on your
local replica. To publish to the IC mainnet:

```bash
# 1. Use an identity funded with cycles (or convert ICP via the cycles ledger)
dfx identity use default
# 2. Deploy to the IC network
npm run build
dfx deploy bridge_defi_frontend --network ic
# 3. Live URL → https://<canister-id>.icp0.io
```

Mainnet requires **cycles** (≈ a fraction of a TC for an asset canister). If the
deploy reports an empty cycles balance, top up via
`dfx cycles convert --amount <ICP>` or a cycles-faucet coupon, then re-run.

---

## Is the Frontend Canister ID enough for MeneseSDK registration?

**No — the frontend asset canister ID is not what MeneseSDK registers, and on
its own it is not sufficient.** Two separate concerns:

- **Hosting (done here).** `bridge_defi_frontend` is a pure **asset canister**:
  it stores and serves the static UI. It contains no Motoko/Rust logic and
  cannot call MeneseSDK, hold a developer key, or pay for actions.

- **MeneseSDK billing identity.** MeneseSDK's `registerDeveloperCanister(principal, appName)`
  associates a **caller principal** with a developer account and issues an
  `msk_*` key. In the current Bridge.defi design the app runs **client-side**
  and each user authenticates with **their own Internet Identity**, so SDK
  calls are made and metered against the **logged-in user's principal** — no
  app-owned backend canister is required for the wallet to function.

### So what do you actually register?

| Use case                                                                 | What to register                                  | Need a backend canister? |
| ------------------------------------------------------------------------ | ------------------------------------------------- | ------------------------ |
| Current design — each user pays with their own Internet Identity         | Nothing app-side; the **user principal** is the caller | No                       |
| You want **app-sponsored** actions (you pay, server-side automation, cron, agent flows, a shared `msk_*` key) | A dedicated **backend canister principal** via `registerDeveloperCanister` | **Yes**                  |

**Recommendation for your manager:** the Frontend Canister ID
(`uxrrr-q7777-77774-qaaaq-cai` locally; a `…icp0.io` ID once on mainnet) covers
**hosting**. If/when Bridge.defi needs to sponsor user transactions, run
server-side strategies, or hold a single developer key, add a small **backend
canister** and register *its* principal with MeneseSDK — that backend principal,
not the asset canister, becomes the MeneseSDK developer identity.
