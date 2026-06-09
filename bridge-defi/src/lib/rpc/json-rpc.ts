/**
 * Minimal JSON-RPC client with timeout. Shared by the EVM and chain-data
 * services so we don't pull in a heavy web3 library for a handful of calls.
 */

export interface JsonRpcError {
  code: number;
  message: string;
}

export class RpcRequestError extends Error {
  constructor(
    message: string,
    readonly rpcUrl: string,
    readonly method: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "RpcRequestError";
  }
}

const DEFAULT_TIMEOUT_MS = 15_000;

export async function jsonRpc<T>(
  rpcUrl: string,
  method: string,
  params: unknown[] = [],
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  if (!rpcUrl) {
    throw new RpcRequestError("No RPC endpoint configured", rpcUrl, method);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new RpcRequestError(`HTTP ${res.status}`, rpcUrl, method);
    }
    const json = (await res.json()) as { result?: T; error?: JsonRpcError };
    if (json.error) {
      throw new RpcRequestError(json.error.message, rpcUrl, method);
    }
    if (json.result === undefined) {
      throw new RpcRequestError("Empty result", rpcUrl, method);
    }
    return json.result;
  } catch (err) {
    if (err instanceof RpcRequestError) throw err;
    const message =
      err instanceof DOMException && err.name === "AbortError"
        ? `Timed out after ${timeoutMs}ms`
        : err instanceof Error
          ? err.message
          : "Unknown RPC error";
    throw new RpcRequestError(message, rpcUrl, method, err);
  } finally {
    clearTimeout(timer);
  }
}
