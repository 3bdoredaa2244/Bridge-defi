/**
 * Broadcast helpers — the "Broadcast" half of Sign-and-Broadcast.
 *
 * After the canister returns a signed transaction, Bridge.defi submits it to
 * the target chain through its own RPC endpoints. Each function throws on an
 * RPC-level error and returns the resulting on-chain hash/signature.
 */

interface JsonRpcResponse<T> {
  result?: T;
  error?: { code: number; message: string };
}

async function rpcCall<T>(rpcUrl: string, body: unknown): Promise<T> {
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`RPC HTTP ${res.status} from ${rpcUrl}`);
  }
  const json = (await res.json()) as JsonRpcResponse<T>;
  if (json.error) {
    throw new Error(`RPC error: ${json.error.message}`);
  }
  if (json.result === undefined) {
    throw new Error("RPC returned no result");
  }
  return json.result;
}

/** Broadcast a base64-encoded signed Solana transaction. Returns the signature. */
export async function broadcastSolana(
  signedTxBase64: string,
  rpcUrl: string,
): Promise<string> {
  return rpcCall<string>(rpcUrl, {
    jsonrpc: "2.0",
    id: 1,
    method: "sendTransaction",
    params: [signedTxBase64, { encoding: "base64", skipPreflight: false }],
  });
}

/** Broadcast a raw signed EVM transaction (hex). Returns the tx hash. */
export async function broadcastEvm(
  signedTxHex: string,
  rpcUrl: string,
): Promise<string> {
  const hex = signedTxHex.startsWith("0x") ? signedTxHex : `0x${signedTxHex}`;
  return rpcCall<string>(rpcUrl, {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_sendRawTransaction",
    params: [hex],
  });
}

/** Submit a signed XRP transaction blob. Returns the tx hash. */
export async function broadcastXrp(
  signedTxHex: string,
  txHash: string,
  rpcUrl: string,
): Promise<string> {
  const result = await rpcCall<{
    engine_result: string;
    engine_result_message: string;
  }>(rpcUrl, {
    method: "submit",
    params: [{ tx_blob: signedTxHex }],
  });
  // tesSUCCESS / terQUEUED are acceptable provisional results.
  if (!result.engine_result.startsWith("tes") && !result.engine_result.startsWith("ter")) {
    throw new Error(`XRP submit failed: ${result.engine_result_message}`);
  }
  return txHash;
}

/** Execute a signed SUI transaction block. Returns the tx digest. */
export async function broadcastSui(
  txBytesBase64: string,
  signatureBase64: string,
  rpcUrl: string,
): Promise<string> {
  const result = await rpcCall<{
    digest: string;
    effects?: { status?: { status: string; error?: string } };
  }>(rpcUrl, {
    jsonrpc: "2.0",
    id: 1,
    method: "sui_executeTransactionBlock",
    params: [
      txBytesBase64,
      [signatureBase64],
      { showEffects: true },
      "WaitForLocalExecution",
    ],
  });
  if (result.effects?.status?.status !== "success") {
    throw new Error(
      `SUI execution failed: ${result.effects?.status?.error ?? "unknown"}`,
    );
  }
  return result.digest;
}
