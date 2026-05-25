import { ethers } from 'ethers';
import {
  TxDetail,
  EventLog,
  AbiItem,
} from '../types';

async function rpcCall(rpcUrl: string, method: string, params: unknown[]): Promise<unknown> {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }),
  });

  if (!res.ok) {
    throw new Error(`RPC error: HTTP ${res.status} — 请检查 RPC URL 是否正确。当前 RPC: ${rpcUrl}`);
  }

  const json = await res.json();
  if (json.error) {
    throw new Error(`RPC error: ${json.error.message}`);
  }

  return json.result;
}

export async function getTxDetail(
  txHash: string,
  rpcUrl: string,
): Promise<TxDetail> {
  const r = await rpcCall(rpcUrl, 'eth_getTransactionByHash', [txHash]) as Record<string, string>;

  if (!r) {
    throw new Error('Transaction not found. Check the tx hash.');
  }

  return {
    hash: r.hash,
    from: r.from,
    to: r.to ?? null,
    value: r.value ?? '0x0',
    gas: r.gas ?? '0x0',
    gasPrice: r.gasPrice ?? '0x0',
    nonce: r.nonce ?? '0x0',
    input: r.input ?? '0x',
    blockNumber: r.blockNumber ?? '0x0',
    blockHash: r.blockHash ?? '',
    transactionIndex: r.transactionIndex ?? '0x0',
  };
}

export async function getEventLogs(
  txHash: string,
  rpcUrl: string,
): Promise<EventLog[]> {
  const receipt = await rpcCall(rpcUrl, 'eth_getTransactionReceipt', [txHash]) as Record<string, unknown> | null;

  if (!receipt) {
    return [];
  }

  const logs = receipt.logs;
  if (!Array.isArray(logs)) {
    return [];
  }

  return logs.map(
    (log: Record<string, string>) => ({
      address: log.address,
      topics: log.topics as unknown as string[] ?? [],
      data: log.data ?? '0x',
      blockNumber: log.blockNumber,
      transactionHash: log.transactionHash,
      logIndex: log.logIndex,
    }),
  );
}

function decodeLogs(logs: EventLog[], abi: AbiItem[]): EventLog[] {
  try {
    const iface = new ethers.Interface(abi);
    return logs.map((log) => {
      try {
        const parsed = iface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });
        if (parsed) {
          const params: Record<string, unknown> = {};
          for (const [key, val] of parsed.args.entries() as Iterable<[string, unknown]>) {
            params[key] = String(val);
          }
          return {
            ...log,
            decoded: { name: parsed.name, params },
          };
        }
      } catch {
        // event not in this ABI
      }
      return { ...log, decoded: null };
    });
  } catch {
    return logs.map((log) => ({ ...log, decoded: null }));
  }
}

export async function getContractABI(
  contractAddress: string,
  etherscanKey: string,
): Promise<AbiItem[] | null> {
  try {
    const url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${etherscanKey}`;
    const res = await fetch(url);
    const json = await res.json();

    if (json.status === '0') return null;
    return JSON.parse(json.result);
  } catch {
    return null;
  }
}

function decodeTxInput(input: string, abi: AbiItem[]): {
  name: string;
  params: Record<string, unknown>;
} | null {
  if (input === '0x' || input === '0x0') return null;

  try {
    const iface = new ethers.Interface(abi);
    const parsed = iface.parseTransaction({ data: input });
    if (parsed) {
      const params: Record<string, unknown> = {};
      for (const [key, val] of parsed.args.entries() as Iterable<[string, unknown]>) {
        params[key] = String(val);
      }
      return { name: parsed.name, params };
    }
  } catch {
    // input doesn't match any ABI function
  }
  return null;
}

export interface FetchResult {
  context: {
    txHash: string;
    txDetail: TxDetail;
    eventLogs: EventLog[];
    contractABI: AbiItem[] | null;
    manualABI: boolean;
    decodedInput: { name: string; params: Record<string, unknown> } | null;
  };
}

export async function fetchTxData(
  txHash: string,
  rpcUrl: string,
  etherscanKey: string,
  manualABIJson?: string,
): Promise<FetchResult> {
  const txDetail = await getTxDetail(txHash, rpcUrl);

  const [eventLogs, contractABI] = await Promise.all([
    getEventLogs(txHash, rpcUrl),
    txDetail.to && etherscanKey ? getContractABI(txDetail.to, etherscanKey) : Promise.resolve(null),
  ]);

  let abi = contractABI;
  let manualABI = false;

  if (manualABIJson) {
    try {
      abi = JSON.parse(manualABIJson);
      manualABI = true;
    } catch {
      throw new Error('Manual ABI is not valid JSON.');
    }
  }

  const decodedLogs = abi ? decodeLogs(eventLogs, abi) : eventLogs;
  const decodedInput = abi ? decodeTxInput(txDetail.input, abi) : null;

  return {
    context: {
      txHash,
      txDetail,
      eventLogs: decodedLogs,
      contractABI: abi,
      manualABI,
      decodedInput,
    },
  };
}
